#!/bin/bash
set -e
# https://github.com/docker-library/postgres/discussions/1152
psql -v ON_ERROR_STOP=0 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER authio_serilog WITH PASSWORD 'authio.24'; 
    CREATE DATABASE activity_logs;  
    GRANT ALL PRIVILEGES ON DATABASE activity_logs TO authio_serilog;
EOSQL


psql -U "$POSTGRES_USER" -d activity_logs <<-EOSQL
  CREATE SCHEMA activity_logs AUTHORIZATION authio_serilog;
EOSQL