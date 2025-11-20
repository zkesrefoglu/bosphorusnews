import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { NewsFeedItem } from "@/components/NewsFeedItem";
import { DailyTopic } from "@/components/DailyTopic";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

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
      "politics": "Politics",
      "fp-defense": "FP & Defense",
      "business-economy": "Business & Economy",
      "life": "Life",
      "health": "Health",
      "sports": "Sports",
      "world": "World",
      "xtra": "Xtra",
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

  // Check if this is the Xtra section - show as Daily Topic format
  const isXtraSection = sectionName === "Xtra";
  const latestXtraArticle = isXtraSection && articles.length > 0 ? articles[0] : null;

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
            {isXtraSection && latestXtraArticle ? (
              // Show Xtra as Daily Topic format
              <DailyTopic 
                title={latestXtraArticle.title}
                excerpt={latestXtraArticle.excerpt}
                author={latestXtraArticle.author}
                date={latestXtraArticle.date}
                slug={latestXtraArticle.slug}
              />
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{sectionName}</h1>
                  <p className="text-muted-foreground">
                    {articles.length} {articles.length === 1 ? 'article' : 'articles'} in this section
                  </p>
                </div>

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
