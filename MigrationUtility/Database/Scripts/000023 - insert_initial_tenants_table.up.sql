-- Ensure pgcrypto extension is enabled (you only need this once in your migrations)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Insert with a generated UUID
INSERT INTO tenants (id, discordid, email, name, password, activated_at)
VALUES (gen_random_uuid(),
        0,
        'admin@authio.com',
        'admin',
        '\$2a\$10\$JRYnq1pyvoFXIe1x2FvmC.6F/QxI.V0JlbvYAXlJJPQwqIXvdJwYe',
        NOW())
ON CONFLICT DO NOTHING;