# Authio – Prototype[WIP]

**Authio** is a multi-tenant SaaS platform designed for secure license and session management.

**Update:** in a rush i tried to make a frontend, ended up trying to use AI to speedup the development but its still unfinished. If you're interested you can always check out the old auth [here](https://github.com/rllko/Multi-Tenant-Auth-Service/tree/6dd760773f648f1f214d2a4ecdfe3522a5d57eef)  for the backend without any frontend slop.

This is a personal side project where i took my old license authentication sytem and tried to implement a multi tenancy architecture.
The old auth that can be found here. Contributions and pull requests are welcome!

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

### 4. First Login

The database migrations seed a bootstrap admin tenant so you can log in out-of-the-box:

- **Email:** `admin@authio.com`
- **Password:** `admin123`

This account is the Team Owner of the seeded `test` team.

> Change the password or remove this account before deploying to production.

---

## External Database (Optional)

If you prefer running Authio with an external PostgreSQL database, execute the following SQL commands to setup the logger:

```sql
CREATE USER authio_serilog WITH PASSWORD 'authio.24';
CREATE DATABASE activity_logs;

GRANT ALL PRIVILEGES ON DATABASE activity_logs TO authio_serilog;

\c activity_logs

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authio_serilog;
GRANT USAGE, CREATE ON SCHEMA public TO authio_serilog;
```

> Be sure to replace hardcoded credentials in production environments and setup the admin password after running the migration.
