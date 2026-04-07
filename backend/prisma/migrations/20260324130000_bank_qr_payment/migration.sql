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
  'Chuyển khoản ngân hàng (VietQR)',
  'Quét mã VietQR bằng app ngân hàng và tự động đối soát qua webhook',
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
    WHEN "code" = 'bank_transfer' THEN 'Chuyển khoản ngân hàng (VietQR)'
    ELSE "name"
  END,
  "description" = CASE
    WHEN "code" = 'bank_transfer' THEN 'Quét mã VietQR bằng app ngân hàng và tự động đối soát qua webhook'
    WHEN "code" = 'momo' THEN 'Chưa kích hoạt trong backend này'
    WHEN "code" = 'zalopay' THEN 'Chưa kích hoạt trong backend này'
    WHEN "code" = 'card' THEN 'Chưa kích hoạt trong backend này'
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
