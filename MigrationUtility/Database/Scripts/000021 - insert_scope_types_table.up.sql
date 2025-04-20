INSERT INTO scope_types (name,slug,description)
VALUES ( 'application scopes','APPLICATION_SCOPE','scopes for the application level'),
       ( 'team scopes','TEAM_SCOPE','scopes for the team members'),
       ( 'oauth scopes','OAUTH_SCOPE','scopes for the oauth clients')
ON CONFLICT DO NOTHING;
