CREATE TABLE IF NOT EXISTS applications (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                            varchar(150) NOT NULL,
    description                     text,
    client_decryption_chacha_key    varchar(150) NOT NULL,
    server_api_secret               text NOT NULL,
    default_key_schema              text default '[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}-[A-Za-z0-9]{4}',
    team                            UUID references teams(id)
);
