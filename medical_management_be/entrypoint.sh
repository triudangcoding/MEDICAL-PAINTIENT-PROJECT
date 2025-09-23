#!/bin/sh
set -e

echo "Starting application..."

# Wait for database to be ready
echo "Waiting for database connection..."
while ! yarn prisma db ping > /dev/null 2>&1; do
  echo "Database not ready yet, waiting..."
  sleep 2
done

# Push database schema (if needed)
echo "Setting up database schema..."
yarn prisma db push --accept-data-loss

# Start the application
echo "Application is starting..."
exec node dist/main.js 