drop database if exists bridge;
create database bridge;

use bridge;

create table users (
	id int AUTO_INCREMENT,
	isGroup boolean,
	name varchar(100),
	email varchar(256),
	password char(60),
	primary key (id)
);

create table events (
	id int AUTO_INCREMENT,
	groupId int,
	title varchar(100),
	location varchar(100),
	eventDate date,
	description varchar(1000),
	primary key (id),
	foreign key (groupId) references users (id)
)
