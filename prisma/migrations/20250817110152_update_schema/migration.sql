/*
  Warnings:

  - You are about to alter the column `action` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `entity_type` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `image` on the `categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(500)`.
  - You are about to drop the column `price` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `payment_method` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `payment_status` on the `payments` table. All the data in the column will be lost.
  - The `status` column on the `products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `productId` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the `hero` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[order_number]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sku]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[barcode]` on the table `product_variants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[barcode]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,product_id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `tags` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerk_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product_name` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_price` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_price` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_number` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `method` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."product_status" AS ENUM ('active', 'inactive', 'draft', 'archived', 'out_of_stock');

-- DropForeignKey
ALTER TABLE "public"."categories" DROP CONSTRAINT "categories_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."orders" DROP CONSTRAINT "orders_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."products" DROP CONSTRAINT "products_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."tags" DROP CONSTRAINT "tags_productId_fkey";

-- DropIndex
DROP INDEX "public"."categories_is_active_idx";

-- DropIndex
DROP INDEX "public"."orders_payment_status_idx";

-- DropIndex
DROP INDEX "public"."orders_status_idx";

-- DropIndex
DROP INDEX "public"."payments_payment_status_idx";

-- DropIndex
DROP INDEX "public"."products_is_active_idx";

-- DropIndex
DROP INDEX "public"."products_is_deleted_idx";

-- DropIndex
DROP INDEX "public"."products_is_featured_idx";

-- DropIndex
DROP INDEX "public"."products_status_idx";

-- DropIndex
DROP INDEX "public"."reviews_user_id_idx";

-- AlterTable
ALTER TABLE "public"."audit_logs" ADD COLUMN     "ip_address" VARCHAR(45),
ADD COLUMN     "user_agent" VARCHAR(500),
ADD COLUMN     "user_email" VARCHAR(255),
ALTER COLUMN "action" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "entity_type" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "public"."categories" ADD COLUMN     "is_featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "seo_description" VARCHAR(500),
ADD COLUMN     "seo_title" VARCHAR(255),
ADD COLUMN     "sort_order" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "image" SET DATA TYPE VARCHAR(500);

-- AlterTable
ALTER TABLE "public"."order_items" DROP COLUMN "price",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "product_data" JSONB,
ADD COLUMN     "product_name" VARCHAR(255) NOT NULL,
ADD COLUMN     "product_sku" VARCHAR(100),
ADD COLUMN     "total_price" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "unit_price" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."orders" ADD COLUMN     "customer_notes" TEXT,
ADD COLUMN     "estimated_delivery" TIMESTAMP(3),
ADD COLUMN     "order_number" VARCHAR(50) NOT NULL,
ADD COLUMN     "shipping_method" VARCHAR(100),
ALTER COLUMN "total_amount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "tax" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "shipping" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "discount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."payments" DROP COLUMN "payment_method",
DROP COLUMN "payment_status",
ADD COLUMN     "failed_at" TIMESTAMP(3),
ADD COLUMN     "failure_reason" TEXT,
ADD COLUMN     "gateway_fee" DECIMAL(10,2),
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "method" "public"."payment_method" NOT NULL,
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "status" "public"."payment_status" NOT NULL DEFAULT 'unpaid',
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."product_variants" ADD COLUMN     "barcode" VARCHAR(100),
ADD COLUMN     "cost_price" DECIMAL(12,2),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "weight" DECIMAL(8,3),
ALTER COLUMN "sku" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "barcode" VARCHAR(100),
ADD COLUMN     "cost_price" DECIMAL(12,2),
ADD COLUMN     "dimensions" JSONB,
ADD COLUMN     "low_stock_alert" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "seo_description" VARCHAR(500),
ADD COLUMN     "seo_title" VARCHAR(255),
ADD COLUMN     "short_description" VARCHAR(500),
ADD COLUMN     "weight" DECIMAL(8,3),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "compare_price" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "sku" SET DATA TYPE VARCHAR(100),
DROP COLUMN "status",
ADD COLUMN     "status" "public"."product_status" NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "public"."reviews" ADD COLUMN     "helpful_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "is_approved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "order_id" TEXT,
ALTER COLUMN "rating" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."tags" DROP COLUMN "productId",
ADD COLUMN     "color" VARCHAR(7),
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "slug" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "avatar" VARCHAR(500),
ADD COLUMN     "clerk_id" VARCHAR(255),
ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_login_at" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."hero";

-- CreateTable
CREATE TABLE "public"."hero_slides" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "subtitle" VARCHAR(500),
    "image" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "buttonLink" VARCHAR(500),
    "buttonText" VARCHAR(100),
    "color" VARCHAR(50),
    "description" TEXT,

    CONSTRAINT "hero_slides_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_tags" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "hero_slides_is_active_sort_order_idx" ON "public"."hero_slides"("is_active", "sort_order");

-- CreateIndex
CREATE INDEX "product_tags_product_id_idx" ON "public"."product_tags"("product_id");

-- CreateIndex
CREATE INDEX "product_tags_tag_id_idx" ON "public"."product_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_tags_product_id_tag_id_key" ON "public"."product_tags"("product_id", "tag_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "public"."audit_logs"("action");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "public"."categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_is_active_is_featured_idx" ON "public"."categories"("is_active", "is_featured");

-- CreateIndex
CREATE INDEX "categories_sort_order_idx" ON "public"."categories"("sort_order");

-- CreateIndex
CREATE INDEX "order_items_variant_id_idx" ON "public"."order_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "public"."orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_order_number_idx" ON "public"."orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_status_payment_status_idx" ON "public"."orders"("status", "payment_status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "public"."orders"("created_at");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "public"."payments"("status");

-- CreateIndex
CREATE INDEX "payments_method_idx" ON "public"."payments"("method");

-- CreateIndex
CREATE INDEX "payments_transaction_id_idx" ON "public"."payments"("transaction_id");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "public"."payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_sku_key" ON "public"."product_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_barcode_key" ON "public"."product_variants"("barcode");

-- CreateIndex
CREATE INDEX "product_variants_sku_idx" ON "public"."product_variants"("sku");

-- CreateIndex
CREATE INDEX "product_variants_barcode_idx" ON "public"."product_variants"("barcode");

-- CreateIndex
CREATE INDEX "product_variants_is_active_idx" ON "public"."product_variants"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "public"."products"("barcode");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "public"."products"("sku");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "public"."products"("barcode");

-- CreateIndex
CREATE INDEX "products_is_deleted_is_active_idx" ON "public"."products"("is_deleted", "is_active");

-- CreateIndex
CREATE INDEX "products_is_featured_is_active_idx" ON "public"."products"("is_featured", "is_active");

-- CreateIndex
CREATE INDEX "products_status_is_active_idx" ON "public"."products"("status", "is_active");

-- CreateIndex
CREATE INDEX "products_stock_idx" ON "public"."products"("stock");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "public"."reviews"("rating");

-- CreateIndex
CREATE INDEX "reviews_is_approved_idx" ON "public"."reviews"("is_approved");

-- CreateIndex
CREATE INDEX "reviews_is_verified_idx" ON "public"."reviews"("is_verified");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "public"."reviews"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_user_id_product_id_key" ON "public"."reviews"("user_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "public"."tags"("slug");

-- CreateIndex
CREATE INDEX "tags_is_active_idx" ON "public"."tags"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "public"."users"("clerk_id");

-- CreateIndex
CREATE INDEX "users_clerk_id_idx" ON "public"."users"("clerk_id");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "public"."users"("role", "isActive");

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_tags" ADD CONSTRAINT "product_tags_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_tags" ADD CONSTRAINT "product_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
