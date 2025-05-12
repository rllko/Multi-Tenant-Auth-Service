CREATE TABLE IF NOT EXISTS clients
(
    client_id         SERIAL PRIMARY KEY,
    client_identifier varchar(150),
    client_secret     varchar(150),
    role              int references roles (role_id),
    team              UUID references teams (id),
    application_id    UUID references applications (id)
);
