CREATE TABLE "course_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"default_required_count" integer NOT NULL,
	"registration_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "course_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "submission_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid,
	"submission_date" date NOT NULL,
	"attempt_order" integer,
	"result" text NOT NULL,
	"reason" text,
	"api_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_course_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"external_course_id" text NOT NULL,
	"course_code" text,
	"course_name" text NOT NULL,
	"syllabus" text,
	"lecturer" text,
	"room" text,
	"course_type_id" uuid,
	"day" text NOT NULL,
	"time_slot_label" text,
	"start_time" text,
	"end_time" text,
	"plan_type" text NOT NULL,
	"priority_order" integer,
	"linked_primary_id" uuid,
	"status" text DEFAULT 'planned' NOT NULL,
	"registered_at" timestamp with time zone,
	"failed_reason" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_course_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_type_id" uuid NOT NULL,
	"required_count" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_course_settings_user_id_course_type_id_unique" UNIQUE("user_id","course_type_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text,
	"refresh_token" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "submission_history" ADD CONSTRAINT "submission_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_history" ADD CONSTRAINT "submission_history_plan_id_user_course_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."user_course_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_plans" ADD CONSTRAINT "user_course_plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_plans" ADD CONSTRAINT "user_course_plans_course_type_id_course_types_id_fk" FOREIGN KEY ("course_type_id") REFERENCES "public"."course_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_plans" ADD CONSTRAINT "user_course_plans_linked_primary_id_user_course_plans_id_fk" FOREIGN KEY ("linked_primary_id") REFERENCES "public"."user_course_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_settings" ADD CONSTRAINT "user_course_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_settings" ADD CONSTRAINT "user_course_settings_course_type_id_course_types_id_fk" FOREIGN KEY ("course_type_id") REFERENCES "public"."course_types"("id") ON DELETE no action ON UPDATE no action;