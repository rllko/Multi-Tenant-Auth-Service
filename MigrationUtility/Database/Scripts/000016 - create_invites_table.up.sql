CREATE TABLE IF NOT EXISTS tenant_invite_statuses
(
    id   SERIAL PRIMARY KEY,
    name VARCHAR(32)        NOT NULL,
    slug varchar(32) UNIQUE NOT NULL
);

INSERT INTO tenant_invite_statuses (name, slug)
VALUES ('pending', 'PENDING'),
       ('accepted', 'ACCEPTED'),
       ('expired', 'EXPIRED'),
       ('revoked', 'REVOKED')
ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS tenant_invites
(
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id    UUID         NOT NULL REFERENCES tenants (id) ON DELETE CASCADE,
    invite_token VARCHAR(128) NOT NULL UNIQUE,
    message      VARCHAR(255),
    created_at   TIMESTAMP        DEFAULT NOW(),
    team_id      UUID         NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    expires_at   TIMESTAMP    NOT NULL,
    accepted_at  TIMESTAMP,
    created_by   UUID,
    status       int references tenant_invite_statuses (id)
);