CREATE TABLE IF NOT EXISTS licenses
(
    id               BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 10 INCREMENT BY 69) PRIMARY KEY,
    value            UUID      DEFAULT gen_random_uuid(),
    discordId        BIGINT REFERENCES discords (discord_id) ON DELETE CASCADE,
    max_sessions     SMALLINT  DEFAULT 1,
    email            varchar(64) UNIQUE,
    username         text UNIQUE,
    creation_date    TIMESTAMP DEFAULT NOW(),
    password         text      DEFAULT NULL,
    RemainingSeconds BIGINT    NOT NULL,
    LastStartedAt    TIMESTAMP NULL,
    activated        BOOL      default false
);

CREATE OR REPLACE FUNCTION subtract_hours()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NEW.RemainingSeconds = -1 THEN
        RETURN NEW;
    END IF;

    -- update RemainingSeconds based on the difference between the current time and LastStartedAt
    NEW.RemainingSeconds := NEW.RemainingSeconds - EXTRACT(EPOCH FROM (NOW() - NEW.LastStartedAt));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE UNIQUE INDEX IF NOT EXISTS value_index on licenses (value);
CREATE UNIQUE INDEX IF NOT EXISTS login_index on licenses (email, password);
CREATE UNIQUE INDEX IF NOT EXISTS login_index on licenses (username);

