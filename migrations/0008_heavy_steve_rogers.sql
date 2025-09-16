DROP INDEX "user_project_type_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "user_project_type_idx" ON "user_notification" USING btree ("user_id","project_id");