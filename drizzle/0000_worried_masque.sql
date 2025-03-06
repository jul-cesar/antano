CREATE TABLE `closed_days` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`date` text NOT NULL,
	`reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`date` text NOT NULL,
	`time` text NOT NULL,
	`customer_name` text,
	`customer_contact` text,
	`status` text DEFAULT 'active' NOT NULL,
	`cancel_reason` text,
	`attendance_status` text DEFAULT 'pending' NOT NULL,
	`attendance_time` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "date_check" CHECK("reservations"."date" >= DATE('now')),
	CONSTRAINT "status_check" CHECK("reservations"."status" IN ('active', 'canceled', 'modified')),
	CONSTRAINT "attendance_status_check" CHECK("reservations"."attendance_status" IN ('pending', 'attended', 'late', 'no_show'))
);
--> statement-breakpoint
CREATE TABLE `special_schedules` (
	`id` text PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))) NOT NULL,
	`date` text NOT NULL,
	`open_time` text NOT NULL,
	`close_time` text NOT NULL,
	`reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `special_schedules_date_unique` ON `special_schedules` (`date`);