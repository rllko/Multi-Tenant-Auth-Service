CREATE TABLE IF NOT EXISTS key_schemas
(
    id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name  varchar(150) NOT NULL,
    regex varchar(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS applications
(
    id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                         varchar(150) NOT NULL,
    description                  VARCHAR(255),
    client_decryption_chacha_key varchar(150) NOT NULL,
    is_response_encrypted        boolean          default false,
    server_api_secret            VARCHAR(255) NOT NULL,
    default_key_schema           UUID         references key_schemas (id) on delete set null,
    team                         UUID references teams (id)
);
