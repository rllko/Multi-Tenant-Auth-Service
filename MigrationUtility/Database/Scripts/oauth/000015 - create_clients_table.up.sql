CREATE TABLE IF NOT EXISTS clients (
                         client_id SERIAL PRIMARY KEY,
                         client_identifier varchar(150),
                         client_secret varchar(150), -- we need to see this thing later, for now its alright
                         grant_type varchar(20),
                         role       int references roles(slug),
                         role       int references roles(id),
                         team       UUID references teams(id),
                         client_uri varchar(150)
);