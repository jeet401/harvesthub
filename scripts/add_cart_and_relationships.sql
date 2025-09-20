-- Create the missing cart table
CREATE TABLE IF NOT EXISTS public.cart (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(buyer_id, product_id)
);

-- Add foreign key relationships
ALTER TABLE public.cart 
ADD CONSTRAINT cart_buyer_id_fkey 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.cart 
ADD CONSTRAINT cart_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

-- Add missing foreign key relationships for existing tables
ALTER TABLE public.products 
ADD CONSTRAINT products_farmer_id_fkey 
FOREIGN KEY (farmer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.products 
ADD CONSTRAINT products_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_buyer_id_fkey 
FOREIGN KEY (buyer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;

ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;

ALTER TABLE public.order_items 
ADD CONSTRAINT order_items_farmer_id_fkey 
FOREIGN KEY (farmer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable RLS on cart table
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cart table
CREATE POLICY "Users can view their own cart items" ON public.cart
    FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Users can insert their own cart items" ON public.cart
    FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own cart items" ON public.cart
    FOR UPDATE USING (auth.uid() = buyer_id);

CREATE POLICY "Users can delete their own cart items" ON public.cart
    FOR DELETE USING (auth.uid() = buyer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS cart_buyer_id_idx ON public.cart(buyer_id);
CREATE INDEX IF NOT EXISTS cart_product_id_idx ON public.cart(product_id);
CREATE INDEX IF NOT EXISTS products_farmer_id_idx ON public.products(farmer_id);
CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products(category_id);
