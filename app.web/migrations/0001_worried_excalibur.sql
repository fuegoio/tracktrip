CREATE TYPE "public"."category_types" AS ENUM('food', 'accommodation', 'transport');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"travel" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "category_types" NOT NULL,
	"emoji" varchar(255) NOT NULL,
	"color" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "places" (
	"id" uuid PRIMARY KEY NOT NULL,
	"travel" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"travel" uuid NOT NULL,
	"user" text NOT NULL,
	"date" date NOT NULL,
	"amount" numeric NOT NULL,
	"currency" varchar(255) NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" uuid NOT NULL,
	"place" uuid,
	"days" integer,
	"meals" integer
);
--> statement-breakpoint
CREATE TABLE "travels_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user" text NOT NULL,
	"travel" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_travel_travels_id_fk" FOREIGN KEY ("travel") REFERENCES "public"."travels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "places" ADD CONSTRAINT "places_travel_travels_id_fk" FOREIGN KEY ("travel") REFERENCES "public"."travels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_travel_travels_id_fk" FOREIGN KEY ("travel") REFERENCES "public"."travels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_categories_id_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_place_places_id_fk" FOREIGN KEY ("place") REFERENCES "public"."places"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travels_users" ADD CONSTRAINT "travels_users_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "travels_users" ADD CONSTRAINT "travels_users_travel_travels_id_fk" FOREIGN KEY ("travel") REFERENCES "public"."travels"("id") ON DELETE cascade ON UPDATE no action;