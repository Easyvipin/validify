CREATE TABLE "user_notification" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"project_id" integer NOT NULL,
	"type" text NOT NULL,
	"last_read_at" timestamp,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_notification_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"project_id" integer NOT NULL,
	"triggered_by" text NOT NULL,
	"type" text NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_notification_history" ADD CONSTRAINT "user_notification_history_user_id_user_clerk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_history" ADD CONSTRAINT "user_notification_history_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_notification_history" ADD CONSTRAINT "user_notification_history_triggered_by_user_clerk_user_id_fk" FOREIGN KEY ("triggered_by") REFERENCES "public"."user"("clerk_user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_project_type_idx" ON "user_notification" USING btree ("user_id","project_id","type");