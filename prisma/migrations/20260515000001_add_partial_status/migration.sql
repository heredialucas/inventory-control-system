-- Add PARTIAL status to PurchaseOrderStatus enum
ALTER TYPE "PurchaseOrderStatus" ADD VALUE IF NOT EXISTS 'PARTIAL';
