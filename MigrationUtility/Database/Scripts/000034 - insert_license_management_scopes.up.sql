WITH refs AS (
    SELECT
        (SELECT id FROM scope_types WHERE slug = 'TEAM_SCOPE') AS team_scope_type,
        (SELECT id FROM scope_categories WHERE slug = 'LICENSE_MANAGEMENT') AS license_category,
        (SELECT id FROM permission_impact_levels WHERE slug = 'LOW_IMPACT') AS low_impact,
        (SELECT id FROM permission_impact_levels WHERE slug = 'MEDIUM_IMPACT') AS medium_impact,
        (SELECT id FROM permission_impact_levels WHERE slug = 'HIGH_IMPACT') AS high_impact
),
new_scopes AS (
    SELECT *
    FROM (VALUES
        ('Update License', 'license.update', 'MEDIUM'),
        ('Ban/Revoke License', 'license.ban', 'HIGH'),
        ('Manage License Sessions', 'license.sessions', 'LOW')
    ) AS v(scope_name, slug, impact)
)
INSERT INTO scopes (scope_name, scope_type, slug, category_id, impact_level_id)
SELECT
    ns.scope_name,
    refs.team_scope_type,
    ns.slug,
    refs.license_category,
    CASE ns.impact
        WHEN 'LOW' THEN refs.low_impact
        WHEN 'MEDIUM' THEN refs.medium_impact
        WHEN 'HIGH' THEN refs.high_impact
    END
FROM refs
CROSS JOIN new_scopes ns
ON CONFLICT (slug) DO NOTHING;

WITH wanted(slug) AS (
    VALUES
        ('license.retrieve_info'),
        ('license.create'),
        ('license.update'),
        ('license.delete'),
        ('license.ban'),
        ('license.sessions')
),
target_roles AS (
    SELECT role_id
    FROM roles
    WHERE slug IN ('TEAM_OWNER', 'ADMIN')
)
INSERT INTO role_scopes (role_id, scope_id, scope_type)
SELECT tr.role_id, s.scope_id, s.scope_type
FROM target_roles tr
JOIN wanted w ON true
JOIN scopes s ON s.slug = w.slug
WHERE NOT EXISTS (
    SELECT 1
    FROM role_scopes rs
    WHERE rs.role_id = tr.role_id
      AND rs.scope_id = s.scope_id
);
