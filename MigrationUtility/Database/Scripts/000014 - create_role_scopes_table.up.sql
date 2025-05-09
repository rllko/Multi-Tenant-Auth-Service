CREATE TABLE IF NOT EXISTS role_scopes
(
    id         serial primary key,
    role_id    INT REFERENCES roles (role_id) ON DELETE CASCADE   NOT NULL,
    scope_id   INT REFERENCES scopes (scope_id) ON DELETE CASCADE NOT NULL,
    scope_type int references scope_types (id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION check_role_type_team()
    RETURNS TRIGGER AS
$$
BEGIN
    IF NOT EXISTS (SELECT 1
                   FROM scopes
                   WHERE scope_id = NEW.id
                     AND scopes.scope_type = NEW.scope_type)
    THEN
        RAISE EXCEPTION 'The the role_id doesnt match the role type';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_role_type_trigger_team
    BEFORE INSERT OR UPDATE
    ON user_sessions
    FOR EACH ROW
EXECUTE FUNCTION check_role_type_team();