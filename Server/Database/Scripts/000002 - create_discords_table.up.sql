CREATE TABLE IF NOT EXISTS discords
(
    uid         SERIAL,
    discord_id  bigint PRIMARY KEY,
    date_linked TIMESTAMP DEFAULT NOW()
);