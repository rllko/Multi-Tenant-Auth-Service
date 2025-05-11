-- LOGS
INSERT INTO roles (role_name, slug, role_type)
VALUES ('log.read', 'LOGS_READ', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'LOGS_READ'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'LOGS_MANAGEMENT'
  AND scope_types.slug = 'TEAM_SCOPE'
  AND permission_impact_levels.slug = 'LOW_IMPACT';

INSERT INTO roles (role_name, slug, role_type)
VALUES ('log.write', 'LOGS_WRITE', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'LOGS_WRITE'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'LOGS_MANAGEMENT'
  AND scope_types.slug = 'TEAM_SCOPE'
  AND permission_impact_levels.slug = 'HIGH_IMPACT';

-- GLOBAL.READ
INSERT INTO roles (role_name, slug, role_type)
VALUES ('global.read', 'GLOBAL_READ', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'GLOBAL_READ'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'GLOBAL_OPERATIONS'
  AND scope_types.slug = 'TEAM_SCOPE'
  AND permission_impact_levels.slug = 'LOW_IMPACT';

-- GLOBAL.WRITE
INSERT INTO roles (role_name, slug, role_type)
VALUES ('global.write', 'GLOBAL_WRITE', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'GLOBAL_WRITE'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'GLOBAL_OPERATIONS'
  AND scope_types.slug = 'TEAM_SCOPE'
  AND permission_impact_levels.slug = 'HIGH_IMPACT';

-- GLOBAL.DOWNLOAD
INSERT INTO roles (role_name, slug, role_type)
VALUES ('global.download', 'GLOBAL_DOWNLOAD', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'GLOBAL_DOWNLOAD'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'GLOBAL_OPERATIONS'
  AND scope_types.slug = 'TEAM_SCOPE'
  AND permission_impact_levels.slug = 'MEDIUM_IMPACT';


-- TEAM.READ
INSERT INTO roles (role_name, slug, role_type)
VALUES ('team.read', 'TEAM_READ', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'TEAM_READ'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'TEAM_MANAGEMENT'
  AND scope_types.slug = 'TEAM_SCOPE'
  AND permission_impact_levels.slug = 'LOW_IMPACT';

-- TEAM.WRITE
INSERT INTO roles (role_name, slug, role_type)
VALUES ('global.write', 'TEAM_WRITE', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'GLOBAL_WRITE'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
WHERE scope_categories.slug = 'TEAM_MANAGEMENT'
  AND scope_types.slug = 'TEAM_SCOPE'
  AND permission_impact_levels.slug In ('MEDIUM_IMPACT', 'HIGH_IMPACT');

-- TEAM.DELETE
INSERT INTO roles (role_name, slug, role_type)
VALUES ('team.delete', 'TEAM_DELETE', (SELECT id FROM role_types WHERE slug = 'TEAM_ROLE'))
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes(ROLE_ID, SCOPE_ID, SCOPE_TYPE)
SELECT (SELECT role_id FROM roles WHERE slug = 'TEAM_ADMIN'), scopes.scope_id, scope_type
FROM scopes
         JOIN scope_types ON scopes.scope_type = scope_types.id
         JOIN scope_categories ON scopes.category_id = scope_categories.id
         JOIN permission_impact_levels ON scopes.impact_level_id = permission_impact_levels.id
--WHERE scope_categories.slug = 'TEAM_MANAGEMENT'
--  AND scope_types.slug = 'TEAM_SCOPE';
