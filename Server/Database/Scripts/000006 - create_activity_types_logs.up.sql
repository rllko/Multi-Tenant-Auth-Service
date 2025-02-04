CREATE TABLE activity_logs (
                               id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                               user_id BIGINT REFERENCES licenses(id), -- Nullable for non-authenticated activities
                               activity_type_id BIGINT NOT NULL REFERENCES activity_types(id),
                               interaction_time TIMESTAMP DEFAULT NOW()
);