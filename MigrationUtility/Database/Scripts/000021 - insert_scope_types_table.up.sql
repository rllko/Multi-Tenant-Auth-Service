INSERT INTO scope_types (name, slug, description)
VALUES ('application scopes', 'APPLICATION_SCOPE', 'scopes for the application level'),
       ('team scopes', 'TEAM_SCOPE', 'scopes for the team members'),
       ('global roles', 'GLOBAL_ROLE', 'roles for everyone')
ON CONFLICT DO NOTHING;
