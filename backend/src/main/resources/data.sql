-- Seed categories (MVP-required)
INSERT INTO categories (id, name, description) VALUES
  (1, 'NEWS', 'Neighborhood news and updates'),
  (2, 'EVENT', 'Local events and meetups'),
  (3, 'DISCUSSION', 'Open discussions and questions'),
  (4, 'ALERT', 'Urgent alerts and safety notices')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Seed admin user (password: password123, BCrypt encoded)
INSERT INTO users (id, email, name, password, role, created_at) VALUES
  (1, 'admin@amalitech.com', 'Admin User', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', NOW()),
  (2, 'user@amalitech.com', 'Test User', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'USER', NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed sample posts
INSERT INTO posts (id, title, content, category_id, author_id, created_at, updated_at) VALUES
  (1, 'Welcome to CommunityBoard!', 'This is our new community platform. Feel free to post announcements, share events, and discuss topics.', 1, 1, NOW(), NOW()),
  (2, 'Upcoming Team Building Event', 'We are organizing a cross-location team building event next Friday. Details to follow.', 2, 1, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Sync sequences so auto-increment works after manual inserts
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts));
