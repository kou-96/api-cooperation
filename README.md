CREATE DATABASE accounts;
データベースを作成。

CREATE TABLE users (id serial PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE,email VARCHAR(255) NOT NULL UNIQUE,password VARCHAR(50) NOT NULL)
テーブルを作成。

INSERT INTO users (username, email, password)VALUES ('gonzou', 'gonzou@gmail.com','quesuithuki');
users を作成。

GRANT ALL PRIVILEGES ON TABLE users TO account;
これで account に権限を与える。
