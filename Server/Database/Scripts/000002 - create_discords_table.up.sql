CREATE TABLE discords
(
    discord_id  bigint PRIMARY KEY,
    date_linked TIMESTAMP DEFAULT NOW()
);
