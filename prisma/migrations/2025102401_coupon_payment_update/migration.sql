-- Safe migration: add coupon fields and change payment currency default
-- Database: PostgreSQL
-- This migration is non-destructive and preserves existing data.

BEGIN;

-- 1) Add optional description to coupons
ALTER TABLE "coupons"
  ADD COLUMN IF NOT EXISTS "description" VARCHAR(255);

-- 2) Add optional per-user usage cap to coupons
ALTER TABLE "coupons"
  ADD COLUMN IF NOT EXISTS "per_user_limit" INTEGER;

-- 3) Set default currency for payments to GHS (Paystack)
ALTER TABLE "payments"
  ALTER COLUMN "currency" SET DEFAULT 'GHS';

-- Optional: backfill NULL currency to 'GHS' to avoid null defaults on new rows
UPDATE "payments"
SET "currency" = 'GHS'
WHERE "currency" IS NULL;

COMMIT;
