CREATE TABLE `alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`service_name` varchar(100),
	`message` text NOT NULL,
	`severity` varchar(50) DEFAULT 'warning',
	`is_resolved` boolean DEFAULT false,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`container_name` varchar(100) NOT NULL,
	`status` varchar(50),
	`port` varchar(100),
	`cpu_usage` varchar(50),
	`memory_usage` varchar(50),
	`last_checked_at` datetime,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`role` varchar(50) DEFAULT 'operator',
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
