CREATE TYPE "public"."transaction_kind" AS ENUM('income', 'expense', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."transaction_origin" AS ENUM('manual', 'import', 'recurring', 'integration');--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"category_id" uuid,
	"amount" numeric(14, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'BRL' NOT NULL,
	"kind" "transaction_kind" NOT NULL,
	"description" text,
	"occurred_at" timestamp with time zone NOT NULL,
	"origin" "transaction_origin" NOT NULL,
	"dedupe_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_user_id_occurred_at_idx" ON "transactions" USING btree ("user_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "transactions_account_id_dedupe_hash_unique_idx" ON "transactions" USING btree ("account_id","dedupe_hash") WHERE "transactions"."deleted_at" IS NULL;