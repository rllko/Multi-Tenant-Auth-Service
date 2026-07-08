ALTER TABLE licenses
    ADD COLUMN IF NOT EXISTS banned     bool NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS revoked    bool NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS revoked_at bigint;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'licenses_revoked_at_requires_revoked'
          AND conrelid = 'licenses'::regclass
    ) THEN
        ALTER TABLE licenses
            ADD CONSTRAINT licenses_revoked_at_requires_revoked
            CHECK (revoked = true OR revoked_at IS NULL);
    END IF;
END $$;
