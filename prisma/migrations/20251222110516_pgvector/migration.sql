/*
  Warnings:

  - You are about to alter the column `name` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(150)`.
  - You are about to alter the column `slug` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(150)`.

*/
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- AlterTable
ALTER TABLE "public"."products" ADD COLUMN     "embedding" vector,
ADD COLUMN     "neighbor_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "name" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "slug" SET DATA TYPE VARCHAR(150);
