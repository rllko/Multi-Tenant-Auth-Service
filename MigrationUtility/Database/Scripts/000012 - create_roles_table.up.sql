CREATE TABLE IF NOT EXISTS roles
(
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(255) UNIQUE            NOT NULL,
    description VARCHAR(255),
    slug        VARCHAR(255) UNIQUE            NOT NULL,
    role_type   int references role_types (id) not null,
    created_by  uuid references teams (id)
);