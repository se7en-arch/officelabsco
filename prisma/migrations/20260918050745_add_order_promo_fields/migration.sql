-- AlterTable
ALTER TABLE "Order" ADD COLUMN "promoCode" TEXT;
ALTER TABLE "Order" ADD COLUMN "discountPercent" INTEGER NOT NULL DEFAULT 0;
