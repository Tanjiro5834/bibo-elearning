-- V3__seed_admin.sql
INSERT INTO users (username, email, password, enabled, role_id)
VALUES (
  'admin',
  'admin@bibo.com',
  '$2a$10$tOkc8FB4utzTFZ1CZ5kL8.mxo3d9YIeyx3sEXzwJKUT/I3edGsj/q',
  b'1',
  1
);