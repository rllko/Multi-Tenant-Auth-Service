# Authio - Prototype

**Authio** is a multi-tenant SaaS platform designed for secure license and session management.

---

## Development Setup

### 1. Prerequisites

Ensure the following services are available:

- PostgreSQL server
- Redis server

> These services, along with NGINX, are included in the `docker-compose.yml` file to simplify local development.

### 2. Configuration

Create a `.env` file based on the provided `.env.example`:

```bash
cp .env.example .env
```

### 3. Start the Services
To spin up the stack using Docker:
```bash
docker compose up
```

### External Database (optional)
If you prefer running with an external PostgreSQL database, run the following SQL commands:
```sql
CREATE USER authio_serilog WITH PASSWORD 'authio.24';
CREATE DATABASE activity_logs;

GRANT ALL PRIVILEGES ON DATABASE activity_logs TO authio_serilog;

\c activity_logs

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authio_serilog;
GRANT USAGE, CREATE ON SCHEMA public TO authio_serilog;

```
> Replace hardcoded credentials in production environments.