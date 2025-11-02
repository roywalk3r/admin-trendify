-- CreateTable
CREATE TABLE "public"."device_push_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "device_id" VARCHAR(255) NOT NULL,
    "platform" VARCHAR(20) NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_push_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_push_tokens_token_key" ON "public"."device_push_tokens"("token");

-- CreateIndex
CREATE INDEX "device_push_tokens_user_id_idx" ON "public"."device_push_tokens"("user_id");

-- CreateIndex
CREATE INDEX "device_push_tokens_device_id_idx" ON "public"."device_push_tokens"("device_id");

-- CreateIndex
CREATE INDEX "device_push_tokens_platform_idx" ON "public"."device_push_tokens"("platform");

-- AddForeignKey
ALTER TABLE "public"."device_push_tokens" ADD CONSTRAINT "device_push_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
