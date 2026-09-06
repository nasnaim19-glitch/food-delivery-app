-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "discountPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "originalUnitPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN     "happyHourDiscount" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "happyHourEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "happyHourEndMinutes" INTEGER,
ADD COLUMN     "happyHourStartMinutes" INTEGER;
