-- Backfill missing OrderAddress table based on existing Address records used by orders
CREATE TABLE IF NOT EXISTS "OrderAddress" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "ward" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderAddress_pkey" PRIMARY KEY ("id")
);

INSERT INTO "OrderAddress" ("id", "name", "phone", "address", "city", "district", "ward")
SELECT DISTINCT a."id", a."name", a."phone", a."address", a."city", a."district", a."ward"
FROM "Order" o
JOIN "Address" a ON a."id" = o."addressId"
ON CONFLICT ("id") DO NOTHING;

ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_addressId_fkey";
CREATE UNIQUE INDEX IF NOT EXISTS "Order_addressId_key" ON "Order"("addressId");
ALTER TABLE "Order"
  ADD CONSTRAINT "Order_addressId_fkey"
  FOREIGN KEY ("addressId") REFERENCES "OrderAddress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PaymentMethod"
  ADD COLUMN IF NOT EXISTS "isOnline" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isEnabled" BOOLEAN NOT NULL DEFAULT true;

UPDATE "PaymentMethod"
SET
  "isOnline" = CASE WHEN "code" = 'cod' THEN false ELSE true END,
  "description" = CASE
    WHEN "code" = 'cod' THEN COALESCE("description", 'Thanh toán khi nhận hàng')
    WHEN "code" = 'momo' THEN COALESCE("description", 'Thanh toán online qua ví MoMo (mock flow)')
    WHEN "code" = 'zalopay' THEN COALESCE("description", 'Thanh toán online qua ZaloPay (mock flow)')
    WHEN "code" = 'card' THEN COALESCE("description", 'Thanh toán online qua thẻ ngân hàng (mock flow)')
    ELSE "description"
  END;

ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "couponId" TEXT,
  ADD COLUMN IF NOT EXISTS "couponCode" TEXT;

CREATE TABLE IF NOT EXISTS "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "discountType" TEXT NOT NULL,
    "discountValue" DECIMAL(12,2) NOT NULL,
    "minOrderValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "maxDiscount" DECIMAL(12,2),
    "usageLimit" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "perUserLimit" INTEGER,
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_code_key" ON "Coupon"("code");

CREATE TABLE IF NOT EXISTS "PaymentTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "transactionCode" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL,
    "paymentUrl" TEXT,
    "note" TEXT,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PaymentTransaction_transactionCode_key" ON "PaymentTransaction"("transactionCode");
CREATE INDEX IF NOT EXISTS "PaymentTransaction_orderId_status_idx" ON "PaymentTransaction"("orderId", "status");

CREATE TABLE IF NOT EXISTS "CouponUsage" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CouponUsage_orderId_key" ON "CouponUsage"("orderId");
CREATE INDEX IF NOT EXISTS "CouponUsage_couponId_userId_idx" ON "CouponUsage"("couponId", "userId");

UPDATE "CartItem" SET "color" = '' WHERE "color" IS NULL;
UPDATE "CartItem" SET "size" = '' WHERE "size" IS NULL;

-- Merge duplicated cart items before adding a database unique constraint
WITH aggregated AS (
  SELECT
    MIN("id") AS keep_id,
    "cartId",
    "productId",
    COALESCE("color", '') AS color_key,
    COALESCE("size", '') AS size_key,
    SUM("quantity") AS total_quantity
  FROM "CartItem"
  GROUP BY "cartId", "productId", COALESCE("color", ''), COALESCE("size", '')
)
UPDATE "CartItem" ci
SET "quantity" = aggregated.total_quantity
FROM aggregated
WHERE ci."id" = aggregated.keep_id;

DELETE FROM "CartItem" ci
USING (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "cartId", "productId", COALESCE("color", ''), COALESCE("size", '')
      ORDER BY "createdAt" ASC, "id" ASC
    ) AS row_num
  FROM "CartItem"
) ranked
WHERE ci."id" = ranked."id" AND ranked.row_num > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_cartId_productId_color_size_key"
ON "CartItem"("cartId", "productId", "color", "size");

-- Keep only the latest review per user/product before enforcing uniqueness
DELETE FROM "Review" r
USING (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "productId"
      ORDER BY "updatedAt" DESC, "createdAt" DESC, "id" DESC
    ) AS row_num
  FROM "Review"
) ranked
WHERE r."id" = ranked."id" AND ranked.row_num > 1;

CREATE UNIQUE INDEX IF NOT EXISTS "Review_userId_productId_key" ON "Review"("userId", "productId");

CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Order_status_paymentStatus_idx" ON "Order"("status", "paymentStatus");

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_couponId_fkey"
  FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PaymentTransaction"
  ADD CONSTRAINT "PaymentTransaction_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentTransaction"
  ADD CONSTRAINT "PaymentTransaction_paymentMethodId_fkey"
  FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CouponUsage"
  ADD CONSTRAINT "CouponUsage_couponId_fkey"
  FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponUsage"
  ADD CONSTRAINT "CouponUsage_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CouponUsage"
  ADD CONSTRAINT "CouponUsage_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
