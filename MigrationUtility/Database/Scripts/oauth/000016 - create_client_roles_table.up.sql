CREATE TABLE client_roles (
                              client_id INT REFERENCES clients(client_id) ON DELETE CASCADE,
                              role_id INT REFERENCES roles(id) ON DELETE CASCADE,
                              PRIMARY KEY (role_id)
);