	-- User data

CREATE TABLE hwids(
	id BIGSERIAL PRIMARY KEY,
	cpu varchar(64) UNIQUE NOT NULL,
	bios varchar(64) UNIQUE NOT NULL,
	ram varchar(64) UNIQUE NOT NULL,
	disk varchar(64) UNIQUE NOT NULL,
	display varchar(64) UNIQUE NOT NULL
);

CREATE TABLE discords (
    discord_id bigint PRIMARY KEY ,
    email varchar(64) UNIQUE NOT NULL,
    date_linked TIMESTAMP DEFAULT NOW()
);

CREATE TABLE licenses (
    id BIGINT GENERATED ALWAYS AS IDENTITY (START WITH 10 INCREMENT BY 69) PRIMARY KEY,
    license UUID DEFAULT gen_random_uuid(),
    discord BIGINT REFERENCES discords(discord_id) ON DELETE CASCADE,
    hwid BIGINT REFERENCES hwids(id) ON DELETE SET NULL,
    creation_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE session_tokens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    token VARCHAR(40) NOT NULL UNIQUE,
    license_id BIGINT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    expires_at TIMESTAMP NOT NULL, -- Token expiration date (7 days by default)
    created_at TIMESTAMP DEFAULT NOW(),
    refreshed_at TIMESTAMP DEFAULT NULL
);

-- create user_logs

CREATE TABLE activity_types (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE activity_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT REFERENCES licenses(id), -- Nullable for non-authenticated activities
    activity_type_id BIGINT NOT NULL REFERENCES activity_types(id),
    interaction_time TIMESTAMP DEFAULT NOW()
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


