CREATE TABLE IF NOT EXISTS user_sessions
(
    session_token UUID UNIQUE DEFAULT gen_random_uuid() primary key,
    hwid          BIGINT NOT NULL REFERENCES hwids (id) ON DELETE CASCADE,
    license_id    BIGINT NOT NULL REFERENCES licenses (id) ON DELETE CASCADE,
    ip_address    VARCHAR(50),
    created_at    TIMESTAMP   DEFAULT NOW(),
    refreshed_at  TIMESTAMP   DEFAULT NULL,
    is_active     BOOLEAN     DEFAULT TRUE
);

CREATE UNIQUE INDEX IF NOT EXISTS access_token_index on user_sessions (session_token);