CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"polar_customer_id" text NOT NULL,
	"profile_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_token_topups" (
	"id" uuid PRIMARY KEY NOT NULL,
	"generation_token_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"profile_id" uuid NOT NULL,
	"polar_order_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"initial_token_amount" integer NOT NULL,
	"available_tokens" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"generation_token_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_token_topups" ADD CONSTRAINT "generation_token_topups_generation_token_id_generation_tokens_id_fk" FOREIGN KEY ("generation_token_id") REFERENCES "public"."generation_tokens"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_token_topups" ADD CONSTRAINT "generation_token_topups_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_tokens" ADD CONSTRAINT "generation_tokens_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generation_transactions" ADD CONSTRAINT "generation_transactions_generation_token_id_generation_tokens_id_fk" FOREIGN KEY ("generation_token_id") REFERENCES "public"."generation_tokens"("id") ON DELETE no action ON UPDATE no action;