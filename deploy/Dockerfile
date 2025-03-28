# Use the public.ecr.aws BuildKit image
FROM public.ecr.aws/vend/moby/buildkit:buildx-stable-1 AS buildkit

# Stage 1: Install dependencies and build application
FROM public.ecr.aws/docker/library/node:22-alpine AS builder

RUN apk add --no-cache \
    libc6-compat \
    openssl

WORKDIR /app

# Optionally bust the cache to force a rebuild of the following steps
ARG CACHEBUST

# Install dependencies
COPY package.json package-lock.json tsconfig.json tsconfig.build.json ./

# Copy application source files, prisma files, and seed data
COPY src/ ./src
COPY prisma/ ./prisma

RUN npm install

# Set the docker build args into environment variables on runner.
ARG STAGE
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Note: the CodeBuild project must be configured to be on the VPC.
# Run the migrations for the database
# RUN npm run migrate:deploy

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
# Install only production dependencies
RUN npm ci --only=production

# Copy only necessary files to the runtime image
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Copy the entrypoint script and ensure it's executable
COPY deploy/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set the NODE_ENV to production
ENV NODE_ENV=production

# Use the entrypoint script as the container's entrypoint
ENTRYPOINT [ "/app/entrypoint.sh" ]