CREATE TABLE discords
(
    discord_id  bigint PRIMARY KEY,
    email       varchar(64) UNIQUE,
    date_linked TIMESTAMP DEFAULT NOW()
);
