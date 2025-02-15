CREATE TABLE licenses
(
    id              BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 10 INCREMENT BY 69) PRIMARY KEY,
    value           UUID      DEFAULT gen_random_uuid(),
    discord         BIGINT REFERENCES discords (discord_id) ON DELETE CASCADE,
    max_sessions    SMALLINT  DEFAULT 1,
    creation_date   TIMESTAMP DEFAULT NOW(),
    expiration_date TIMESTAMP DEFAULT NULL,
    activated       BOOL GENERATED ALWAYS AS (discord IS NOT NULL) STORED
);

CREATE UNIQUE INDEX IF NOT EXISTS value_index on licenses (value);