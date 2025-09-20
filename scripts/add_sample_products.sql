-- Add sample products for testing the FarmByte marketplace
-- This script adds realistic product data for farmers and buyers to test with

-- First, let's make sure we have some farmers in the system
-- Note: This assumes you already have farmer profiles created through the signup process

-- Insert sample products (you'll need to replace the farmer_id and category_id with actual UUIDs from your database)
-- Get the category IDs first
DO $$
DECLARE
    fruits_cat_id UUID;
    vegetables_cat_id UUID;
    seeds_cat_id UUID;
    fertilizers_cat_id UUID;
    sample_farmer_id UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO fruits_cat_id FROM public.categories WHERE name = 'Fruits' LIMIT 1;
    SELECT id INTO vegetables_cat_id FROM public.categories WHERE name = 'Vegetables' LIMIT 1;
    SELECT id INTO seeds_cat_id FROM public.categories WHERE name = 'Seeds' LIMIT 1;
    SELECT id INTO fertilizers_cat_id FROM public.categories WHERE name = 'Fertilizers' LIMIT 1;
    
    -- Get a sample farmer ID (first farmer in the system)
    SELECT id INTO sample_farmer_id FROM public.profiles WHERE user_type = 'farmer' LIMIT 1;
    
    -- If no farmer exists, we'll create a placeholder farmer
    IF sample_farmer_id IS NULL THEN
        -- This will only work if you have a farmer profile, otherwise products won't be created
        RAISE NOTICE 'No farmer profiles found. Please create a farmer account first.';
        RETURN;
    END IF;
    
    -- Insert sample fruits
    INSERT INTO public.products (farmer_id, category_id, name, description, price, unit, quantity_available, image_url, is_active) VALUES
    (sample_farmer_id, fruits_cat_id, 'Fresh Red Apples', 'Crispy and sweet red apples, perfect for snacking or baking', 80.00, 'kg', 50, '/fresh-colorful-fruits-apples-oranges-bananas.png', true),
    (sample_farmer_id, fruits_cat_id, 'Sweet Mangoes', 'Premium Alphonso mangoes, naturally ripened', 120.00, 'kg', 30, '/fresh-colorful-fruits-apples-oranges-bananas.png', true),
    (sample_farmer_id, fruits_cat_id, 'Fresh Bananas', 'Organic bananas, rich in potassium and vitamins', 40.00, 'dozen', 25, '/fresh-colorful-fruits-apples-oranges-bananas.png', true),
    (sample_farmer_id, fruits_cat_id, 'Juicy Oranges', 'Fresh citrus oranges, high in Vitamin C', 60.00, 'kg', 40, '/fresh-colorful-fruits-apples-oranges-bananas.png', true);
    
    -- Insert sample vegetables
    INSERT INTO public.products (farmer_id, category_id, name, description, price, unit, quantity_available, image_url, is_active) VALUES
    (sample_farmer_id, vegetables_cat_id, 'Fresh Tomatoes', 'Red, ripe tomatoes perfect for cooking and salads', 50.00, 'kg', 60, '/fresh-vegetables-tomatoes-carrots-onions.png', true),
    (sample_farmer_id, vegetables_cat_id, 'Organic Carrots', 'Sweet and crunchy organic carrots', 45.00, 'kg', 35, '/fresh-vegetables-tomatoes-carrots-onions.png', true),
    (sample_farmer_id, vegetables_cat_id, 'Fresh Onions', 'Sharp and flavorful onions for cooking', 35.00, 'kg', 80, '/fresh-vegetables-tomatoes-carrots-onions.png', true),
    (sample_farmer_id, vegetables_cat_id, 'Green Spinach', 'Fresh leafy spinach, rich in iron', 25.00, 'bunch', 20, '/fresh-vegetables-tomatoes-carrots-onions.png', true),
    (sample_farmer_id, vegetables_cat_id, 'Bell Peppers', 'Colorful bell peppers - red, yellow, and green', 70.00, 'kg', 15, '/fresh-vegetables-tomatoes-carrots-onions.png', true);
    
    -- Insert sample seeds
    INSERT INTO public.products (farmer_id, category_id, name, description, price, unit, quantity_available, image_url, is_active) VALUES
    (sample_farmer_id, seeds_cat_id, 'Wheat Seeds', 'High-yield wheat seeds for winter cultivation', 120.00, 'kg', 100, '/various-seeds-packets-wheat-rice-vegetable-seeds.png', true),
    (sample_farmer_id, seeds_cat_id, 'Rice Seeds', 'Premium basmati rice seeds', 150.00, 'kg', 80, '/various-seeds-packets-wheat-rice-vegetable-seeds.png', true),
    (sample_farmer_id, seeds_cat_id, 'Vegetable Seeds Mix', 'Mixed packet of tomato, onion, and spinach seeds', 80.00, 'packet', 50, '/various-seeds-packets-wheat-rice-vegetable-seeds.png', true),
    (sample_farmer_id, seeds_cat_id, 'Sunflower Seeds', 'Oil-rich sunflower seeds for cultivation', 90.00, 'kg', 40, '/various-seeds-packets-wheat-rice-vegetable-seeds.png', true);
    
    -- Insert sample fertilizers
    INSERT INTO public.products (farmer_id, category_id, name, description, price, unit, quantity_available, image_url, is_active) VALUES
    (sample_farmer_id, fertilizers_cat_id, 'Organic Compost', 'Natural compost made from farm waste and manure', 200.00, 'kg', 200, '/organic-fertilizer-bags-compost-natural-farming.png', true),
    (sample_farmer_id, fertilizers_cat_id, 'NPK Fertilizer', 'Balanced NPK fertilizer for healthy plant growth', 180.00, 'kg', 150, '/organic-fertilizer-bags-compost-natural-farming.png', true),
    (sample_farmer_id, fertilizers_cat_id, 'Vermicompost', 'Premium vermicompost with earthworm castings', 250.00, 'kg', 100, '/organic-fertilizer-bags-compost-natural-farming.png', true),
    (sample_farmer_id, fertilizers_cat_id, 'Seaweed Extract', 'Natural seaweed extract for plant nutrition', 300.00, 'liter', 50, '/organic-fertilizer-bags-compost-natural-farming.png', true);
    
    RAISE NOTICE 'Sample products inserted successfully!';
END $$;
