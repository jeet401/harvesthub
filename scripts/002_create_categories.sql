-- Create categories table for product classification
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('fruits', 'vegetables', 'seeds', 'fertilizers')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (public read access)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read categories
CREATE POLICY "categories_select_all" ON public.categories 
  FOR SELECT USING (true);

-- Only authenticated users can suggest categories (admin approval needed)
CREATE POLICY "categories_insert_authenticated" ON public.categories 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default categories
INSERT INTO public.categories (name, description, type) VALUES
  ('Apples', 'Fresh apples of various varieties', 'fruits'),
  ('Bananas', 'Fresh bananas', 'fruits'),
  ('Oranges', 'Fresh citrus oranges', 'fruits'),
  ('Mangoes', 'Fresh mangoes', 'fruits'),
  ('Tomatoes', 'Fresh tomatoes', 'vegetables'),
  ('Potatoes', 'Fresh potatoes', 'vegetables'),
  ('Onions', 'Fresh onions', 'vegetables'),
  ('Carrots', 'Fresh carrots', 'vegetables'),
  ('Wheat Seeds', 'High quality wheat seeds', 'seeds'),
  ('Rice Seeds', 'Premium rice seeds', 'seeds'),
  ('Vegetable Seeds', 'Mixed vegetable seeds', 'seeds'),
  ('Organic Fertilizer', 'Natural organic fertilizer', 'fertilizers'),
  ('NPK Fertilizer', 'Nitrogen, Phosphorus, Potassium fertilizer', 'fertilizers'),
  ('Compost', 'Organic compost for soil health', 'fertilizers')
ON CONFLICT (name) DO NOTHING;
