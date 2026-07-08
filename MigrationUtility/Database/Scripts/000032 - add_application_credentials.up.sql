ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS client_decryption_chacha_key varchar(64),
    ADD COLUMN IF NOT EXISTS server_api_secret            varchar(128);
