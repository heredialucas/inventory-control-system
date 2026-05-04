-- Add document fields to purchase_orders
ALTER TABLE "purchase_orders" 
ADD COLUMN IF NOT EXISTS "invoice_url" TEXT,
ADD COLUMN IF NOT EXISTS "credit_note_url" TEXT,
ADD COLUMN IF NOT EXISTS "debit_note_url" TEXT;