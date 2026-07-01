ALTER TABLE applications
    ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'active';

-- scope guarding PUT /teams/{teamId}/apps/{appId}
INSERT INTO scopes (scope_name, scope_type, slug, category_id, impact_level_id)
SELECT 'Update Application',
       (SELECT id FROM scope_types WHERE slug = 'TEAM_SCOPE'),
       'application.update',
       (SELECT id FROM scope_categories WHERE slug = 'APPLICATION_MANAGEMENT'),
       (SELECT id FROM permission_impact_levels WHERE slug = 'HIGH_IMPACT')
ON CONFLICT DO NOTHING;

INSERT INTO role_scopes (role_id, scope_id)
SELECT (SELECT role_id FROM roles WHERE slug = 'TEAM_OWNER'),
       (SELECT scope_id FROM scopes WHERE slug = 'application.update')
ON CONFLICT DO NOTHING;
