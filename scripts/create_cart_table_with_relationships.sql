-- Create the missing cart table with proper foreign key relationships
-- This links public.products to public.cart and public.profiles to public.cart

-- Create cart table
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraints to establish relationships
    CONSTRAINT fk_cart_buyer 
        FOREIGN KEY (buyer_id) 
        REFERENCES public.profiles(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_cart_product 
        FOREIGN KEY (product_id) 
        REFERENCES public.products(id) 
        ON DELETE CASCADE,
    
    -- Ensure one cart item per buyer-product combination
    UNIQUE(buyer_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_buyer_id ON public.cart(buyer_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON public.cart(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_created_at ON public.cart(created_at);

-- Enable Row Level Security
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own cart items
CREATE POLICY "Users can view their own cart items" ON public.cart
    FOR SELECT USING (
        buyer_id = auth.uid()
    );

-- Users can insert their own cart items
CREATE POLICY "Users can insert their own cart items" ON public.cart
    FOR INSERT WITH CHECK (
        buyer_id = auth.uid()
    );

-- Users can update their own cart items
CREATE POLICY "Users can update their own cart items" ON public.cart
    FOR UPDATE USING (
        buyer_id = auth.uid()
    ) WITH CHECK (
        buyer_id = auth.uid()
    );

-- Users can delete their own cart items
CREATE POLICY "Users can delete their own cart items" ON public.cart
    FOR DELETE USING (
        buyer_id = auth.uid()
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cart_updated_at 
    BEFORE UPDATE ON public.cart 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.cart TO authenticated;
GRANT ALL ON public.cart TO service_role;
