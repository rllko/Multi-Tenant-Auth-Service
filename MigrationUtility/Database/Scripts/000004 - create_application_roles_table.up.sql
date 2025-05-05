CREATE TABLE IF NOT EXISTS application_role_scopes
(
    id             serial primary key,
    role_id        INT REFERENCES roles (role_id) ON DELETE CASCADE,
    application_id INT REFERENCES applications (id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION check_role_type_application()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1
                   FROM roles
                   WHERE role_id = NEW.id
                     AND role_type = (SELECT slug from role_types where slug = 'APPLICATION'))
    THEN
        RAISE EXCEPTION 'The role_id does not have type TEAM_ROLE';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_role_type_trigger_application
    BEFORE INSERT OR UPDATE
    ON user_sessions
    FOR EACH ROW
EXECUTE FUNCTION check_role_type_application();