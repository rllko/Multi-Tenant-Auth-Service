
-- User data

CREATE TABLE discord_users (
	discord_id bigint PRIMARY KEY ,
	date_linked TIMESTAMP
);

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    license VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(150),
    key_reset_count INTEGER DEFAULT 0,
    discord_user BIGINT REFERENCES discord_users(discord_id) ON DELETE CASCADE, 
    hwid BIGINT REFERENCES hwids(id) ON DELETE SET NULL,
    persistent_token VARCHAR(40),
    last_token TIMESTAMPTZ,
    creation_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE UserActivityLog (
    UserActivityLogId BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    targetId BIGINT REFERENCES users(id) ON DELETE SET NULL,
    IPAddress VARCHAR(50) NOT NULL,
    ActivityType VARCHAR(100) NOT NULL,
    InteractionTime TIMESTAMP DEFAULT NOW()
);

-- Auth stuff

CREATE TABLE scopes (
    scope_id SERIAL PRIMARY KEY,
    scope_name VARCHAR(255) UNIQUE NOT NULL -- e.g., "read", "write", "admin"
);

CREATE TABLE clients (
				client_id SERIAL PRIMARY KEY,
                client_identifier varchar(150),
                client_secret varchar(150),
                grant_type varchar(20),
                client_uri varchar(150)
);

CREATE TABLE client_scopes (
    client_id INT REFERENCES clients(client_id) ON DELETE CASCADE,
    scope_id INT REFERENCES scopes(scope_id) ON DELETE CASCADE,
    PRIMARY KEY (client_id, scope_id)
);

-- managed by the bot
create table offsets(
	id serial primary key
	list jsonb
)

CREATE TABLE hwids(
	id BIGSERIAL PRIMARY KEY,
	cpu varchar(64) UNIQUE NOT NULL,
	bios varchar(64) UNIQUE NOT NULL,
	ram varchar(64) UNIQUE NOT NULL,
	disk varchar(64) UNIQUE NOT NULL,
	display varchar(64) UNIQUE NOT NULL
)

-- Insert data

 INSERT INTO users (license) VALUES ('da20cc3c-b57a-42ac-9218-2da8066730bb');

INSERT INTO Clients (client_identifier,client_secret,grant_type,client_uri) 
VALUES ('a72JD81Y76LH2D9Q','vK!@82msN7#$bTgF47Aq5pYx!Zw6E3','code','https://headhunter1-huakhahpfhgkcycm.eastus2-01.azurewebsites.net/');

INSERT INTO scopes (scope_name) 
VALUES ('openid'),('admin'),
('license:read'),('license:write'),
('discord:read'),('discord:write'),
('clients:read'),('clients:write');

INSERT INTO client_scopes (client_id,scope_id) 
VALUES 
((SELECT client_id from clients where client_identifier = 'a72JD81Y76LH2D9Q'),
(SELECT scope_id from scopes where scope_name = 'admin'));
