-- Seed categories (idempotent)
INSERT INTO categories (id, name, description)
VALUES
    (nextval('category_seq'), 'Events', 'Community events, meetups, and gatherings'),
    (nextval('category_seq'), 'Lost & Found', 'Lost or found items and pets'),
    (nextval('category_seq'), 'Recommendations', 'Recommendations for local services and businesses'),
    (nextval('category_seq'), 'Help Requests', 'Requests for help from the community')
    ON CONFLICT (name) DO NOTHING;

-- Keep the sequence in sync
SELECT setval('category_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));