-- LICENSE
INSERT INTO roles (role_name, slug, role_type)
VALUES ('license.read', 'LICENSE_READ', (SELECT id FROM role_types WHERE slug = 'GLOBAL_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'LICENSE_READ'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'LICENSE_MANAGEMENT'
  AND permission_impact_levels.slug = 'LOW_IMPACT';


