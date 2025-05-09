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

INSERT INTO roles (role_name, slug, role_type)
VALUES ('license.write', 'LICENSE_WRITE', (SELECT id FROM role_types WHERE slug = 'GLOBAL_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'LICENSE_WRITE'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'LICENSE_MANAGEMENT'
  AND permission_impact_levels.slug IN ('MEDIUM_IMPACT', 'HIGH_IMPACT')
ON CONFLICT DO NOTHING;;

INSERT INTO roles (role_name, slug, role_type)
VALUES ('license.delete', 'LICENSE_DELETE', (SELECT id FROM role_types WHERE slug = 'GLOBAL_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'LICENSE_WRITE'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'LICENSE_MANAGEMENT'
  AND permission_impact_levels.slug IN ('CRITICAL_IMPACT');


-- USER
INSERT INTO roles (role_name, slug, role_type)
VALUES ('user.read', 'USER_READ', (SELECT id FROM role_types WHERE slug = 'GLOBAL_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'USER_READ'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'USER_MANAGEMENT'
  AND permission_impact_levels.slug = 'LOW_IMPACT'
ON CONFLICT DO NOTHING;

INSERT INTO roles (role_name, slug, role_type)
VALUES ('user.write', 'USER_WRITE', (SELECT id FROM role_types WHERE slug = 'GLOBAL_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'USER_WRITE'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'USER_MANAGEMENT'
  AND permission_impact_levels.slug = 'HIGH_IMPACT'
ON CONFLICT DO NOTHING;

INSERT INTO roles (role_name, slug, role_type)
VALUES ('user.delete', 'USER_DELETE', (SELECT id FROM role_types WHERE slug = 'GLOBAL_ROLE'))
ON CONFLICT DO NOTHING;;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'USER_DELETE'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'USER_MANAGEMENT'
  AND permission_impact_levels.slug = 'CRITICAL_IMPACT'
ON CONFLICT DO NOTHING;


-- SESSION
INSERT INTO roles (role_name, slug, role_type)
VALUES ('session.read', 'SESSION_READ', (SELECT id FROM role_types WHERE slug = 'GLOBAL_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'SESSION_READ'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'SESSION_MANAGEMENT'
  AND permission_impact_levels.slug = 'LOW_IMPACT'
ON CONFLICT DO NOTHING;

INSERT INTO roles (role_name, slug, role_type)
VALUES ('session.write', 'SESSION_WRITE', (SELECT id FROM role_types WHERE slug = 'GLOBAL_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'SESSION_WRITE'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'SESSION_MANAGEMENT'
  AND permission_impact_levels.slug = 'HIGH_IMPACT'
ON CONFLICT DO NOTHING;

-- GLOBAL.DOWNLOAD
INSERT INTO roles (role_name, slug, role_type)
VALUES ('global.download', 'GLOBAL_DOWNLOAD', (SELECT id FROM role_types WHERE slug = 'GLOBAL_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'GLOBAL_DOWNLOAD'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'GLOBAL_OPERATIONS'
  AND permission_impact_levels.slug = 'MEDIUM_IMPACT'
ON CONFLICT DO NOTHING;


