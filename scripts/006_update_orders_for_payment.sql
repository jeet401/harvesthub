-- Add payment-related columns to orders table if they don't exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update the orders table to ensure all payment fields exist
DO $$ 
BEGIN
  -- Check if payment_status column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_status') THEN
    ALTER TABLE public.orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed'));
  END IF;
  
  -- Check if payment_id column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_id') THEN
    ALTER TABLE public.orders ADD COLUMN payment_id TEXT;
  END IF;
END $$;

-- Update order_items table to include farmer_id for better tracking
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS farmer_id UUID REFERENCES public.profiles(id);

-- Update existing order_items to set farmer_id from products
UPDATE public.order_items 
SET farmer_id = products.farmer_id
FROM public.products 
WHERE order_items.product_id = products.id 
AND order_items.farmer_id IS NULL;

-- Make farmer_id NOT NULL after updating existing records
ALTER TABLE public.order_items 
ALTER COLUMN farmer_id SET NOT NULL;
