ALTER TABLE "transactions" DROP CONSTRAINT "transactions_category_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_place_places_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "users" SET DATA TYPE text[];--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_place_places_id_fk" FOREIGN KEY ("place") REFERENCES "public"."places"("id") ON DELETE set null ON UPDATE no action;