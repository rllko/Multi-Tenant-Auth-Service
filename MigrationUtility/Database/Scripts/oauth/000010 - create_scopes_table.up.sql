CREATE TABLE IF NOT EXISTS scopes (
    scope_id SERIAL PRIMARY KEY,
    scope_name VARCHAR(255) UNIQUE NOT NULL,
    role_type int references scope_types(id) not null,
    created_by uuid references teams(id)
);