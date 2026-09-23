-- TASK 1

CREATE ROLE library_guest;
-- CREATE ROLE

\du;

--                                List of roles                                                                      
--    Role name   |                         Attributes                         
-- ---------------+------------------------------------------------------------
--  library_guest | Cannot login
--  postgres      | Superuser, Create role, Create DB, Replication, Bypass RLS

SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname = 'library_guest';

--     rolname    | rolcanlogin                                                                                      
-- ---------------+-------------
--  library_guest | f
-- (1 row)

-- Following is a new connection, not inside the current psql session 

psql -U library_guest -d postgres
Password for user library_guest: 

-- psql: error: connection to server at "localhost" (::1), port 5432 failed: FATAL:  password authentication failed for user "library_guest"

-- Connection failed because library_guest was created without LOGIN privilege and has no password set.
-- PostgreSQL requires a password fior localconnections, and since none exists for this role, authentication fails immediately
-- reinforcing that this role cannot be used to connect.

-- TASK 2

CREATE ROLE library_staff WITH LOGIN PASSWORD 'password123';

-- or

CREATE USER library_staff WITH PASSWORD 'password123';

-- CREATE ROLE

\du

--                                List of roles                                                     
--    Role name   |                         Attributes                         
-- ---------------+------------------------------------------------------------
--  library_guest | Cannot login
--  library_staff | 
--  postgres      | Superuser, Create role, Create DB, Replication, Bypass RLS

-- Following is a new connection, not inside the current psql session 

psql -U library_staff -d postgres
Password for user library_staff: 

-- psql (18.6)
-- WARNING: Console code page (866) differs from Windows code page (1251)
-- 8-bit characters might not work correctly. See psql reference 
-- page "Notes for Windows users" for details.
-- Type "help" for help.

-- postgres=> 

\l

-- library_guest has no LOGIN privileg, so it can never connect - cinfirmed by Cannot login in \du. 
-- library_staff was created WITH LOGIN PASSWORD, so it authenticates successfully and opens a real session. The difference is the LOGIN attribute:
-- it's what turns a role into a usable account. 


-- TASK 3

CREATE DATABASE library_db;
-- CREATE DATABASE

\l

--     Name     |  Owner   | Encoding | Locale Provider |        Collate        |         Ctype         | Locale | ICU Rules |   Access privileges   
-- -------------+----------+----------+-----------------+-----------------------+-----------------------+--------+-----------+-----------------------
--  library_db  | postgres | UTF8     | libc            | Armenian_Armenia.1251 | Armenian_Armenia.1251 |        |           | 

\c library_db
-- You are now connected to database "library_db" as user "postgres".

SELECT current_database();
--  current_database                                                                                 
-- ------------------
--  library_db

-- or

\conninfo

--       Connection Information                                                                      
--       Parameter       |   Value    
-- ----------------------+------------
--  Database             | library_db
--  Client User          | postgres
--  Host                 | localhost

-- TASK 4

CREATE TABLE books (
    book_id INTEGER,
    title TEXT,
    author VARCHAR(100),
    price NUMERIC(6, 2),
    in_stock BOOLEAN,
    published_on DATE,
    added_at TIMESTAMPTZ
);
-- CREATE TABLE

\d books

--                            Table "public.books"                                                   
--     Column    |           Type           | Collation | Nullable | Default 
-- --------------+--------------------------+-----------+----------+---------
--  book_id      | integer                  |           |          | 
--  title        | text                     |           |          | 
--  author       | character varying(100)   |           |          | 
--  price        | numeric(6,2)             |           |          | 
--  in_stock     | boolean                  |           |          | 
--  published_on | date                     |           |          | 
--  added_at     | timestamp with time zone |           |          | 

-- price → NUMERIC(6,2): exact decimal, no rounding errors — important for money.
-- in_stock → BOOLEAN: native true/false type for a yes/no field.
-- added_at → TIMESTAMPTZ: timezone-aware, unambiguous timestamp.

-- Before beginning Task 5
ALTER TABLE books ALTER COLUMN book_id SET NOT NULL;
-- ALTER TABLE

ALTER TABLE books ALTER COLUMN book_id ADD GENERATED ALWAYS AS IDENTITY;
-- ALTER TABLE

\d books

--                                      Table "public.books"                                         
--     Column    |           Type           | Collation | Nullable |           Default            
-- --------------+--------------------------+-----------+----------+------------------------------
--  book_id      | integer                  |           | not null | generated always as identity
--  title        | text                     |           |          | 
--  author       | character varying(100)   |           |          | 
--  price        | numeric(6,2)             |           |          | 
--  in_stock     | boolean                  |           |          | 
--  published_on | date                     |           |          | 
--  added_at     | timestamp with time zone |           |          | 


-- TASK 5

INSERT INTO books (title, author, price, in_stock, published_on, added_at) VALUES
('The Pragmatic Programmer', 'Andrew Hunt', 34.99, TRUE, '1999-10-30', now()),
('Clean Code', 'Robert C. Martin', 29.99, TRUE, '2008-08-01', now()),
('The Mythical Man-Month', 'Frederick Brooks', 19.99, FALSE, '1975-01-01', now());

-- INSERT 0 3

SELECT * FROM books;

--  book_id |          title           |      author      | price | in_stock | published_on |           added_at            
-- ---------+--------------------------+------------------+-------+----------+--------------+-------------------------------
--        1 | The Pragmatic Programmer | Andrew Hunt      | 34.99 | t        | 1999-10-30   | 2026-09-23 15:04:37.052374+04
--        2 | Clean Code               | Robert C. Martin | 29.99 | t        | 2008-08-01   | 2026-09-23 15:04:37.052374+04
--        3 | The Mythical Man-Month   | Frederick Brooks | 19.99 | f        | 1975-01-01   | 2026-09-23 15:04:37.052374+04
-- (3 rows)

SELECT title, price FROM books WHERE in_stock = TRUE;

--           title           | price                                                                
-- --------------------------+-------
--  The Pragmatic Programmer | 34.99
--  Clean Code               | 29.99
-- (2 rows)

-- TASK 6

GRANT SELECT ON books to library_staff;
-- GRANT

-- Following is a new connection, not inside the current psql session 

INSERT INTO books (title, author, price, in_stock, published_on, added_at) VALUES
('Test Book', 'Test Author', 9.99, TRUE, '2020-01-01', now());
-- ERROR:  permission denied for table books

-- The INSERT failed with a permission error because I only granted SELECT on books 
-- to library_staff — that only allows reading rows, not adding them.
-- library_staff can query the table but has no write access at all.