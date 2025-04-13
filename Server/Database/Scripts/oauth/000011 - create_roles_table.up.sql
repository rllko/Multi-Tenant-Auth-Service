CREATE TABLE roles (
                        id SERIAL PRIMARY KEY,
                        role_name VARCHAR(255) UNIQUE NOT NULL,                     
                        slug VARCHAR(255) UNIQUE NOT NULL,
                        role_type int references role_types(id) not null,
                        created_by int references teams(id)
);