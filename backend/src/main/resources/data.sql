-- Seed categories (idempotent: skip if already present)
INSERT INTO categories (id, name, description)
VALUES
    (1, 'Events', 'Community events, meetups, and gatherings'),
    (2, 'Lost & Found', 'Lost or found items and pets'),
    (3, 'Recommendations', 'Recommendations for local services and businesses'),
    (4, 'Help Requests', 'Requests for help from the community')
ON CONFLICT (id) DO NOTHING;

-- Keep the sequence in sync so new inserts get the next ID
SELECT setval('categories_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
