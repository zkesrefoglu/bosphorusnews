import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { NewsFeedItem } from "@/components/NewsFeedItem";
import { DailyTopic } from "@/components/DailyTopic";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import xtraLogo from "@/assets/xtra-logo.png";
import bannerImage from "@/assets/banner-diplomatic.jpg";

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
      "turkiye": "Türkiye",
      "world": "World",
      "sports": "Sports",
      "xtra": "Xtra",
      "editorial": "Editorial",
    };
    return sectionMap[slug] || slug;
  };

  const sectionName = section ? getSectionName(section) : "";
  const [dailyTopic, setDailyTopic] = useState<NewsArticleData | null>(null);
  const [latestXtraImage, setLatestXtraImage] = useState<string>(bannerImage);

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

          // For Xtra section, get the latest article's image
          if (sectionName === "Xtra" && data.length > 0 && data[0].image_url) {
            setLatestXtraImage(data[0].image_url);
          }
        }

        // Fetch Daily Topic for Xtra section
        if (sectionName === "Xtra") {
          const { data: dailyTopicData, error: dailyTopicError } = await supabase
            .from("daily_topics")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (!dailyTopicError && dailyTopicData) {
            setDailyTopic({
              title: dailyTopicData.title,
              excerpt: dailyTopicData.excerpt,
              content: dailyTopicData.content,
              section: "Editorial",
              author: dailyTopicData.author,
              date: new Date(dailyTopicData.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }),
              slug: dailyTopicData.slug,
              timestamp: new Date(dailyTopicData.created_at),
            });
          }
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
              // Special Xtra Banner - Horizontal Layout
              <div className="mb-12 relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-background via-primary/5 to-background">
                {/* Diplomatic Banner Background */}
                <div className="absolute inset-0 opacity-20">
                  <img 
                    src={latestXtraImage} 
                    alt="Latest Xtra" 
                    className="w-full h-full object-cover"
                    style={{
                      filter: 'grayscale(40%) contrast(1.1) brightness(0.7)',
                      mixBlendMode: 'multiply'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
                </div>

                {/* Animated accent effects */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
                  <div className="absolute top-0 -right-4 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                  <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/50 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>
                
                <div className="relative px-6 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                  {/* Logo Section */}
                  <div className="flex-shrink-0 relative group">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-primary/30 p-4 bg-background/50 backdrop-blur-sm hover-scale">
                      <img 
                        src={xtraLogo} 
                        alt="Xtra" 
                        className="w-full h-full object-contain animate-fade-in"
                      />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-grow text-center md:text-left">
                    <p className="text-xl md:text-2xl lg:text-3xl font-medium mb-4 leading-relaxed text-foreground">
                      Beyond the headlines. Deep dives, special features, and exclusive content.
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                      <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                        {articles.length} {articles.length === 1 ? 'article' : 'articles'}
                      </div>
                    </div>
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

            {/* Daily Topic for Xtra section */}
            {isXtraSection && dailyTopic && (
              <div className="mb-12">
                <DailyTopic 
                  title={dailyTopic.title}
                  excerpt={dailyTopic.excerpt}
                  author={dailyTopic.author}
                  date={dailyTopic.date}
                  slug={dailyTopic.slug}
                />
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
