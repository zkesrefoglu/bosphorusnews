import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Share2, Twitter, Cloud, Link2, Check, Facebook, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { stripCategoryPlaceholders, sanitizeArticleContent } from "@/lib/contentUtils";
import { bustImageCache } from "@/lib/imageUtils";
import { useIsMobile } from "@/hooks/use-mobile";
import { BreakingNewsBadge } from "@/components/BreakingNewsBadge";

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface ArticleData {
  id: string;
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
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [shareExpanded, setShareExpanded] = useState(false);
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

        // Fetch tags for this article
        if (data) {
          const { data: articleTags } = await supabase
            .from("article_tags")
            .select("tag_id, tags(*)")
            .eq("article_id", data.id);

          if (articleTags) {
            const fetchedTags = articleTags
              .filter((at: any) => at.tags)
              .map((at: any) => ({
                id: at.tags.id,
                name: at.tags.name,
                slug: at.tags.slug,
              }));
            setTags(fetchedTags);
          }
        }
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
    if (article.image_url) {
      updateMetaTag("og:image", article.image_url);
      updateMetaTag("og:image:width", "1200");
      updateMetaTag("og:image:height", "630");
    }

    // Update Twitter Card tags (summary_large_image for thumbnail)
    updateMetaTag("twitter:card", "summary_large_image", true);
    updateMetaTag("twitter:title", article.title, true);
    updateMetaTag("twitter:description", article.excerpt, true);
    if (article.image_url) {
      updateMetaTag("twitter:image", article.image_url, true);
    }

    // Update description meta tag
    updateMetaTag("description", article.excerpt, true);

    // Cleanup function to reset meta tags when component unmounts
    return () => {
      document.title = "Bosphorus News - Daily News & Analysis";
    };
  }, [article, slug]);

  const handleShare = async (platform: "twitter" | "bluesky" | "facebook" | "copy") => {
    if (!slug || !article) return;

    // Use edge function URL for sharing - crawlers will see proper meta tags
    // Human visitors get auto-redirected to the actual article
    const shareUrl = `https://mxmarjrkwrqnhhipckzj.supabase.co/functions/v1/og-image?slug=${encodeURIComponent(slug)}`;
    const articleUrl = `${window.location.origin}/article/${slug}`;

    await supabase.from("share_analytics").insert({
      article_slug: slug,
      platform,
      user_id: user?.id,
    });

    const getBlueskyText = () => {
      const baseText = `${article.title} | Bosphorus News Network`;
      const urlPart = `\n\n${shareUrl}`;
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
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${article.title} | Bosphorus News Network`)}&url=${encodeURIComponent(shareUrl)}`,
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
        window.open(
          `https://www.facebook.com/share.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "width=550,height=680",
        );
        break;
      }
      case "copy":
        navigator.clipboard
          .writeText(shareUrl)
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
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <Link
              to={`/section/${article.category.toLowerCase().replace(/\s&\s/g, "-").replace(/\s/g, "-")}`}
              className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded hover:opacity-80 transition-opacity"
            >
              {article.category}
            </Link>
            {tags.map((tag) => (
              <Link
                key={tag.id}
                to={`/tag/${tag.slug}`}
                className="inline-block px-3 py-1 text-xs font-medium bg-muted text-primary rounded-full hover:bg-muted/80 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
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

          {/* Floating Share Button - Olympics.com style */}
          <div className="fixed right-0 md:right-2 top-1/3 z-50 flex flex-col items-center">
            <div className="bg-background border border-border rounded-full shadow-lg overflow-hidden flex flex-col items-center">
              {/* Share Icon Button */}
              <button
                onClick={() => setShareExpanded(!shareExpanded)}
                className="w-12 h-12 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors group"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              {/* Divider */}
              <div className="w-6 h-px bg-border" />
              
              {/* Expand/Collapse Button */}
              <button
                onClick={() => setShareExpanded(!shareExpanded)}
                className="w-12 h-12 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                aria-label={shareExpanded ? "Collapse" : "Expand"}
              >
                {shareExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>

            {/* Expanded Share Options */}
            {shareExpanded && (
              <div className="mt-2 bg-background border border-border rounded-full shadow-lg overflow-hidden flex flex-col items-center animate-fade-in">
                <button
                  onClick={() => handleShare("twitter")}
                  className="w-12 h-12 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                  aria-label="Share on X"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <div className="w-6 h-px bg-border" />
                <button
                  onClick={() => handleShare("bluesky")}
                  className="w-12 h-12 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                  aria-label="Share on Bluesky"
                >
                  <Cloud className="w-5 h-5" />
                </button>
                <div className="w-6 h-px bg-border" />
                <button
                  onClick={() => handleShare("facebook")}
                  className="w-12 h-12 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <div className="w-6 h-px bg-border" />
                <button
                  onClick={() => handleShare("copy")}
                  className="w-12 h-12 flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                  aria-label="Copy link"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>

          {article.image_url && (
            <figure className="mb-8 rounded-lg overflow-hidden bg-muted">
              <img
                src={bustImageCache(article.image_url)}
                alt={article.title}
                className="w-full h-auto object-contain max-h-[70vh]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://picsum.photos/seed/${slug}/1200/800`;
                }}
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
