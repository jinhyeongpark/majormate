ALTER TABLE character_items ADD COLUMN is_starter BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE users SET role = 'ADMIN' WHERE email = 'jinhyoung9380@gmail.com';
