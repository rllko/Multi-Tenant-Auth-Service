INSERT INTO role_types (name, slug, description)
VALUES ('application roles', 'APPLICATION_ROLE', 'roles for the application level'),
       ('team roles', 'TEAM_ROLE', 'roles for the team members'),
       ('global roles', 'GLOBAL_ROLE', 'roles for everyone')
ON CONFLICT DO NOTHING;
