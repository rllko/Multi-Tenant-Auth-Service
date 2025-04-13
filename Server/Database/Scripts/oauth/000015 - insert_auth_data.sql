insert into clients (client_id, client_identifier, client_secret, grant_type, client_uri)
values (1,
        'a72JD81Y76LH2D9Q',
        'vK!@82msN7#$bTgF47Aq5pYx!Zw6E3',
        'code',
        'https://headhunter1-huakhahpfhgkcycm.eastus2-01.azurewebsites.net/');

insert into scopes (scope_name)
values  ('openid'),
        ('admin'),
        ('license:read'),
        ('license:write'),
        ('discord:read'),
        ('discord:write'),
        ('clients:read'),
        ('clients:write');

insert into client_scopes (client_id, scope_id)
 (SELECT (1,scope_id) from scopes);

