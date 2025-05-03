CREATE TABLE IF NOT EXISTS scopes (
    scope_id        SERIAL PRIMARY KEY,
    scope_name      VARCHAR(255) UNIQUE NOT NULL,
    scope_type      SMALLINT references scope_types(id) not null,
    slug            VARCHAR(255) NOT NULL UNIQUE,
    created_by      uuid references teams(id),
    impact_level_id SMALLINT REFERENCES permission_impact_levels(id),
    category_id     SMALLINT REFERENCES scope_categories(id)
);