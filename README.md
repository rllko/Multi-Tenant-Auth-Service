# Authio – Prototype

**Authio** is a multi-tenant SaaS platform designed for secure license and session management.

This is a personal side project — contributions and pull requests are welcome!

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

> If you intend to run this on a VM, deployment is as simple as uploading the project to your VPS and configuring the files provided [here](https://github.com/rllko/Multi-Tenant-Auth-Service/releases).

---

## External Database (Optional)

If you prefer running Authio with an external PostgreSQL database, execute the following SQL commands:

```sql
CREATE USER authio_serilog WITH PASSWORD 'authio.24';
CREATE DATABASE activity_logs;

GRANT ALL PRIVILEGES ON DATABASE activity_logs TO authio_serilog;

\c activity_logs

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authio_serilog;
GRANT USAGE, CREATE ON SCHEMA public TO authio_serilog;
```

> ⚠️ Be sure to replace hardcoded credentials in production environments.