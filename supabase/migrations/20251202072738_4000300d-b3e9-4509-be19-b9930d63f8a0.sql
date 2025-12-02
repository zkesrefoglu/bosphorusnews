-- Add short_url column to news_articles table for storing Bitly shortened URLs
ALTER TABLE public.news_articles ADD COLUMN short_url text;