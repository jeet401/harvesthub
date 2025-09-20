-- Create the missing cart table with proper relationships and RLS policies

-- Create cart table
CREATE TABLE IF NOT EXISTS public.cart (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    buyer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(buyer_id, product_id)
);

-- Enable RLS
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cart
CREATE POLICY "Users can view their own cart items" ON public.cart
    FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Users can insert their own cart items" ON public.cart
    FOR INSERT WITH CHECK (buyer_id = auth.uid());

CREATE POLICY "Users can update their own cart items" ON public.cart
    FOR UPDATE USING (buyer_id = auth.uid());

CREATE POLICY "Users can delete their own cart items" ON public.cart
    FOR DELETE USING (buyer_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS cart_buyer_id_idx ON public.cart(buyer_id);
CREATE INDEX IF NOT EXISTS cart_product_id_idx ON public.cart(product_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_cart_updated_at
    BEFORE UPDATE ON public.cart
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();
