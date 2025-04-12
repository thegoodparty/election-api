# Use the public.ecr.aws BuildKit image
FROM public.ecr.aws/vend/moby/buildkit:buildx-stable-1 AS buildkit

# Stage 1: Install dependencies and build application
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

RUN apk add --no-cache \
    libc6-compat \
    openssl \
    python3 \
    make \
    g++ \
    gcc \
    postgresql-dev \
    postgresql-client \
    linux-headers \
    musl-dev \
    bash \
    git \
    curl \
    autoconf \
    automake \
    libtool \
    pkgconfig

# Set Python path and other build variables
ENV PYTHON=/usr/bin/python3
ENV PYTHONPATH=/usr/lib/python3.10/site-packages
ENV NODE_OPTIONS="--max-old-space-size=4096"
# Prevent Puppeteer from downloading Chrome
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/dev/null

WORKDIR /app

# Optionally bust the cache to force a rebuild of the following steps
ARG CACHEBUST

# Install dependencies
COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./

# Copy application source files, prisma files, and seed data
COPY src/ ./src
COPY prisma/ ./prisma

# Clear npm cache and install dependencies with --ignore-scripts
RUN npm cache clean --force && \
    npm install --build-from-source --ignore-scripts

# Set the docker build args into environment variables on runner.
ARG STAGE
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Generate Prisma client
RUN npm run generate

# Build the application (output in /dist)
RUN npm run build

# Stage 2: Create a minimal runtime image
FROM public.ecr.aws/docker/library/node:22-alpine

RUN apk add --no-cache \
    libc6-compat \
    openssl

WORKDIR /app

# Copy package files for production dependencies
COPY package.json package-lock.json ./
# Install only production dependencies with --ignore-scripts
RUN npm ci --only=production --ignore-scripts

# Copy only necessary files to the runtime image
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY module-alias.js ./

# Copy the entrypoint script and ensure it's executable
COPY deploy/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set the NODE_ENV to production
ENV NODE_ENV=production

# Use the entrypoint script as the container's entrypoint
ENTRYPOINT [ "/app/entrypoint.sh" ]