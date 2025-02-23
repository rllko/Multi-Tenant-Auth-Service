CREATE TABLE IF NOT EXISTS hwids
(
    id      BIGSERIAL PRIMARY KEY,
    cpu     varchar(64) UNIQUE NOT NULL,
    bios    varchar(64) UNIQUE NOT NULL,
    ram     varchar(64) UNIQUE NOT NULL,
    disk    varchar(64) UNIQUE NOT NULL,
    display varchar(64) UNIQUE NOT NULL
);