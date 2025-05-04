WITH SCOPE AS (SELECT (SELECT id FROM scope_types WHERE slug = 'APPLICATION_SCOPE')            AS type,
                      (SELECT id FROM scope_categories WHERE slug = 'LICENSE_MANAGEMENT')      AS category,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'LOW_IMPACT')      AS low_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'MEDIUM_IMPACT')   AS medium_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'HIGH_IMPACT')     AS high_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'CRITICAL_IMPACT') AS critical_impact)
INSERT
INTO scopes (scope_name, scope_type, slug, category_id, impact_level_id)
SELECT distinct data.scope_name,
                s.type,
                data.slug,
                s.category,
                CASE data.impact_level
                    WHEN 'CRITICAL' THEN s.critical_impact
                    WHEN 'HIGH' THEN s.high_impact
                    WHEN 'MEDIUM' THEN s.medium_impact
                    WHEN 'LOW' THEN s.low_impact
                    END
FROM SCOPE s
         CROSS JOIN scope_types
         CROSS JOIN (VALUES
                         -- CRITICAL IMPACT
                         ('Delete All Licenses', 'license.delete_all', 'CRITICAL'),
                         ('Delete An Existing License', 'license.delete', 'CRITICAL'),
                         ('Delete All Used Licenses', 'license.delete_all_used', 'CRITICAL'),
                         ('Delete Multiple Licenses', 'license.delete_multiple', 'CRITICAL'),
                         ('Delete All Unused Licenses', 'license.delete_all_unused', 'CRITICAL'),

                         -- HIGH IMPACT
                         ('Add Time To All Used Licenses', 'license.add_time_all_used', 'HIGH'),
                         ('Add Time To All Unused Licenses', 'license.add_time_all_unused', 'HIGH'),
                         ('Create A New User Using A License', 'license.create_user', 'HIGH'),
                         ('Assign A License To A User', 'license.assign_to_user', 'HIGH'),
                         ('Create A New License', 'license.create', 'HIGH'),

                         -- MEDIUM IMPACT
                         ('Unban A License', 'license.unban', 'MEDIUM'),
                         ('Blacklist License', 'license.blacklist', 'MEDIUM'),
                         ('Set Note On Existing License', 'license.set_note', 'MEDIUM'),

                         -- LOW IMPACT
                         ('Verify License Exists', 'license.verify_exists', 'LOW'),
                         ('Retrieve License Information', 'license.retrieve_info', 'LOW'))
    AS data(scope_name, slug, impact_level)
ON CONFLICT DO NOTHING;

WITH SCOPE AS (SELECT (SELECT id FROM scope_types WHERE slug = 'APPLICATION_SCOPE')          AS type,
                      (SELECT id FROM scope_categories WHERE slug = 'SESSION_MANAGEMENT')    AS category,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'LOW_IMPACT')    AS low_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'MEDIUM_IMPACT') AS medium_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'HIGH_IMPACT')   AS high_impact)
INSERT
INTO scopes (scope_name, scope_type, slug, category_id, impact_level_id)
SELECT data.scope_name,
       s.scope_type,
       data.slug,
       s.category_id,
       CASE data.impact_level
           WHEN 'HIGH' THEN (SELECT id from permission_impact_levels where slug = 'HIGH_IMPACT')
           WHEN 'MEDIUM' THEN (SELECT id from permission_impact_levels where slug = 'MEDIUM_IMPACT')
           WHEN 'LOW' THEN (SELECT id from permission_impact_levels where slug = 'LOW_IMPACT')
           END
FROM scopes s
         CROSS JOIN (VALUES
                         -- MEDIUM IMPACT
                         ('End Selected Session', 'session.end', 'HIGH'),
                         ('End All Sessions', 'session.end_all', 'MEDIUM'),

                         -- LOW IMPACT
                         ('Retrieve All Sessions', 'session.retrieve_all', 'LOW'),
                         ('Check Session', 'session.check', 'LOW'))
    AS data(scope_name, slug, impact_level)
ON CONFLICT DO NOTHING;