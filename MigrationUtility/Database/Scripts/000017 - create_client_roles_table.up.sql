CREATE TABLE IF NOT EXISTS client_roles
(
    id        serial primary key,
    role_id   INT REFERENCES roles (role_id) ON DELETE CASCADE      NOT NULL,
    client_id uuid REFERENCES clients (client_id) ON DELETE CASCADE NOT NULL
);

CREATE OR REPLACE FUNCTION check_application_role_type_application()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1
                   FROM roles
                   WHERE role_id = roles.role_type
                     AND role_type = (SELECT slug from role_types where slug = 'APPLICATION_ROLE'))
    THEN
        RAISE EXCEPTION 'The role_id does not have type APPLICATION_ROLE';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_role_type_trigger_application
    BEFORE INSERT OR UPDATE
    ON user_sessions
    FOR EACH ROW
EXECUTE FUNCTION check_application_role_type_application();