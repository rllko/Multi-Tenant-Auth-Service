CREATE TABLE clients (
                         client_id SERIAL PRIMARY KEY,
                         client_identifier varchar(150),
                         client_secret varchar(150),
                         grant_type varchar(20),
                         client_uri varchar(150)
);
