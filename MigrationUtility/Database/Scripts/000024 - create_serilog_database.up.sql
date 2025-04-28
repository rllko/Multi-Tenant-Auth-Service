CREATE USER authio_serilog WITH PASSWORD 'authio.24';
CREATE DATABASE serilog;
GRANT ALL PRIVILEGES ON DATABASE serilog TO authio_serilog;
