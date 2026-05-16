[dotenv@17.2.3] injecting env (0) from .env.local -- tip: ⚙️  specify custom .env file path with { path: '/custom/path/.env' }
[dotenv@17.2.3] injecting env (6) from .env -- tip: ✅ audit secrets and track compliance: https://dotenvx.com/ops
-- AlterTable
ALTER TABLE "expedientes" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "purchase_receipts" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "warehouse_transfers" ADD COLUMN     "deletedAt" TIMESTAMP(3);

