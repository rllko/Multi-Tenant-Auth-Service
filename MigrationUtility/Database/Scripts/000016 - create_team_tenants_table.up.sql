CREATE TABLE IF NOT EXISTS team_tenants
(
    id             BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 10 INCREMENT BY 69) PRIMARY KEY,
    invited_by     UUID references tenants(id),
    tenant         UUID references tenants(id),
    team           UUID references teams(id),
    role           INTEGER references roles(role_id),
    created_at     BIGINT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_login_index on licenses (email, password);

