CREATE TABLE IF NOT EXISTS licenses
(
    id             BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 10 INCREMENT BY 69) PRIMARY KEY,
    value          UUID         DEFAULT gen_random_uuid(),
    discordId      BIGINT,
    max_sessions   SMALLINT     DEFAULT 1,
    email          varchar(64),
    username       VARCHAR(255) UNIQUE,
    creation_date  bigint                            NOT NULL,
    password       VARCHAR(255) DEFAULT NULL,
    activated_at   bigint,
    expires_at     BIGINT                            NOT NULL,
    last_paused_at bigint,
    paused         BOOL,
    activated      BOOL         default false,
    application    UUID references applications (id) NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS value_index on licenses (value);
CREATE UNIQUE INDEX IF NOT EXISTS login_index on licenses (email, password);
CREATE UNIQUE INDEX IF NOT EXISTS login_index on licenses (username);
