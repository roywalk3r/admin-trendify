-- CreateEnum
CREATE TYPE "public"."return_status" AS ENUM ('pending', 'approved', 'rejected', 'received', 'refunded', 'completed');

-- AlterTable
ALTER TABLE "public"."coupons" ADD COLUMN     "category_id" TEXT,
ADD COLUMN     "product_id" TEXT;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "delivered_at" TIMESTAMP(3),
ADD COLUMN     "driver_id" TEXT;

-- CreateTable
CREATE TABLE "public"."guest_sessions" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "cart_data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stock_alerts" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notified_at" TIMESTAMP(3),

    CONSTRAINT "stock_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."abandoned_carts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" VARCHAR(255) NOT NULL,
    "cart_data" JSONB NOT NULL,
    "cart_value" DECIMAL(12,2) NOT NULL,
    "reminders_sent" INTEGER NOT NULL DEFAULT 0,
    "recovered" BOOLEAN NOT NULL DEFAULT false,
    "recovered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_reminder" TIMESTAMP(3),

    CONSTRAINT "abandoned_carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."returns" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "order_item_ids" TEXT[],
    "reason" TEXT NOT NULL,
    "reason_details" TEXT,
    "status" "public"."return_status" NOT NULL DEFAULT 'pending',
    "refund_amount" DECIMAL(12,2) NOT NULL,
    "restock_fee" DECIMAL(12,2),
    "shipping_cost" DECIMAL(12,2),
    "return_label" VARCHAR(500),
    "received_date" TIMESTAMP(3),
    "refunded_date" TIMESTAMP(3),
    "images" TEXT[],
    "admin_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."drivers" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255),
    "license_no" VARCHAR(50) NOT NULL,
    "vehicle_type" VARCHAR(50) NOT NULL,
    "vehicle_no" VARCHAR(50) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "rating" DECIMAL(3,2),
    "total_trips" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drivers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "guest_sessions_session_id_key" ON "public"."guest_sessions"("session_id");

-- CreateIndex
CREATE INDEX "guest_sessions_session_id_idx" ON "public"."guest_sessions"("session_id");

-- CreateIndex
CREATE INDEX "guest_sessions_email_idx" ON "public"."guest_sessions"("email");

-- CreateIndex
CREATE INDEX "guest_sessions_expires_at_idx" ON "public"."guest_sessions"("expires_at");

-- CreateIndex
CREATE INDEX "stock_alerts_product_id_idx" ON "public"."stock_alerts"("product_id");

-- CreateIndex
CREATE INDEX "stock_alerts_email_idx" ON "public"."stock_alerts"("email");

-- CreateIndex
CREATE INDEX "stock_alerts_notified_idx" ON "public"."stock_alerts"("notified");

-- CreateIndex
CREATE INDEX "abandoned_carts_email_idx" ON "public"."abandoned_carts"("email");

-- CreateIndex
CREATE INDEX "abandoned_carts_recovered_idx" ON "public"."abandoned_carts"("recovered");

-- CreateIndex
CREATE INDEX "abandoned_carts_created_at_idx" ON "public"."abandoned_carts"("created_at");

-- CreateIndex
CREATE INDEX "returns_order_id_idx" ON "public"."returns"("order_id");

-- CreateIndex
CREATE INDEX "returns_status_idx" ON "public"."returns"("status");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_email_key" ON "public"."drivers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "drivers_license_no_key" ON "public"."drivers"("license_no");

-- CreateIndex
CREATE INDEX "drivers_is_active_idx" ON "public"."drivers"("is_active");

-- CreateIndex
CREATE INDEX "drivers_email_idx" ON "public"."drivers"("email");

-- CreateIndex
CREATE INDEX "coupons_product_id_idx" ON "public"."coupons"("product_id");

-- CreateIndex
CREATE INDEX "coupons_category_id_idx" ON "public"."coupons"("category_id");

-- CreateIndex
CREATE INDEX "orders_driver_id_idx" ON "public"."orders"("driver_id");

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupons" ADD CONSTRAINT "coupons_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."coupons" ADD CONSTRAINT "coupons_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
