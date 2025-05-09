CREATE TABLE IF NOT EXISTS user_sessions
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token UUID UNIQUE      DEFAULT gen_random_uuid(),
    hwid          BIGINT REFERENCES hwids (id) ON DELETE CASCADE,
    license_id    BIGINT NOT NULL REFERENCES licenses (id) ON DELETE CASCADE,
    ip_address    VARCHAR(50),
    created_at    BIGINT NOT NULL,
    refreshed_at  BIGINT           DEFAULT NULL,
    is_active     BOOLEAN          DEFAULT TRUE, -- Add this for easy session invalidation, on logout disable
    application   UUID references applications(id) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS access_token_index on user_sessions (session_token);