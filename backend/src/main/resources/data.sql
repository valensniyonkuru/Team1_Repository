-- Seed categories (idempotent)
INSERT INTO categories (id, name, description)
VALUES
    (nextval('category_seq'), 'Event', 'Community events, meetups, and gatherings'),
    (nextval('category_seq'), 'News', 'Lost or found items and pets'),
    (nextval('category_seq'), 'Discussion', 'Recommendations for local services and businesses'),
    (nextval('category_seq'), 'Alert', 'Requests for help from the community')
    ON CONFLICT (name) DO NOTHING;

-- Keep the sequence in sync
SELECT setval('category_seq', (SELECT COALESCE(MAX(id), 1) FROM categories))