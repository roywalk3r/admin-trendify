/*
  Warnings:

  - A unique constraint covering the columns `[cart_id,product_id,variant_id,color,size]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."user_role" ADD VALUE 'super_admin';
ALTER TYPE "public"."user_role" ADD VALUE 'manager';
ALTER TYPE "public"."user_role" ADD VALUE 'support';
ALTER TYPE "public"."user_role" ADD VALUE 'content_editor';

-- DropIndex
DROP INDEX "public"."cart_items_cart_id_product_id_color_size_key";

-- AlterTable
ALTER TABLE "public"."cart_items" ADD COLUMN     "variant_id" TEXT;

-- CreateIndex
CREATE INDEX "cart_items_variant_id_idx" ON "public"."cart_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_variant_id_color_size_key" ON "public"."cart_items"("cart_id", "product_id", "variant_id", "color", "size");
