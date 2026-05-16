-- Fix any existing negative stock before adding constraint
UPDATE warehouse_stock SET quantity = 0 WHERE quantity < 0;

-- Add CHECK constraint to prevent negative stock
ALTER TABLE warehouse_stock ADD CONSTRAINT stock_non_negative CHECK (quantity >= 0);
