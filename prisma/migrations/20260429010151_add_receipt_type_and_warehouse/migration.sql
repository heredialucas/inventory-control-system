-- DropForeignKey
ALTER TABLE "purchase_receipts" DROP CONSTRAINT "purchase_receipts_purchaseOrderId_fkey";

-- AlterTable
ALTER TABLE "purchase_receipts" ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'PURCHASE',
ADD COLUMN     "warehouseId" UUID,
ALTER COLUMN "purchaseOrderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "purchase_receipts" ADD CONSTRAINT "purchase_receipts_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_receipts" ADD CONSTRAINT "purchase_receipts_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "warehouses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
