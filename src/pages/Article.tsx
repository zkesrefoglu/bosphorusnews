import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Share2, Twitter, Cloud, Link2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { stripCategoryPlaceholders, sanitizeArticleContent } from "@/lib/contentUtils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface ArticleData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  created_at: string;
  image_url?: string;
  photo_credit?: string;
}

const REACTIONS = [
  { emoji: '😊', icon: '/emojis/smiling.svg', name: 'smiling' },
  { emoji: '🤣', icon: '/emojis/laughing.svg', name: 'laughing' },
  { emoji: '😢', icon: '/emojis/crying.svg', name: 'crying' },
  { emoji: '😒', icon: '/emojis/unamused.svg', name: 'unamused' },
  { emoji: '😡', icon: '/emojis/angry.svg', name: 'angry' },
  { emoji: '👍', icon: '/emojis/thumbs-up.svg', name: 'thumbs-up' },
  { emoji: '🙌', icon: '/emojis/celebrating.svg', name: 'celebrating' },
  { emoji: '👎', icon: '/emojis/thumbs-down.svg', name: 'thumbs-down' },
];

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from("news_articles")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (error) throw error;
        
        setArticle(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load article",
          variant: "destructive",
        });
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    
    // Fetch reactions
    if (slug) {
      fetchReactions();
    }
  }, [slug, toast]);

  // Update meta tags when article loads
  useEffect(() => {
    if (!article) return;

    const articleUrl = `${window.location.origin}/article/${slug}`;
    
    // Update document title
    document.title = `${article.title} - Bosphorus News`;
    
    // Helper to update or create meta tag
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let metaTag = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attribute, property);
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', content);
    };

    // Update Open Graph tags
    updateMetaTag('og:title', article.title);
    updateMetaTag('og:description', article.excerpt);
    updateMetaTag('og:type', 'article');
    updateMetaTag('og:url', articleUrl);
    
    if (article.image_url) {
      updateMetaTag('og:image', article.image_url);
      updateMetaTag('og:image:width', '1200');
      updateMetaTag('og:image:height', '630');
    }
    
    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:title', article.title, true);
    updateMetaTag('twitter:description', article.excerpt, true);
    
    if (article.image_url) {
      updateMetaTag('twitter:image', article.image_url, true);
    }
    
    // Update description meta tag
    updateMetaTag('description', article.excerpt, true);

    // Cleanup function to reset meta tags when component unmounts
    return () => {
      document.title = 'Bosphorus News - Daily News & Analysis';
    };
  }, [article, slug]);

  const fetchReactions = async () => {
    if (!slug) return;
    
    const { data } = await supabase
      .from('article_reactions')
      .select('reaction, user_id')
      .eq('article_slug', slug);
    
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach(r => {
        counts[r.reaction] = (counts[r.reaction] || 0) + 1;
        if (user && r.user_id === user.id) {
          setUserReaction(r.reaction);
        }
      });
      setReactionCounts(counts);
    }
  };

  const handleReaction = async (reaction: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to react to articles",
        variant: "destructive",
      });
      return;
    }
    
    if (!slug) return;
    
    if (userReaction === reaction) {
      await supabase
        .from('article_reactions')
        .delete()
        .eq('article_slug', slug)
        .eq('user_id', user.id);
      
      setUserReaction(null);
    } else {
      await supabase
        .from('article_reactions')
        .upsert({
          article_slug: slug,
          user_id: user.id,
          reaction,
        });
      
      setUserReaction(reaction);
    }
    
    fetchReactions();
  };

  const handleShare = async (platform: 'twitter' | 'bluesky' | 'copy') => {
    if (!slug || !article) return;
    
    const articleUrl = `${window.location.origin}/article/${slug}`;
    
    await supabase.from('share_analytics').insert({
      article_slug: slug,
      platform,
      user_id: user?.id,
    });
    
    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'bluesky':
        window.open(
          `https://bsky.app/intent/compose?text=${encodeURIComponent(`${article.title}\n\n${articleUrl}`)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(articleUrl).then(() => {
          setCopied(true);
          toast({
            title: "Link copied!",
            description: "Article link copied to clipboard",
          });
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          toast({
            title: "Failed to copy",
            description: "Could not copy link to clipboard",
            variant: "destructive",
          });
        });
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <article className="animate-fade-in">
          <div className="mb-6">
            <Link
              to={`/section/${article.category.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
              className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded hover:opacity-80 transition-opacity"
            >
              {article.category}
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-border">
            <time className="text-sm text-muted-foreground">
              {new Date(article.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>

          {article.image_url && (
            <figure className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={article.image_url} 
                alt={article.title}
                className="w-full h-auto object-cover"
              />
              {article.photo_credit && (
                <figcaption className="mt-2 text-xs text-muted-foreground text-right">
                  Photo: {article.photo_credit}
                </figcaption>
              )}
            </figure>
          )}

          <div className="prose prose-lg max-w-none">
        <p className="text-xl leading-relaxed text-foreground mb-8">
          {article.excerpt}
        </p>
        <div className="whitespace-pre-wrap text-foreground">
          {sanitizeArticleContent(article.content)}
        </div>
          </div>

          {/* Share and Reactions Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Share this article</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare('twitter')}>
                    <Twitter className="w-4 h-4 mr-2" />
                    Share on X
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('bluesky')}>
                    <Cloud className="w-4 h-4 mr-2" />
                    Share on Bluesky
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('copy')}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy Link"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="text-lg font-semibold mb-4">React to this article</h3>
            <div className="flex flex-wrap gap-3">
              {REACTIONS.map((reaction) => (
                <button
                  key={reaction.name}
                  onClick={() => handleReaction(reaction.emoji)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                    userReaction === reaction.emoji
                      ? 'bg-primary/15 border-primary shadow-md scale-105'
                      : 'bg-background/50 border-border/50 hover:border-primary/40 hover:bg-background'
                  }`}
                >
                  <img src={reaction.icon} alt={reaction.name} className="w-7 h-7" />
                  {reactionCounts[reaction.emoji] > 0 && (
                    <span className="text-sm font-semibold text-foreground/70 ml-0.5">
                      {reactionCounts[reaction.emoji]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </article>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Bosphorus News. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Article;
