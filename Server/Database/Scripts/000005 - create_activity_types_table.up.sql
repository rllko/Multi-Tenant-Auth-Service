CREATE TABLE activity_types (
                                id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                name VARCHAR(100) NOT NULL UNIQUE
);