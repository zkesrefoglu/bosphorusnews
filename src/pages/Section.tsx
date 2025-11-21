import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { NewsFeedItem } from "@/components/NewsFeedItem";
import { DailyTopic } from "@/components/DailyTopic";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import xtraLogo from "@/assets/xtra-logo.png";

interface NewsArticleData {
  title: string;
  excerpt: string;
  content: string;
  section: string;
  author: string;
  date: string;
  slug: string;
  timestamp: Date;
}

const Section = () => {
  const { section } = useParams<{ section: string }>();
  const { toast } = useToast();
  const [articles, setArticles] = useState<NewsArticleData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Convert URL slug back to proper section name
  const getSectionName = (slug: string): string => {
    const sectionMap: { [key: string]: string } = {
      "agenda": "Agenda",
      "economy": "Economy",
      "defense": "Defense",
      "life": "Life",
      "turkiye": "Turkiye",
      "world": "World",
      "xtra": "Xtra",
      "editorial": "Editorial",
    };
    return sectionMap[slug] || slug;
  };

  const sectionName = section ? getSectionName(section) : "";

  useEffect(() => {
    if (!sectionName) return;
    
    const fetchArticles = async () => {
      try {
        const { data, error } = await supabase
          .from("news_articles")
          .select("*")
          .eq("published", true)
          .eq("category", sectionName)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          setArticles(
            data.map((article) => ({
              title: article.title,
              excerpt: article.excerpt,
              content: article.content,
              section: article.category,
              author: article.author,
              date: new Date(article.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
              slug: article.slug,
              timestamp: new Date(article.created_at),
            }))
          );
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load articles",
          variant: "destructive",
        });
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [sectionName, toast]);

  // Check if this is the Editorial section - show as Daily Topic format
  const isEditorialSection = sectionName === "Editorial";
  const latestEditorialArticle = isEditorialSection && articles.length > 0 ? articles[0] : null;
  
  // Check if this is the Xtra section for special styling
  const isXtraSection = sectionName === "Xtra";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
            {isEditorialSection && latestEditorialArticle ? (
              // Show Editorial as Daily Topic format
              <DailyTopic 
                title={latestEditorialArticle.title}
                excerpt={latestEditorialArticle.excerpt}
                author={latestEditorialArticle.author}
                date={latestEditorialArticle.date}
                slug={latestEditorialArticle.slug}
              />
        ) : (
          <>
            {isXtraSection ? (
              // Special Xtra Banner
              <div className="mb-12 relative overflow-hidden rounded-2xl border border-primary/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
                <div className="relative px-8 py-16 md:py-20 flex flex-col items-center text-center">
                  <div className="mb-6 relative">
                    <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full" />
                    <img 
                      src={xtraLogo} 
                      alt="Xtra" 
                      className="relative w-40 h-40 md:w-48 md:h-48 object-contain animate-fade-in"
                    />
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Xtra
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl">
                    Beyond the headlines. Deep dives, special features, and exclusive content.
                  </p>
                  <div className="mt-4 text-sm text-muted-foreground/60">
                    {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{sectionName}</h1>
                <p className="text-muted-foreground">
                  {articles.length} {articles.length === 1 ? 'article' : 'articles'} in this section
                </p>
              </div>
            )}

            {articles.length > 0 ? (
                  <section>
                    <div className="space-y-0 rounded-lg overflow-hidden border border-border">
                      {articles.map((item, index) => (
                        <NewsFeedItem key={index} {...item} />
                      ))}
                    </div>
                  </section>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No articles in this section</p>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Section;
