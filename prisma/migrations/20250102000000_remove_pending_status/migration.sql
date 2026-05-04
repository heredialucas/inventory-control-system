-- Remove PENDING status from purchase_orders (orders are final when created)
UPDATE "purchase_orders" SET "status" = 'RECEIVED' WHERE "status" = 'PENDING';

-- This migration just ensures existing PENDING orders become RECEIVED