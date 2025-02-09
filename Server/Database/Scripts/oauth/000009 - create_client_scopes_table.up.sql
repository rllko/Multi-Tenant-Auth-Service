CREATE TABLE client_scopes (
                               client_id INT REFERENCES clients(client_id) ON DELETE CASCADE,
                               scope_id INT REFERENCES scopes(scope_id) ON DELETE CASCADE,
                               PRIMARY KEY (client_id, scope_id)
);