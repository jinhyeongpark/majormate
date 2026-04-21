CREATE TABLE users (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email        VARCHAR(255) NOT NULL UNIQUE,
    nickname     VARCHAR(50),
    major        VARCHAR(100),
    nationality  CHAR(2),
    gender       VARCHAR(20),
    friend_code  VARCHAR(8) UNIQUE,
    created_at   TIMESTAMP NOT NULL DEFAULT now(),
    updated_at   TIMESTAMP NOT NULL DEFAULT now()
);
