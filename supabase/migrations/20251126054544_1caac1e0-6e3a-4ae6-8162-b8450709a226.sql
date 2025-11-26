-- Add extra_image_url column to news_articles table
ALTER TABLE public.news_articles 
ADD COLUMN IF NOT EXISTS extra_image_url text,
ADD COLUMN IF NOT EXISTS extra_image_credit text;