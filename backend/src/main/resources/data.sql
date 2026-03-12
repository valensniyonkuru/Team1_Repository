-- Seed default categories on startup (so API tests and app can create posts).
-- Runs when Spring Boot starts (spring.sql.init.mode=always, defer-datasource-initialization=true).
-- ON CONFLICT (name) DO NOTHING makes this safe to run every time.
INSERT INTO categories (id, name, description) VALUES
  (nextval('category_seq'), 'General', 'General discussion'),
  (nextval('category_seq'), 'Events', 'Community events'),
  (nextval('category_seq'), 'Help', 'Help and support'),
  (nextval('category_seq'), 'Tech', 'Technology')
ON CONFLICT (name) DO NOTHING;
