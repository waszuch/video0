ALTER TABLE "generated_assets" RENAME COLUMN "proflie_id" TO "profile_id";--> statement-breakpoint
ALTER TABLE "generated_assets" DROP CONSTRAINT "generated_assets_proflie_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "generated_assets" ADD CONSTRAINT "generated_assets_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;