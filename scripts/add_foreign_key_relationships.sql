-- Add foreign key constraints to establish relationships between tables
-- This will allow Supabase to recognize relationships for joins

-- Add foreign key constraint for products.farmer_id -> profiles.id
ALTER TABLE public.products 
ADD CONSTRAINT fk_products_farmer_id 
FOREIGN KEY (farmer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for products.category_id -> categories.id
ALTER TABLE public.products 
ADD CONSTRAINT fk_products_category_id 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add foreign key constraint for cart.buyer_id -> profiles.id
ALTER TABLE public.cart 
ADD CONSTRAINT fk_cart_buyer_id 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for cart.product_id -> products.id
ALTER TABLE public.cart 
ADD CONSTRAINT fk_cart_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add foreign key constraint for orders.buyer_id -> profiles.id
ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_buyer_id 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint for order_items.order_id -> orders.id
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Add foreign key constraint for order_items.product_id -> products.id
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add foreign key constraint for order_items.farmer_id -> profiles.id
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_farmer_id 
FOREIGN KEY (farmer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add indexes for better performance on foreign key columns
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_cart_buyer_id ON public.cart(buyer_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON public.cart(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_farmer_id ON public.order_items(farmer_id);
