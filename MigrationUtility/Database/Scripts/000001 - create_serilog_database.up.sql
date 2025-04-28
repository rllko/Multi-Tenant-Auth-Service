CREATE USER authio_serilog WITH PASSWORD 'authio.24';
CREATE DATABASE activity_logs;

SET schema 'activity_logs';

GRANT ALL PRIVILEGES ON DATABASE activity_logs TO authio_serilog;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authio_serilog;
GRANT USAGE, CREATE ON SCHEMA public TO authio_serilog;

