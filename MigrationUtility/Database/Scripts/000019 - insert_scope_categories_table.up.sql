INSERT INTO scope_categories (name, slug)
VALUES ('License Management', 'LICENSE_MANAGEMENT'),
       ('User Management', 'USER_MANAGEMENT'),
       ('Session Management', 'SESSION_MANAGEMENT'),
       ('Subscription Management', 'SUBSCRIPTION_MANAGEMENT'),
       ('Logs Management', 'LOGS_MANAGEMENT'),
       ('Global Operations', 'GLOBAL_OPERATIONS'),
       ('Tenant Management', 'TEAM_MANAGEMENT')
ON CONFLICT DO NOTHING;