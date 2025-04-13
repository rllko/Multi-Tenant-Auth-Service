CREATE TABLE IF NOT EXISTS scopes (
                        scope_id SERIAL PRIMARY KEY,
                        scope_name VARCHAR(255) UNIQUE NOT NULL -- e.g., "read", "write", "admin"
);