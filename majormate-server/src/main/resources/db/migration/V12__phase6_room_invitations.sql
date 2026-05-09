CREATE TABLE room_invitations (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id       UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    inviter_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expired_at    TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT room_invitations_status_check CHECK (status IN ('PENDING','ACCEPTED','DECLINED','EXPIRED'))
);
CREATE INDEX idx_room_invitations_invitee ON room_invitations(invitee_id, status);
