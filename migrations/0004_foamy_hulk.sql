ALTER TABLE "project" DROP CONSTRAINT "project_user_id_user_clerk_user_id_fk";
--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "logoUrl" text;--> statement-breakpoint
ALTER TABLE "project" ADD CONSTRAINT "project_user_id_user_clerk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("clerk_user_id") ON DELETE cascade ON UPDATE cascade;