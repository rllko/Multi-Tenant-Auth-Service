insert into discords (discord_id, date_linked)
values (0,NOW());

insert into tenants (discordid, email, name, password, creation_date)
values ((select discord_id from discords where discord_id = 0),
        'admin@authio.com',
        'admin',
        '$2a$10$JRYnq1pyvoFXIe1x2FvmC.6F/QxI.V0JlbvYAXlJJPQwqIXvdJwYe',  -- its 'admin'
        extract(epoch from now() at time zone 'utc'));
