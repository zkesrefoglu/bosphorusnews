-- Create share analytics table
CREATE TABLE public.share_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug TEXT NOT NULL,
  platform TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for analytics queries
CREATE INDEX idx_share_analytics_article ON public.share_analytics(article_slug);
CREATE INDEX idx_share_analytics_platform ON public.share_analytics(platform);
CREATE INDEX idx_share_analytics_created_at ON public.share_analytics(created_at);

-- Enable RLS
ALTER TABLE public.share_analytics ENABLE ROW LEVEL SECURITY;

-- Anyone can insert share analytics
CREATE POLICY "Anyone can track shares"
ON public.share_analytics
FOR INSERT
WITH CHECK (true);

-- Admins can view analytics
CREATE POLICY "Admins can view share analytics"
ON public.share_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create article reactions table
CREATE TABLE public.article_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_slug TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_slug, user_id)
);

-- Create indexes
CREATE INDEX idx_reactions_article ON public.article_reactions(article_slug);
CREATE INDEX idx_reactions_user ON public.article_reactions(user_id);

-- Enable RLS
ALTER TABLE public.article_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can view reactions
CREATE POLICY "Anyone can view reactions"
ON public.article_reactions
FOR SELECT
USING (true);

-- Authenticated users can insert their own reactions
CREATE POLICY "Users can add reactions"
ON public.article_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reactions
CREATE POLICY "Users can update their reactions"
ON public.article_reactions
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "Users can delete their reactions"
ON public.article_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_article_reactions_updated_at
BEFORE UPDATE ON public.article_reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();