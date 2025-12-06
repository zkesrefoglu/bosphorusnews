import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import { bustImageCache } from "@/lib/imageUtils";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  image_url?: string;
  created_at: string;
}

interface TagData {
  id: string;
  name: string;
  slug: string;
}

const Tag = () => {
  const { slug } = useParams<{ slug: string }>();
  const [tag, setTag] = useState<TagData | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTagAndArticles = async () => {
      if (!slug) return;

      try {
        // Fetch tag
        const { data: tagData, error: tagError } = await supabase
          .from("tags")
          .select("*")
          .eq("slug", slug)
          .single();

        if (tagError) throw tagError;
        setTag(tagData);

        // Fetch articles with this tag
        const { data: articleTagsData, error: articleTagsError } = await supabase
          .from("article_tags")
          .select("article_id")
          .eq("tag_id", tagData.id);

        if (articleTagsError) throw articleTagsError;

        if (articleTagsData && articleTagsData.length > 0) {
          const articleIds = articleTagsData.map((at) => at.article_id);
          
          const { data: articlesData, error: articlesError } = await supabase
            .from("news_articles")
            .select("id, title, excerpt, slug, category, image_url, created_at")
            .in("id", articleIds)
            .eq("published", true)
            .order("created_at", { ascending: false });

          if (articlesError) throw articlesError;
          setArticles(articlesData || []);
        }
      } catch (error) {
        console.error("Error fetching tag:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTagAndArticles();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold mb-4">Tag Not Found</h1>
            <p className="text-muted-foreground mb-8">The tag you're looking for doesn't exist.</p>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="container mx-auto px-4 py-8 flex-1">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">#{tag.name}</h1>
          <p className="text-muted-foreground">
            {articles.length} article{articles.length !== 1 ? "s" : ""} tagged
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No articles found with this tag.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group block bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {article.image_url && (
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={bustImageCache(article.image_url)}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/seed/${article.slug}/800/450`;
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase text-primary">
                      {article.category}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(article.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Tag;
