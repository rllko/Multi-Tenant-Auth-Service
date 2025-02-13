CREATE TABLE user_sessions
(
    id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    authorization_token UUID UNIQUE DEFAULT gen_random_uuid(),
    hwid                BIGINT NOT NULL REFERENCES hwids (id) ON DELETE CASCADE,
    license_id          BIGINT NOT NULL REFERENCES licenses (id) ON DELETE CASCADE,
    ip_address          VARCHAR(50),
    created_at          TIMESTAMP   DEFAULT NOW(),
    refreshed_at        TIMESTAMP   DEFAULT NULL -- for when people do a PUT to the /licenses/uuid with the current token
);