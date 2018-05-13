drop database if exists bridge;
create database bridge;

use bridge;

create table users (
	id int AUTO_INCREMENT,
	isGroup boolean,
	email varchar(256),
	name varchar(100),
	password char(57),
	primary key (id)
);
