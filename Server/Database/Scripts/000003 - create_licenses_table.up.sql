CREATE TABLE IF NOT EXISTS licenses
(
    id             BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 10 INCREMENT BY 69) PRIMARY KEY,
    value          UUID     DEFAULT gen_random_uuid(),
    discordId      BIGINT REFERENCES discords (discord_id) ON DELETE CASCADE,
    max_sessions   SMALLINT DEFAULT 1,
    email          varchar(64) UNIQUE,
    username       text UNIQUE,
    creation_date  bigint NOT NULL,
    password       text     DEFAULT NULL,
    activated_at   bigint,
    expires_at     BIGINT NOT NULL,
    last_paused_at timestamp,
    paused         BOOL,
    activated      BOOL     default false
);
CREATE UNIQUE INDEX IF NOT EXISTS value_index on licenses (value);
CREATE UNIQUE INDEX IF NOT EXISTS login_index on licenses (email, password);
CREATE UNIQUE INDEX IF NOT EXISTS login_index on licenses (username);

