CREATE TABLE IF NOT EXISTS client_types
(
    id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(32)        NOT NULL,
    slug varchar(32) UNIQUE NOT NULL
);

INSERT INTO client_types (name, slug)
VALUES ('Authentication', 'AUTHENTICATION')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS clients
(
    client_id         SERIAL PRIMARY KEY,
    client_identifier varchar(150),
    client_secret     varchar(150),
    role              int references roles (role_id),
    team              UUID references teams (id),
    application_id    UUID references applications (id),
    client_type       UUID references client_types (id)
);
