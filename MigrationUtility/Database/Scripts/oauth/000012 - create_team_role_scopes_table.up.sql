CREATE TABLE IF NOT EXISTS team_role_scopes (
    int serial primary key,
    role_id INT REFERENCES roles(id) ON DELETE CASCADE,
    scope_id INT REFERENCES scopes(scope_id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION check_role_type_team()
    RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM roles WHERE role_id = NEW.role_id
                                          AND role_type = (SELECT slug from role_types where slug = 'TEAM_ROLE') )
    THEN
        RAISE EXCEPTION 'The role_id does not have type TEAM_ROLE';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_role_type_trigger_team
    BEFORE INSERT OR UPDATE ON user_sessions
    FOR EACH ROW
EXECUTE FUNCTION check_role_type_team();