#!/bin/sh

# Test environment Docker entrypoint script - wait for database and run tests

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}SQL-Arena Test Environment Starting...${NC}"

# Wait for PostgreSQL database to be ready
echo -e "${YELLOW}Waiting for PostgreSQL test database...${NC}"
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  echo -e "${RED}Test database is unavailable - sleeping${NC}"
  sleep 2
done

echo -e "${GREEN}Test database is ready!${NC}"

# Wait for database to fully initialize
echo -e "${YELLOW}Waiting for database to fully initialize...${NC}"
sleep 3

# In test environment, set up test database schema
echo -e "${YELLOW}Setting up test database schema...${NC}"
if npm run migrate:up; then
  echo -e "${GREEN}Database migrations completed successfully!${NC}"
else
  echo -e "${RED}Database migration failed!${NC}"
  exit 1
fi

# Run tests
echo -e "${GREEN}Running tests...${NC}"
exec npm test
