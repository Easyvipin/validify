CREATE TABLE "project_click" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" text,
	"session_id" text,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_vote" (
	"project_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_vote_project_id_user_id_pk" PRIMARY KEY("project_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "project_click" ADD CONSTRAINT "project_click_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_click" ADD CONSTRAINT "project_click_user_id_user_clerk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("clerk_user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_vote" ADD CONSTRAINT "project_vote_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_vote" ADD CONSTRAINT "project_vote_user_id_user_clerk_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("clerk_user_id") ON DELETE no action ON UPDATE no action;