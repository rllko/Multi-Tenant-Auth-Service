CREATE TABLE discords
(
    uid         SERIAL discord_id  bigint PRIMARY KEY,
    date_linked TIMESTAMP DEFAULT NOW()
);


ALTER TABLE discords
    ADD COLUMN uid BIGSERIAL;