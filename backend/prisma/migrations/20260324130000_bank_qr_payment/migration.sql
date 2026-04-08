ALTER TABLE "PaymentTransaction"
  ADD COLUMN IF NOT EXISTS "qrImageUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "qrPayload" TEXT,
  ADD COLUMN IF NOT EXISTS "transferContent" TEXT,
  ADD COLUMN IF NOT EXISTS "bankReference" TEXT,
  ADD COLUMN IF NOT EXISTS "providerPayload" JSONB,
  ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "PaymentTransaction_provider_transferContent_idx"
ON "PaymentTransaction"("provider", "transferContent");

INSERT INTO "PaymentMethod" ("id", "code", "name", "description", "isOnline", "isEnabled", "createdAt", "updatedAt")
SELECT
  'payment-method-bank-transfer',
  'bank_transfer',
  'Chuyển khoản ngân hàng',
  'Phương thức chuyển khoản ngân hàng',
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM "PaymentMethod" WHERE "code" = 'bank_transfer'
);

UPDATE "PaymentMethod"
SET
  "name" = CASE
    WHEN "code" = 'bank_transfer' THEN 'Chuyển khoản ngân hàng'
    ELSE "name"
  END,
  "description" = CASE
    WHEN "code" = 'bank_transfer' THEN 'Phương thức chuyển khoản ngân hàng'
    WHEN "code" = 'momo' THEN 'Tạm ẩn'
    WHEN "code" = 'zalopay' THEN 'Tạm ẩn'
    WHEN "code" = 'card' THEN 'Tạm ẩn'
    ELSE "description"
  END,
  "isEnabled" = CASE
    WHEN "code" = 'cod' THEN true
    WHEN "code" = 'bank_transfer' THEN true
    WHEN "code" IN ('momo', 'zalopay', 'card') THEN false
    ELSE "isEnabled"
  END,
  "isOnline" = CASE
    WHEN "code" = 'cod' THEN false
    WHEN "code" = 'bank_transfer' THEN true
    WHEN "code" IN ('momo', 'zalopay', 'card') THEN true
    ELSE "isOnline"
  END;
