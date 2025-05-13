CREATE TABLE IF NOT EXISTS key_schemas
(
    id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name  varchar(150) NOT NULL,
    regex varchar(150) NOT NULL,
    slug  varchar(150) NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS applications
(
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name               varchar(150) NOT NULL,
    description        VARCHAR(255),
    default_key_schema UUID         references key_schemas (id) on delete set null,
    team               UUID references teams (id)
);
