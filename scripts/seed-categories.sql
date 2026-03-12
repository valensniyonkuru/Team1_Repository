-- Seed default categories so POST /api/posts (categoryId) validation passes.
-- Run against your backend DB (e.g. communityboard or communityboard_qa).
-- Docker: Get-Content scripts\seed-categories.sql | docker exec -i communityboard-db-staging psql -U postgres -d communityboard
-- Remote: use the same pipe with psql -h 13.60.89.185 -U postgres -d communityboard_qa

INSERT INTO categories (name, description) VALUES
  ('General', 'General discussion'),
  ('Events', 'Community events'),
  ('Help', 'Help and support'),
  ('Tech', 'Technology')
ON CONFLICT (name) DO NOTHING;
