CREATE TABLE permission_impact_levels (
    id SMALLSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE
);