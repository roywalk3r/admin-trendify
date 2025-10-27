-- CreateTable
CREATE TABLE "public"."driver_service_cities" (
    "driverId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "driver_service_cities_pkey" PRIMARY KEY ("driverId","cityId")
);

-- CreateTable
CREATE TABLE "public"."newsletter_subscriptions" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "subscribed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "newsletter_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "driver_service_cities_cityId_idx" ON "public"."driver_service_cities"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscriptions_email_key" ON "public"."newsletter_subscriptions"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_email_idx" ON "public"."newsletter_subscriptions"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscriptions_is_active_idx" ON "public"."newsletter_subscriptions"("is_active");

-- AddForeignKey
ALTER TABLE "public"."driver_service_cities" ADD CONSTRAINT "driver_service_cities_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "public"."drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."driver_service_cities" ADD CONSTRAINT "driver_service_cities_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "public"."delivery_cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
