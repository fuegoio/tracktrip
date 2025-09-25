ALTER TABLE "transactions" ALTER COLUMN "category" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "type" "category_types" NOT NULL;