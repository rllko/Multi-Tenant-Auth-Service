CREATE TABLE IF NOT EXISTS tenants
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discordId     BIGINT,
    email         varchar(64),
    name          VARCHAR(255) UNIQUE,
    creation_date timestamp        DEFAULT NOW(),
    password      VARCHAR(255)     DEFAULT NULL,
    activated_at  timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_login_index on tenants (email, password);