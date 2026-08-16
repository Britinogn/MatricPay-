-- AlterTable
ALTER TABLE "users" ADD COLUMN     "paystack_subaccount_code" TEXT UNIQUE,
ADD COLUMN     "settlement_bank_code" TEXT,
ADD COLUMN     "settlement_account_number" TEXT,
ADD COLUMN     "settlement_account_name" TEXT;
