ALTER TYPE "public"."category_types" ADD VALUE 'activity';--> statement-breakpoint
ALTER TYPE "public"."category_types" ADD VALUE 'other';--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"travel" uuid NOT NULL,
	"category_type" "category_types",
	"category" uuid,
	"amount" real NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_travel_travels_id_fk" FOREIGN KEY ("travel") REFERENCES "public"."travels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;