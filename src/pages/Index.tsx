import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { DailyTopic } from "@/components/DailyTopic";
import { NewsFeedItem } from "@/components/NewsFeedItem";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DailyTopicData {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
  timestamp: Date;
  section: string;
}

interface NewsArticleData {
  title: string;
  excerpt: string;
  section: string;
  author: string;
  date: string;
  slug: string;
  timestamp: Date;
}

const Index = () => {
  const { toast } = useToast();
  const [dailyTopic, setDailyTopic] = useState<DailyTopicData | null>(null);
  const [newsItems, setNewsItems] = useState<NewsArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch the latest daily topic
      const { data: topicData, error: topicError } = await supabase
        .from("daily_topics")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (topicError) throw topicError;

      if (topicData) {
        setDailyTopic({
          title: topicData.title,
          excerpt: topicData.excerpt,
          author: topicData.author,
          date: new Date(topicData.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }),
          slug: topicData.slug,
          timestamp: new Date(topicData.created_at),
          section: "Agenda",
        });
      }

      // Fetch all news articles from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const { data: articlesData, error: articlesError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .gte("created_at", todayISO)
        .order("created_at", { ascending: false });

      if (articlesError) throw articlesError;

      if (articlesData) {
        setNewsItems(
          articlesData.map((article) => ({
            title: article.title,
            excerpt: article.excerpt,
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
        description: "Failed to load content",
        variant: "destructive",
      });
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
            {dailyTopic && <DailyTopic {...dailyTopic} />}
            
            <section>
              <h2 className="text-2xl font-bold mb-6 tracking-tight">Latest News</h2>
              {newsItems.length > 0 ? (
                <div className="space-y-0 rounded-lg overflow-hidden border border-border">
                  {newsItems.map((item, index) => (
                    <NewsFeedItem key={index} {...item} />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No news articles available</p>
              )}
            </section>
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
