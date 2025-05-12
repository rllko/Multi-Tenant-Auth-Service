CREATE EXTENSION IF NOT EXISTS "pgcrypto";

insert into teams (name, created_by, created_at, updated_at)
values ('test', (SELECT id from tenants where email = 'admin@authio.com'), NOW(), NULL);

insert into team_tenants (invited_by, tenant, team, role, created_at)
values ((SELECT id from tenants where email = 'admin@authio.com'),
        (SELECT id from tenants where email = 'admin@authio.com'),
        (SELECT id from teams where name = 'test'),
        (SELECT role_id FROM roles WHERE slug = 'TEAM_OWNER'), NOW())


