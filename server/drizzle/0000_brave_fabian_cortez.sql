CREATE TABLE `dbrap_users_table` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` varchar(66) NOT NULL,
	`salt` text,
	`role` varchar(20) NOT NULL,
	`refresh_token` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp,
	CONSTRAINT `dbrap_users_table_id` PRIMARY KEY(`id`)
);
