ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "sku" TEXT,
ADD COLUMN IF NOT EXISTS "shortDescription" TEXT,
ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'Product_sku_key'
  ) THEN
    CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
  END IF;
END
$$;
