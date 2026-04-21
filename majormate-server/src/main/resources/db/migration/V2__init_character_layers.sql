CREATE TABLE character_layers (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    gender     VARCHAR(10) NOT NULL DEFAULT 'male',
    bottom     VARCHAR(255),
    top        VARCHAR(255),
    shoes      VARCHAR(255),
    hair       VARCHAR(255),
    bag        VARCHAR(255),
    glasses    VARCHAR(255),
    item       VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
