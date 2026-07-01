CREATE TABLE IF NOT EXISTS activity_logs
(
    id           uuid,
    tenant_id    text,
    event_type   text,
    level        varchar(50),
    message      text,
    timestamp    timestamp,
    exception    text,
    properties   jsonb,
    machine_name text
);
