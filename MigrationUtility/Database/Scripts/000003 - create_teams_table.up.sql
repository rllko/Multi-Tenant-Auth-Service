CREATE TABLE IF NOT EXISTS teams
(
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          text not null,
    created_by    uuid references tenants(id),
    created_at    date default NOW(),
    updated_at    timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS team_name on teams(name);