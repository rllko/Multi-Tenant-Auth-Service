VALUES ('application scopes', 'APPLICATION_SCOPE', 'scopes for the application level'),
       ('team scopes', 'TEAM_SCOPE', 'scopes for the team members')

insert into public.roles (role_name, slug, role_type)


SELECT 'license:read', 'LICENSE_READ', scopes.scope_type
from scopes
         join scope_types on scopes.scope_type = scope_types.id
         join scope_categories on scopes.category_id = scope_categories.id
where scopes.category_id = (SELECT id FROM scope_categories where slug = 'LICENSE_MANAGEMENT')
  and scope_type = (SELECT id FROM scope_types where slug = 'APPLICATION_SCOPE')

        