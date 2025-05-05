INSERT INTO scope_types (name, slug, description)
VALUES ('application scopes', 'APPLICATION_SCOPE', 'scopes for the application level'),
       ('team scopes', 'TEAM_SCOPE', 'scopes for the team members')
ON CONFLICT DO NOTHING;
