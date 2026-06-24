ALTER TABLE "accounts" ADD COLUMN "initial_balance" numeric(14, 2);--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "tracking_start_month" date;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD COLUMN "onboarding_completed_at" timestamp with time zone;