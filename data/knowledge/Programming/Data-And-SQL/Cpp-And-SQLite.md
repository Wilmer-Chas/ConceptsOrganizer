# Combining C++ and SQLite

## Creating a database

You typically do **not** need a separate `CREATE DATABASE` for SQLite. Opening a file with `sqlite3_open` creates the DB file if it does not exist — you mainly need a local file path.

## Tables & data

Use SQL (`CREATE TABLE`, `INSERT`, `SELECT`, …) through the SQLite C API (or a wrapper) from C++. Inspect the same file with DBeaver while debugging.
