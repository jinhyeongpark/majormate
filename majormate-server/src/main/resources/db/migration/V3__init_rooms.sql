CREATE TABLE rooms (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    type        VARCHAR(20)  NOT NULL,
    host_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
    major       VARCHAR(100),
    max_members INT          NOT NULL DEFAULT 30,
    created_at  TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE TABLE room_members (
    id        UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id   UUID      NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id   UUID      NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    joined_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (room_id, user_id)
);
