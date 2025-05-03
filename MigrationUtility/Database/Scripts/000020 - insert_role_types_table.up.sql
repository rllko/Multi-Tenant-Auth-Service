INSERT INTO role_types (name,slug,description)
VALUES ( 'application roles','APPLICATION_ROLE','roles for the application level'),
       ( 'team roles','TEAM_ROLE','roles for the team members'),
       ( 'oauth roles','OAUTH_ROLE','roles for the oauth clients')
ON CONFLICT DO NOTHING;
