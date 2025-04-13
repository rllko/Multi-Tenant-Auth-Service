CREATE TABLE scope_types (
                             id SERIAL PRIMARY KEY,
                             name VARCHAR(255) UNIQUE NOT NULL,
                             slug VARCHAR(255) UNIQUE NOT NULL

);