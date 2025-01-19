	-- User data

CREATE TABLE hwids(
	id BIGSERIAL PRIMARY KEY,
	cpu varchar(64) UNIQUE NOT NULL,
	bios varchar(64) UNIQUE NOT NULL,
	ram varchar(64) UNIQUE NOT NULL,
	disk varchar(64) UNIQUE NOT NULL,
	display varchar(64) UNIQUE NOT NULL
);
-- check for email structure
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
    token UUID NOT NULL UNIQUE,
    license_id BIGINT NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    expires_at TIMESTAMP GENERATED ALWAYS AS (created_at + interval '7 days') STORED,
    created_at TIMESTAMP DEFAULT NOW(),
    refreshed_at TIMESTAMP DEFAULT NULL -- for when people do a PUT to the /licenses/uuid with the current token
);

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
