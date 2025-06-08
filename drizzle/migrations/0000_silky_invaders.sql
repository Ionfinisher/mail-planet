CREATE TABLE "ip_locations" (
	"ip_address" text PRIMARY KEY NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"country_flag" varchar,
	"city" text,
	"country" text,
	"raw_data" jsonb,
	"email_count" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
