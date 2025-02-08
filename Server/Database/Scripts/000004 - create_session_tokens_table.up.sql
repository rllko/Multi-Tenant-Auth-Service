CREATE TABLE session_tokens (
                                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                token UUID NOT NULL UNIQUE,
                                hwid BIGINT NOT NULL REFERENCES hwids(id) ON DELETE CASCADE,
                                license_id BIGINT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
                                ip_address VARCHAR(50),
                                expires_at TIMESTAMP GENERATED ALWAYS AS (created_at + interval '7 days') STORED,
                                created_at TIMESTAMP DEFAULT NOW(),
                                refreshed_at TIMESTAMP DEFAULT NULL -- for when people do a PUT to the /licenses/uuid with the current token
);