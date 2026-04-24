CREATE TABLE study_sessions (
    id                UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id           UUID      REFERENCES rooms(id) ON DELETE SET NULL,
    keyword           VARCHAR(200),
    started_at        TIMESTAMP NOT NULL,
    ended_at          TIMESTAMP,
    total_duration_ms BIGINT,
    created_at        TIMESTAMP NOT NULL DEFAULT now()
);
