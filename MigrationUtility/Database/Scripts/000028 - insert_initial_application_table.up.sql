-- Inserir schema de chave
INSERT INTO key_schemas (name, regex, slug)
VALUES ('Default Key Schema', '^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$', 'DEFAULT_SCHEMA')
ON CONFLICT DO NOTHING;

-- Inserir aplicação com esse schema (substitui o UUID pelo correto)
INSERT INTO applications (name, description, default_key_schema)
VALUES ('My First App', 'This is the initial test application.',
        (SELECT id from key_schemas where slug like 'DEFAULT_SCHEMA'))
