ALTER TYPE "PaymentStatus" ADD VALUE 'superseded';

ALTER TYPE "PaymentFailureReason" ADD VALUE 'superseded_attempt';

ALTER TABLE "payments"
  ADD COLUMN "idempotency_key" TEXT,
  ADD COLUMN "authorization_url" TEXT,
  ADD COLUMN "access_code" TEXT;

CREATE UNIQUE INDEX "payments_idempotency_key_key"
  ON "payments"("idempotency_key");
