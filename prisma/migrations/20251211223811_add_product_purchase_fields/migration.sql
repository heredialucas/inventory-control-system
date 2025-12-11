-- AlterTable
ALTER TABLE "products" ADD COLUMN     "destination" TEXT,
ADD COLUMN     "purchaseAmount" DECIMAL(10,2),
ADD COLUMN     "purchaseCode" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "receiptImageUrl" TEXT,
ADD COLUMN     "supplierId" UUID;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
