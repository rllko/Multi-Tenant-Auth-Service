-- deleting an application removes its licenses, hwids, sessions, and oauth clients
ALTER TABLE licenses
    DROP CONSTRAINT licenses_application_fkey,
    ADD CONSTRAINT licenses_application_fkey
        FOREIGN KEY (application) REFERENCES applications (id) ON DELETE CASCADE;

ALTER TABLE hwids
    DROP CONSTRAINT hwids_application_fkey,
    ADD CONSTRAINT hwids_application_fkey
        FOREIGN KEY (application) REFERENCES applications (id) ON DELETE CASCADE;

ALTER TABLE user_sessions
    DROP CONSTRAINT user_sessions_application_fkey,
    ADD CONSTRAINT user_sessions_application_fkey
        FOREIGN KEY (application) REFERENCES applications (id) ON DELETE CASCADE;

ALTER TABLE clients
    DROP CONSTRAINT clients_application_id_fkey,
    ADD CONSTRAINT clients_application_id_fkey
        FOREIGN KEY (application_id) REFERENCES applications (id) ON DELETE CASCADE;
