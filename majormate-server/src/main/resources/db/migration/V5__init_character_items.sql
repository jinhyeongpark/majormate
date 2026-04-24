CREATE TABLE character_items (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    category   VARCHAR(20)  NOT NULL,
    name       VARCHAR(100) NOT NULL,
    price      INT          NOT NULL DEFAULT 0,
    file_path  VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
