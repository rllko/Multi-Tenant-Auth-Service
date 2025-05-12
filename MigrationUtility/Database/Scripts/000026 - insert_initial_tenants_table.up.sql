CREATE EXTENSION IF NOT EXISTS "pgcrypto";

INSERT INTO tenants (id, discordid, email, name, password, activated_at)
VALUES (gen_random_uuid(),
        0,
        'admin@authio.com',
        'admin',
        '$2a$10$x7KljLuGfaH9GB49gmHYLOp47rReMgF6MnC0pup.E0bl8sr2bXgza',
        NOW())
ON CONFLICT DO NOTHING;
