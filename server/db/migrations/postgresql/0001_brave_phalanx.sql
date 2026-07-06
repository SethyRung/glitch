ALTER TABLE "purchases" ADD COLUMN "qty" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "order_group_id" text;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
CREATE INDEX "purchases_order_group_id_idx" ON "purchases" USING btree ("order_group_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchases_user_idempotency_key_uniq" ON "purchases" USING btree ("user_id","idempotency_key") WHERE "purchases"."idempotency_key" IS NOT NULL;