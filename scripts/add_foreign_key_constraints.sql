-- Add foreign key constraints to establish proper relationships between tables
-- This will allow Supabase to recognize relationships for joins in queries

-- Add foreign key constraint from products.farmer_id to profiles.id
ALTER TABLE public.products 
ADD CONSTRAINT fk_products_farmer_id 
FOREIGN KEY (farmer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from products.category_id to categories.id
ALTER TABLE public.products 
ADD CONSTRAINT fk_products_category_id 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add foreign key constraint from cart.buyer_id to profiles.id
ALTER TABLE public.cart 
ADD CONSTRAINT fk_cart_buyer_id 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from cart.product_id to products.id
ALTER TABLE public.cart 
ADD CONSTRAINT fk_cart_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add foreign key constraint from orders.buyer_id to profiles.id
ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_buyer_id 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Add foreign key constraint from order_items.order_id to orders.id
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_order_id 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

-- Add foreign key constraint from order_items.product_id to products.id
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add foreign key constraint from order_items.farmer_id to profiles.id
ALTER TABLE public.order_items 
ADD CONSTRAINT fk_order_items_farmer_id 
FOREIGN KEY (farmer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_cart_buyer_id ON public.cart(buyer_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON public.cart(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_farmer_id ON public.order_items(farmer_id);
