CREATE TABLE IF NOT EXISTS tenants
(
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discordId      BIGINT REFERENCES discords (discord_id) ON DELETE CASCADE,
    email          varchar(64),
    name           text UNIQUE,
    creation_date  bigint NOT NULL,
    password       text     DEFAULT NULL,
    activated_at   bigint
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_login_index on tenants (email, password);