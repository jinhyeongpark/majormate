CREATE TABLE qa_requests (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_id       UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message         VARCHAR(500),
    status          VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    chat_room_id    UUID,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
