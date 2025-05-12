WITH SCOPE AS (SELECT (SELECT id FROM scope_types WHERE slug = 'TEAM_SCOPE')                   AS type,
                      (SELECT id FROM scope_categories WHERE slug = 'TEAM_MANAGEMENT')         AS category,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'HIGH_IMPACT')     AS high_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'MEDIUM_IMPACT')   AS medium_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'LOW_IMPACT')      AS low_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'CRITICAL_IMPACT') AS critical_impact)
INSERT
INTO scopes (scope_name, scope_type, slug, category_id, impact_level_id)
SELECT distinct data.scope_name,
                s.type,
                data.slug,
                s.category,
                CASE data.impact_level
                    WHEN 'HIGH' THEN s.high_impact
                    WHEN 'MEDIUM' THEN s.medium_impact
                    WHEN 'CRITICAL' THEN s.critical_impact
                    WHEN 'LOW' THEN s.low_impact
                    END
FROM SCOPE s
         CROSS JOIN (VALUES
                         -- CRITICAL IMPACT
                         ('Delete team', 'team.delete', 'CRITICAL'),

                         -- HIGH IMPACT
                         ('Assign team roles', 'team.assign_roles', 'HIGH'),
                         ('Remove team roles', 'team.remove_roles', 'HIGH'),
                         ('Kick team members', 'team.kick', 'HIGH'),

                         -- MEDIUM IMPACT
                         ('Invite team members', 'team.invite', 'MEDIUM'),

                         -- LOW IMPACT
                         ('Fetch Team Members', 'team.fetch_team_members', 'LOW'),
                         ('Fetch Team Clients', 'team.fetch_team_clients', 'LOW'))
    AS data (scope_name, slug, impact_level)
on conflict do nothing;


WITH SCOPE AS (SELECT (SELECT id FROM scope_types WHERE slug = 'TEAM_SCOPE')                   AS type,
                      (SELECT id FROM scope_categories WHERE slug = 'TEAM_MANAGEMENT')         AS category,
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
         CROSS JOIN (VALUES
                         -- CRITICAL IMPACT
                         ('Delete Application', 'application.delete', 'CRITICAL'),
                         ('Create Application', 'application.create', 'CRITICAL'),

                         -- HIGH IMPACT
                         ('Assign Application Role', 'application.assign_role', 'CRITICAL'),
                         ('Remove Application Role', 'application.remove_role', 'CRITICAL'),
                         ('Rotate Application Secret', 'application.rotate_secret', 'CRITICAL'),

                         -- MEDIUM IMPACT
                         ('Retrieve Application Credentials', 'application.retrieve_credentials', 'MEDIUM'),

                         -- LOW IMPACT
                         ('Retrieve Application Data', 'application.retrieve', 'LOW'))
    AS data(scope_name, slug, impact_level)
ON CONFLICT DO NOTHING;

WITH SCOPE AS (SELECT (SELECT id FROM scope_types WHERE slug = 'TEAM_SCOPE')                   AS type,
                      (SELECT id FROM scope_categories WHERE slug = 'APPLICATION_MANAGEMENT')  AS category,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'HIGH_IMPACT')     AS high_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'MEDIUM_IMPACT')   AS medium_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'LOW_IMPACT')      AS low_impact,
                      (SELECT id FROM permission_impact_levels WHERE slug = 'CRITICAL_IMPACT') AS critical_impact)
INSERT
INTO scopes (scope_name, scope_type, slug, category_id, impact_level_id)
SELECT distinct data.scope_name,
                s.type,
                data.slug,
                s.category,
                CASE data.impact_level
                    WHEN 'HIGH' THEN s.high_impact
                    WHEN 'MEDIUM' THEN s.medium_impact
                    WHEN 'CRITICAL' THEN s.critical_impact
                    WHEN 'LOW' THEN s.low_impact
                    END
FROM SCOPE s
         CROSS JOIN (VALUES
                         -- CRITICAL IMPACT
                         ('Delete team', 'team.delete', 'CRITICAL'),

                         -- HIGH IMPACT
                         ('Assign team roles', 'team.assign_roles', 'HIGH'),
                         ('Create team roles', 'team.create_roles', 'HIGH'),
                         ('Remove team roles', 'team.remove_roles', 'HIGH'),
                         ('Kick team members', 'team.kick', 'HIGH'),

                         -- MEDIUM IMPACT
                         ('Invite team members', 'team.invite', 'MEDIUM'),

                         -- LOW IMPACT
                         ('Fetch Team Members', 'team.fetch_team_members', 'LOW'),
                         ('Fetch Team Clients', 'team.fetch_team_clients', 'LOW'),
                         ('Fetch Team Roles', 'team.fetch_team_roles', 'LOW'))
    AS data (scope_name, slug, impact_level)
on conflict do nothing;


