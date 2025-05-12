INSERT INTO roles (role_name, slug, role_type)
VALUES ('Moderator', 'MODERATOR', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE')),
       ('Admin', 'ADMIN', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE')),
       ('Team Owner', 'TEAM_OWNER', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(role_id, scope_id, scope_type)
SELECT (SELECT role_id FROM roles WHERE slug = 'MODERATOR'),
       s.scope_id,
       s.scope_type
FROM scopes s
         JOIN scope_categories c ON s.category_id = c.id
         JOIN permission_impact_levels p ON s.impact_level_id = p.id
WHERE c.slug IN ('TEAM_MANAGEMENT', 'APPLICATION_MANAGEMENT')
  AND p.slug IN ('LOW_IMPACT', 'MEDIUM_IMPACT');

INSERT INTO role_scopes(role_id, scope_id, scope_type)
SELECT (SELECT role_id FROM roles WHERE slug = 'ADMIN'),
       s.scope_id,
       s.scope_type
FROM scopes s
         JOIN scope_categories c ON s.category_id = c.id
         JOIN permission_impact_levels p ON s.impact_level_id = p.id
WHERE c.slug IN ('TEAM_MANAGEMENT', 'APPLICATION_MANAGEMENT')
  AND p.slug IN ('LOW_IMPACT', 'MEDIUM_IMPACT', 'HIGH_IMPACT', 'CRITICAL_IMPACT')
  AND S.slug NOT IN ('team.delete');

INSERT INTO role_scopes(role_id, scope_id, scope_type)
SELECT (SELECT role_id FROM roles WHERE slug = 'TEAM_OWNER'),
       s.scope_id,
       s.scope_type
FROM scopes s
         JOIN scope_categories c ON s.category_id = c.id