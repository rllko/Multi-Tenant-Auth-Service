CREATE TABLE licenses
(
    id            BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 10 INCREMENT BY 69) PRIMARY KEY,
    value         UUID      DEFAULT gen_random_uuid(),
    discord       BIGINT REFERENCES discords (discord_id) ON DELETE CASCADE,
    hwid          BIGINT REFERENCES hwids (id) ON DELETE SET NULL,
    creation_date TIMESTAMP DEFAULT NOW()
);