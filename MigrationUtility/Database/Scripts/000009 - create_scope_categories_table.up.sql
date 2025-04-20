CREATE TABLE scope_categories (
    id SMALLSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at timestamp DEFAULT NOW()
);