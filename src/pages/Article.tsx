import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Share2, Twitter, Cloud, Link2, Check, Facebook, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { stripCategoryPlaceholders, sanitizeArticleContent } from "@/lib/contentUtils";
import { bustImageCache } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { BreakingNewsBadge } from "@/components/BreakingNewsBadge";

interface ArticleData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  created_at: string;
  image_url?: string;
  photo_credit?: string;
  breaking_news?: boolean;
}

const Article = () => {
  const { slug } = useParams<{ slug: string }>();

  const { toast } = useToast();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
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
  }, [slug, toast]);

  // Update meta tags when article loads
  useEffect(() => {
    if (!article) return;

    const articleUrl = `${window.location.origin}/article/${slug}`;

    // Update document title
    document.title = `${article.title} - Bosphorus News`;

    // Helper to update or create meta tag
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? "name" : "property";
      let metaTag = document.querySelector(`meta[${attribute}="${property}"]`);

      if (!metaTag) {
        metaTag = document.createElement("meta");
        metaTag.setAttribute(attribute, property);
        document.head.appendChild(metaTag);
      }

      metaTag.setAttribute("content", content);
    };

    // Update Open Graph tags
    updateMetaTag("og:title", article.title);
    updateMetaTag("og:description", article.excerpt);
    updateMetaTag("og:type", "article");
    updateMetaTag("og:url", articleUrl);

    // Update Twitter Card tags (summary instead of summary_large_image - no thumbnail)
    updateMetaTag("twitter:card", "summary", true);
    updateMetaTag("twitter:title", article.title, true);
    updateMetaTag("twitter:description", article.excerpt, true);

    // Update description meta tag
    updateMetaTag("description", article.excerpt, true);

    // Cleanup function to reset meta tags when component unmounts
    return () => {
      document.title = "Bosphorus News - Daily News & Analysis";
    };
  }, [article, slug]);

  const handleShare = async (platform: "twitter" | "bluesky" | "facebook" | "copy") => {
    if (!slug || !article) return;

    const articleUrl = `${window.location.origin}/article/${slug}`;

    await supabase.from("share_analytics").insert({
      article_slug: slug,
      platform,
      user_id: user?.id,
    });

    const getBlueskyText = () => {
      const baseText = `${article.title} | Bosphorus News Network`;
      const urlPart = `\n\n${articleUrl}`;
      const maxLength = 300;

      let middle = article.excerpt ? `\n\n${article.excerpt}` : "";
      let fullText = baseText + middle + urlPart;

      if (fullText.length <= maxLength) return fullText;

      if (!article.excerpt) {
        // No excerpt to trim, just truncate the base text if needed
        const allowedBaseLength = maxLength - urlPart.length - 3; // 3 for '...'
        const truncatedBase = allowedBaseLength > 0 ? baseText.slice(0, allowedBaseLength) + "..." : baseText;
        return truncatedBase + urlPart;
      }

      // Trim excerpt to fit within limit
      const fixedLength = baseText.length + urlPart.length + 5; // 5 for "\n\n" and "..."
      const allowedExcerptLength = maxLength - fixedLength;

      if (allowedExcerptLength <= 0) {
        return baseText + urlPart;
      }

      const truncatedExcerpt = article.excerpt.slice(0, allowedExcerptLength) + "...";
      middle = `\n\n${truncatedExcerpt}`;
      return baseText + middle + urlPart;
    };

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${article.title} | Bosphorus News Network`)}&url=${encodeURIComponent(articleUrl)}`,
          "_blank",
          "width=550,height=420",
        );
        break;
      case "bluesky": {
        const text = getBlueskyText();
        window.open(
          `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`,
          "_blank",
          "width=550,height=420",
        );
        break;
      }
      case "facebook": {
        const facebookText = `${article.title}\n\n${article.excerpt}`;
        window.open(
          `https://www.facebook.com/share.php?u=${encodeURIComponent(articleUrl)}&quote=${encodeURIComponent(facebookText)}`,
          "_blank",
          "width=550,height=680",
        );
        break;
      }
      case "copy":
        navigator.clipboard
          .writeText(articleUrl)
          .then(() => {
            setCopied(true);
            toast({
              title: "Link copied!",
              description: "Article link copied to clipboard",
            });
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
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
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <article className="animate-fade-in">
          <div className="mb-6">
            <Link
              to={`/section/${article.category.toLowerCase().replace(/\s&\s/g, "-").replace(/\s/g, "-")}`}
              className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded hover:opacity-80 transition-opacity"
            >
              {article.category}
            </Link>
          </div>

          {article.breaking_news && (
            <div className="mb-6 w-1/4">
              <BreakingNewsBadge className="w-full h-auto" />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">{article.title}</h1>

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
            <figure className="mb-8 rounded-lg overflow-hidden bg-muted">
              <img
                src={bustImageCache(article.image_url)}
                alt={article.title}
                className="w-full h-auto object-contain max-h-[70vh]"
              />
              {article.photo_credit && (
                <figcaption className="mt-2 text-xs text-muted-foreground text-right">
                  Photo: {article.photo_credit}
                </figcaption>
              )}
            </figure>
          )}

          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-foreground mb-8">{article.excerpt}</p>
            <div
              className="rich-text-content text-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(article.content) }}
            />
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Share this article</h3>
              <div className="flex items-center gap-2">
                {/* TEMPORARILY HIDDEN - Uncomment when payment account is finalized
                <Link to="/coffee">
                  <Button variant="outline" size="sm">
                    <Coffee className="w-4 h-4 mr-2" />
                    Buy Me a Cup
                  </Button>
                </Link>
                */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleShare("twitter")}>
                      <Twitter className="w-4 h-4 mr-2" />
                      Share on X
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("bluesky")}>
                      <Cloud className="w-4 h-4 mr-2" />
                      Share on Bluesky
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("facebook")}>
                      <Facebook className="w-4 h-4 mr-2" />
                      Share on Facebook
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShare("copy")}>
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
