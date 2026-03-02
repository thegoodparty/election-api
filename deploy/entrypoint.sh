#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting the application..."
exec node -r ./dist/src/otel.js dist/src/main.js