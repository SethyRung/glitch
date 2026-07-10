ALTER TABLE "user" ADD COLUMN "native_user_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bridge_linked_at" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "bridge_issuer" text;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_native_user_id_unique" UNIQUE("native_user_id");