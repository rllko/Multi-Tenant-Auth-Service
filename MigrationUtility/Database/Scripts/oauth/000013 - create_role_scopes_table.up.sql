CREATE TABLE IF NOT EXISTS role_scopes (
                             int serial primary key,
                             role_id INT REFERENCES roles(id) ON DELETE CASCADE,
                             scope_id INT REFERENCES scopes(scope_id) ON DELETE CASCADE
);