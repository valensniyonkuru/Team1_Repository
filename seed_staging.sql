-- ------------------------------
-- USERS
-- ------------------------------
-- Admin user
INSERT INTO users (email, password, role, email_verified, account_locked, auth_provider, name)
VALUES (
    'kotanov301@3dkai.com',
    '$2a$10$2S1xBJMKnPaGV0XOJGaZ1O1mi423fAkVyoeC98HD5aH6jc6t4QEzO', -- hashed 'Admin@123'
    'ADMIN',
    true,
    false,
    'LOCAL',
    'Admin'
)
ON CONFLICT (email) DO NOTHING;

-- QA Tester user
INSERT INTO users (email, password, role, email_verified, account_locked, auth_provider, name)
VALUES (
    'qatester1@test.com',
    '$2a$10$2S1xBJMKnPaGV0XOJGaZ1O1mi423fAkVyoeC98HD5aH6jc6t4QEzO', -- hashed 'password123'
    'USER',
    true,
    false,
    'LOCAL',
    'QA Tester'
)
ON CONFLICT (email) DO NOTHING;

-- ------------------------------
-- CATEGORIES
-- ------------------------------
-- Make sure category name is unique
INSERT INTO categories (name, description)
VALUES
    ('Tech', 'Posts related to technology'),
    ('Help', 'Posts requesting help'),
    ('Events', 'Posts about events'),
    ('General', 'General discussion')
ON CONFLICT (name) DO NOTHING;

-- ------------------------------
-- POSTS
-- ------------------------------
-- Example post by QA Tester
INSERT INTO posts (title, content, author_id, category_id)
VALUES
    ('QA Test Post', 'This is a test post created during QA.',
     (SELECT id FROM users WHERE email='qatester1@test.com'),
     (SELECT id FROM categories WHERE name='Tech')
    )
ON CONFLICT (title) DO NOTHING;

-- ------------------------------
-- COMMENTS
-- ------------------------------
INSERT INTO comments (content, post_id, author_id)
VALUES
    ('This is a QA comment',
     (SELECT id FROM posts WHERE title='QA Test Post'),
     (SELECT id FROM users WHERE email='qatester1@test.com')
    )
ON CONFLICT (content) DO NOTHING;