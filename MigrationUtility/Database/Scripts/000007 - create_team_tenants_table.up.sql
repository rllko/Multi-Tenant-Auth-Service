CREATE TABLE IF NOT EXISTS team_tenants
(
    id             BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 10 INCREMENT BY 69) PRIMARY KEY,
    invited_by     uuid references tenants(id),
    tenant         uuid references tenants(id),
    team           uuid references teams(id),
    created_at  bigint NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_login_index on licenses (email, password);