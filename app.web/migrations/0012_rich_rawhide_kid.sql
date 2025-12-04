ALTER TABLE "travels" ADD COLUMN "join_code" varchar(255);
UPDATE "travels" SET "join_code" = substring(md5(random()::text) FROM 1 FOR 6);
ALTER TABLE "travels" ALTER COLUMN "join_code" SET NOT NULL;
ALTER TABLE "travels" ADD CONSTRAINT "travels_joinCode_unique" UNIQUE("join_code");