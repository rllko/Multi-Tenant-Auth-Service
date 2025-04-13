CREATE TABLE IF NOT EXISTS tenants
(
    id             BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 10 INCREMENT BY 69) PRIMARY KEY,
    discordId      BIGINT REFERENCES discords (discord_id) ON DELETE CASCADE,
    email          varchar(64),
    name       text UNIQUE,
    creation_date  bigint NOT NULL,
    password       text     DEFAULT NULL,
    activated_at   bigint
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_login_index on licenses (email, password);
