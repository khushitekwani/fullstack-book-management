create database fullstack_final_exam;

use fullstack_final_exam;

 create table tbl_user(
    id bigint(20) primary key auto_increment,
    name varchar(64) ,
    mobile varchar(16) ,
    email varchar(128),
    password text,
    role enum('user', 'admin'),
    login_type enum('simple', 'google', 'facebook', 'apple') default 'simple',
    address text,
    location text,
    latitude varchar(16),
    longitude varchar(16),
    profile_image varchar(255) default 'default.jpeg',
    social_id varchar(255),
    notified tinyint(1),
    is_verified tinyint(1) default 0,
    is_completed tinyint(1) default 0,
    is_active boolean default 1,
    is_deleted boolean default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);


    create table tbl_user_device (
    id bigint(20) primary key auto_increment,
    user_id bigint(20),
    device_type enum('android', 'macos'),
    device_token varchar(255),
    os_version varchar(128),
    app_version varchar(128),
    time_zone varchar(128),
    user_token varchar(255),
    foreign key (user_id) references tbl_user (id) on delete cascade,
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

create table tbl_user_otp(
	id bigint(20) primary key auto_increment,
    mobile varchar(16),
    email varchar(128),
    type enum('email', 'mobile'),
    otp varchar(6) not null,
    user_id bigint(20),
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (user_id) references tbl_user (id) on delete cascade
);


create table tbl_admin(
    id bigint(20) primary key auto_increment,
    name varchar(64) ,
    mobile varchar(16) ,
    email varchar(128),
    password text,
    login_type enum('simple', 'google', 'facebook', 'apple') default 'simple',
    address text,
    location text,
    latitude varchar(16),
    longitude varchar(16),
    profile_image varchar(255) default 'default.jpeg',
    social_id varchar(255),
    is_verified tinyint(1) default 0,
    is_completed tinyint(1) default 0,
    is_active boolean default 1,
    is_deleted boolean default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);


    create table tbl_admin_device (
    id bigint(20) primary key auto_increment,
    admin_id bigint(20),
    device_type enum('android', 'macos'),
    device_token varchar(255),
    os_version varchar(128),
    app_version varchar(128),
    time_zone varchar(128),
    admin_token varchar(255),
    foreign key (admin_id) references tbl_admin (id) on delete cascade,
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);


create table tbl_admin_otp(
	id bigint(20) primary key auto_increment,
    mobile varchar(16),
    email varchar(128),
    type enum('email', 'mobile'),
    otp varchar(6) not null,
    admin_id bigint(20),
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (admin_id) references tbl_admin (id) on delete cascade
);

create table tbl_book(
	id bigint(20) primary key auto_increment,
    title varchar(64),
    description varchar(255),
    author varchar(64),
	is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);


create table tbl_genre(
	id bigint(20) primary key auto_increment,
    genre varchar(64),
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp
);

create table tbl_book_genre(
	id bigint(20) primary key auto_increment,
    book_id bigint(20),
    genre_id bigint(20),
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (book_id) references tbl_book(id),
    foreign key (genre_id) references tbl_genre(id)
);


drop table tbl_club;
drop table tbl_user_club;
create table tbl_club(
	id bigint(20) primary key auto_increment,
    name varchar(64),
    book_id bigint(20),
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (book_id) references tbl_book(id)
);

create table tbl_user_club(
	id bigint(20) primary key auto_increment,
    user_id bigint(20),
    club_id bigint(20),
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (user_id) references tbl_user(id),
    foreign key (club_id) references tbl_club(id)
);

create table tbl_book_progress(
	id bigint(20) primary key auto_increment,
    user_id bigint(20),
    book_id bigint(20),
    completion_percentage int,
    progress enum('not-started','reading','completed'),
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
	foreign key (user_id) references tbl_user(id),
    foreign key (book_id) references tbl_book(id)
);

create table tbl_discussion(
	id bigint(20) primary key auto_increment,
    title varchar(64),
    user_id bigint(20),
    book_id bigint(20),
    content text,
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (book_id) references tbl_book(id),
    foreign key (user_id) references tbl_user(id)
);


drop table tbl_chat;
create table tbl_chat(
	id bigint(20) primary key auto_increment,
    discussion_id bigint(20),
    user_id bigint(20),
    commenting_user_id bigint(20),
    comment text,
    is_like boolean default 0,
    is_active tinyint(1) default 1,
    is_deleted tinyint(1) default 0,
    created_at timestamp default current_timestamp,
    updated_at timestamp default current_timestamp on update current_timestamp,
    foreign key (discussion_id) references tbl_discussion(id),
    foreign key (user_id) references tbl_user(id),
    foreign key (commenting_user_id) references tbl_user(id)
);


INSERT INTO tbl_discussion (title, user_id, book_id, content)
VALUES
  ('Why is this book so inspiring?', 1, 1, 'This book really opened my mind about self-growth and productivity.'),
  ('Discussion on the ending', 2, 1, 'I felt the ending was a bit rushed. Anyone else agree?'),
  ('Favorite quote from the book', 1, 2, '“It is our choices, Harry, that show what we truly are, far more than our abilities.”'),
  ('Plot twists you didn’t expect', 3, 1, 'The twist in chapter 10 was totally unexpected!'),
  ('Is the author writing a sequel?', 1, 1, 'I heard rumors about a second book. Does anyone know if it’s confirmed?');

INSERT INTO tbl_book (title, description, author)
VALUES
('The Silent Patient', 'A psychological thriller about a woman''s act of violence against her husband—and of the therapist obsessed with uncovering her motive.', 'Alex Michaelides'),
('Atomic Habits', 'A proven framework for improving every day by focusing on small habits.', 'James Clear'),
('To Kill a Mockingbird', 'A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.', 'Harper Lee'),
('1984', 'A dystopian novel set in a totalitarian society ruled by Big Brother.', 'George Orwell'),
('The Alchemist', 'A philosophical book about a boy following his dream to find treasure.', 'Paulo Coelho'),
('Educated', 'A memoir about a woman who, kept out of school, leaves her survivalist family and earns a PhD from Cambridge University.', 'Tara Westover'),
('The Great Gatsby', 'A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.', 'F. Scott Fitzgerald'),
('Becoming', 'An intimate, powerful, and inspiring memoir by the former First Lady of the United States.', 'Michelle Obama'),
('The Subtle Art of Not Giving', 'A counterintuitive approach to living a good life.', 'Mark Manson'),
('The Book Thief', 'A story set in Nazi Germany narrated by Death, about a young girl who steals books.', 'Markus Zusak');



INSERT INTO tbl_genre (genre) VALUES
('Fiction'),
('Science Fiction'),
('Fantasy'),
('Mystery'),
('Romance'),
('Thriller'),
('Biography'),
('Self-Help'),
('History'),
('Young Adult');


-- Book 1: Fiction, Mystery
INSERT INTO tbl_book_genre (book_id, genre_id) VALUES (1, 1), (1, 4);

-- Book 2: Science Fiction, Fantasy
INSERT INTO tbl_book_genre (book_id, genre_id) VALUES (2, 2), (2, 3);

-- Book 3: Romance
INSERT INTO tbl_book_genre (book_id, genre_id) VALUES (3, 5);

-- Book 4: Biography, History
INSERT INTO tbl_book_genre (book_id, genre_id) VALUES (4, 7), (4, 9);

-- Book 5: Self-Help, Young Adult
INSERT INTO tbl_book_genre (book_id, genre_id) VALUES (5, 8), (5, 10);



INSERT INTO tbl_chat (discussion_id, user_id, commenting_user_id, comment, is_like)
VALUES 
  (1, 2, 2, 'This book really changed my perspective.',1 ),
  (1, 3, 3, 'I agree! The characters were well developed.', 1),
  (2, 3, 4, 'Can someone explain the ending?', 0),
  (2, 3, 2, 'I think the author left it open to interpretation.', 1);


-- User 1 has started reading Book 10
INSERT INTO tbl_book_progress (user_id, book_id, completion_percentage, progress)
VALUES (1, 1, 30, 'reading');

-- User 1 has completed Book 20
INSERT INTO tbl_book_progress (user_id, book_id, completion_percentage, progress)
VALUES (1, 2, 100, 'completed');

-- User 2 has not started Book 10
INSERT INTO tbl_book_progress (user_id, book_id, completion_percentage, progress)
VALUES (2, 5, 0, 'not-started');

INSERT INTO tbl_book_progress (user_id, book_id, completion_percentage, progress)
VALUES (3, 5, 0, 'not-started');


INSERT INTO tbl_book_progress (user_id, book_id, completion_percentage, progress)
VALUES (3, 2, 0, 'not-started');


INSERT INTO tbl_club (name, book_id, is_active, is_deleted) VALUES
('Book Lovers Club',  1, 1, 0),
('Fiction Readers Club', 2, 1, 0),
('Non-Fiction Enthusiasts', 3, 1, 0),
('Sci-Fi & Fantasy Club', 1, 1, 0),
('Mystery & Thriller Club',1, 1, 0);

INSERT INTO tbl_user_club (user_id, club_id, is_active, is_deleted) VALUES
(1, 1, 1, 0), 
(1, 1, 1, 0), 
(2, 3, 1, 0), 
(3, 1, 3, 0),
(2, 1, 1, 0); 


ALTER TABLE tbl_user ADD COLUMN user_role ENUM('user', 'moderator', 'admin') DEFAULT 'user';


ALTER TABLE tbl_user_club ADD COLUMN is_approve Boolean DEFAULT 0;

