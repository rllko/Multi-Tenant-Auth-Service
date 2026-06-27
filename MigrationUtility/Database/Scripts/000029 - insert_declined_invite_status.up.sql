INSERT INTO tenant_invite_statuses (name, slug)
VALUES ('declined', 'DECLINED')
ON CONFLICT DO NOTHING;