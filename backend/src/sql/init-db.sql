-- Create user table
CREATE TABLE IF NOT EXISTS users (

    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    fname  VARCHAR(50),
    lname VARCHAR(50),
    description TEXT,
    dob DATE,
    icon VARCHAR(255),
    pwd VARCHAR(255)
);

-- Create comment table
CREATE TABLE IF NOT EXISTS comments (

    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    layer INTEGER,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    article_id INTEGER,
    parent_cid INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_cid) REFERENCES comments(id) ON DELETE CASCADE
);

-- Create article table
CREATE TABLE IF NOT EXISTS articles (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    title VARCHAR(255),
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create img table
CREATE TABLE IF NOT EXISTS imgs(
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    path VARCHAR(255),
    article_id INTEGER,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Create like_c table (user likes comment relationship)
CREATE TABLE IF NOT EXISTS like_c (
    user_id INTEGER NOT NULL,
    comment_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, comment_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Create like_a table (user likes article relationship)
CREATE TABLE IF NOT EXISTS like_a (
    user_id INTEGER NOT NULL,
    article_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, article_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Insert data into users table
INSERT INTO users (username, fname, lname, description, dob, icon, pwd) VALUES
('john_dssoe', 'John', 'Doe', 'A sample user', '1985-06-15', 'icon1.png', 'password123'),
('jane_smssith', 'Jane', 'Smith', 'Another sample user', '1990-11-23', 'icon2.png', 'password456'),
('alice_joneas', 'Alice', 'Jones', 'Yet another user', '1978-03-09', 'icon3.png', 'password789');

-- Insert data into articles table
INSERT INTO articles (id, content, date_time, title, user_id) VALUES
(1, 'This is the content of article 1', '2025-01-15 10:00:00', 'Article One', 1),
(2, 'This is the content of article 2', '2025-01-20 12:30:00', 'Article Two', 2),
(3, 'This is the content of article 3', '2025-01-25 15:45:00', 'Article Three', 3);

-- Insert data into comments table
INSERT INTO comments (id, content, layer, date_time, user_id, article_id, parent_cid) VALUES
(1, 'This is a comment on article 1', 1, '2025-01-15 11:00:00', 2, 1, NULL),
(2, 'This is a reply to comment 1 on article 1', 2, '2025-01-15 11:30:00', 3, 1, 1),
(3, 'This is another comment on article 2', 1, '2025-01-20 13:00:00', 1, 2, NULL);

-- Insert data into imgs table
INSERT INTO imgs (id, path, article_id) VALUES
(1, 'path/to/image1.jpg', 1),
(2, 'path/to/image2.jpg', 2),
(3, 'path/to/image3.jpg', 3);

-- Insert data into like_c table (user likes comment relationship)
INSERT INTO like_c (user_id, comment_id) VALUES
(1, 1),
(2, 2),
(3, 3);

-- Insert data into like_a table (user likes article relationship)
INSERT INTO like_a (user_id, article_id) VALUES
(1, 1),
(2, 2),
(3, 3);
