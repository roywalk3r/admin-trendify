-- CreateTable
CREATE TABLE "public"."delivery_cities" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "door_fee" DECIMAL(10,2) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pickup_locations" (
    "id" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "address" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_cities_name_key" ON "public"."delivery_cities"("name");

-- CreateIndex
CREATE INDEX "delivery_cities_is_active_idx" ON "public"."delivery_cities"("is_active");

-- CreateIndex
CREATE INDEX "pickup_locations_city_id_idx" ON "public"."pickup_locations"("city_id");

-- CreateIndex
CREATE INDEX "pickup_locations_is_active_idx" ON "public"."pickup_locations"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "pickup_locations_city_id_name_key" ON "public"."pickup_locations"("city_id", "name");

-- AddForeignKey
ALTER TABLE "public"."pickup_locations" ADD CONSTRAINT "pickup_locations_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."delivery_cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
