CREATE TABLE chat_messages (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_room_id UUID        NOT NULL,
    sender_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content      TEXT        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_room ON chat_messages(chat_room_id, created_at);
