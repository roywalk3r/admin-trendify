-- CreateTable
CREATE TABLE "translation_cache" (
    "id" TEXT NOT NULL,
    "locale" VARCHAR(10) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "translation_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "translation_cache_locale_idx" ON "translation_cache"("locale");

-- CreateIndex
CREATE UNIQUE INDEX "translation_cache_locale_key_key" ON "translation_cache"("locale", "key");
