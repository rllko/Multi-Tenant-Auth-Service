CREATE TABLE IF NOT EXISTS tenant_application_role
(
    id             serial primary key,
    tenant_id      uuid REFERENCES tenants(id) ON DELETE CASCADE,
    role_id        INT REFERENCES roles(role_id) ON DELETE CASCADE,
    application_id uuid REFERENCES applications(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION check_role_type_tenant()
    RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM roles WHERE role_id = NEW.role_id 
                      AND role_type = (SELECT slug from role_types where slug = 'APPLICATION_TENANT_ROLE') )
        THEN
        RAISE EXCEPTION 'The role_id does not have type APPLICATION_TENANT';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_role_type_application_trigger
    BEFORE INSERT OR UPDATE ON tenant_application_role
    FOR EACH ROW
EXECUTE FUNCTION check_role_type_tenant();