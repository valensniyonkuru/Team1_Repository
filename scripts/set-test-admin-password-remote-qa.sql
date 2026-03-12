-- Run this against the REMOTE QA DB (13.60.89.185 communityboard_qa).
-- Your LOCAL backend (java.exe on 8080) uses this DB via application-test.yml.
-- Password: QAAdmin@123 (Spring BCryptPasswordEncoder hash)

UPDATE users
SET password = '$2a$10$J9CD0lrAp9aqO7Gm7RmMnu59LQhh/0tZwgXKytzVQGlx4uVCYi9MS'
WHERE email = 'admin@amalitech.com';
