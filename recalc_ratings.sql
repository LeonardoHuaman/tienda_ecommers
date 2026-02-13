-- 1. Reset all products to 0 rating and 0 reviews initially
UPDATE public.products
SET rating = 0, reviews = 0;

-- 2. Recalculate ratings based on actual reviews in the 'reviews' table
WITH calculated_stats AS (
    SELECT 
        product_id,
        COUNT(*) as review_count,
        AVG(rating) as avg_rating
    FROM public.reviews
    GROUP BY product_id
)
UPDATE public.products p
SET 
    rating = cs.avg_rating,
    reviews = cs.review_count
FROM calculated_stats cs
WHERE p.id = cs.product_id;
