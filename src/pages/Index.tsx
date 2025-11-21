import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { NewsCarousel } from "@/components/NewsCarousel";
import { HomeMatrixSection } from "@/components/HomeMatrixSection";
import { DailyTopic } from "@/components/DailyTopic";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Article {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
}

const Index = () => {
  const { toast } = useToast();
  const [carouselArticles, setCarouselArticles] = useState<Article[]>([]);
  const [matrixCategories, setMatrixCategories] = useState<Array<{ name: string; articles: Article[] }>>([]);
  const [editorsPick, setEditorsPick] = useState<{
    title: string;
    excerpt: string;
    author: string;
    date: string;
    slug: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. CAROUSEL: Top 5 carousel-featured articles
      let carouselQuery = supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("is_carousel_featured", true)
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: carouselData, error: carouselError } = await carouselQuery;
      if (carouselError) throw carouselError;

      let carouselFinal = carouselData || [];

      // FALLBACK: If fewer than 5, fill with latest articles
      if (carouselFinal.length < 5) {
        const { data: fillData, error: fillError } = await supabase
          .from("news_articles")
          .select("*")
          .eq("published", true)
          .eq("is_carousel_featured", false)
          .not("image_url", "is", null)
          .order("created_at", { ascending: false })
          .limit(5 - carouselFinal.length);

        if (fillError) throw fillError;
        carouselFinal = [...carouselFinal, ...(fillData || [])];
      }

      setCarouselArticles(
        carouselFinal.map((article) => ({
          title: article.title,
          excerpt: article.excerpt,
          slug: article.slug,
          imageUrl: article.image_url || `https://picsum.photos/seed/${article.slug}/1200/600`,
          category: article.category,
          date: new Date(article.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }))
      );

      // 2. MATRIX SECTION: Turkiye, Economy, World (3 articles each)
      const matrixCats = ["Turkiye", "Economy", "World"];
      const matrixData = await Promise.all(
        matrixCats.map(async (category) => {
          const { data, error } = await supabase
            .from("news_articles")
            .select("*")
            .eq("published", true)
            .eq("category", category)
            .eq("is_carousel_featured", false)
            .order("created_at", { ascending: false })
            .limit(3);

          if (error) throw error;

          return {
            name: category,
            articles: (data || []).map((article) => ({
              title: article.title,
              excerpt: article.excerpt,
              slug: article.slug,
              imageUrl: article.image_url || `https://picsum.photos/seed/${article.slug}/600/400`,
              category: article.category,
              date: new Date(article.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
            })),
          };
        })
      );
      setMatrixCategories(matrixData);

      // 3. EDITOR'S PICK: Latest from daily_topics table
      const { data: dailyTopicData, error: dailyTopicError } = await supabase
        .from("daily_topics")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dailyTopicError) {
        console.error("Error fetching daily topic:", dailyTopicError);
      }

      if (dailyTopicData) {
        setEditorsPick({
          title: dailyTopicData.title,
          excerpt: dailyTopicData.excerpt,
          author: dailyTopicData.author,
          date: new Date(dailyTopicData.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          slug: dailyTopicData.slug,
        });
      } else {
        // Placeholder content for Editor's Pick
        setEditorsPick({
          title: "The Shifting Landscape of Global Politics",
          excerpt: "In an era of unprecedented change, we examine how geopolitical tensions, economic pressures, and technological disruption are reshaping international relations. From trade wars to climate negotiations, the world is witnessing a fundamental transformation in how nations interact and compete on the global stage.",
          author: "Editorial Team",
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          slug: "editors-pick-placeholder",
        });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-custom py-8">
          <Skeleton className="w-full h-[600px] rounded-lg mb-16" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Skeleton className="h-[400px] rounded-lg" />
            <Skeleton className="h-[400px] rounded-lg" />
            <Skeleton className="h-[400px] rounded-lg" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="py-8">
        {/* CAROUSEL SECTION */}
        {carouselArticles.length > 0 && (
          <div className="container-custom">
            <NewsCarousel articles={carouselArticles} />
          </div>
        )}

        {/* MATRIX SECTION */}
        {matrixCategories.length > 0 && (
          <div className="container-custom">
            <HomeMatrixSection categories={matrixCategories} />
          </div>
        )}

        {/* EDITOR'S PICK SECTION */}
        {editorsPick && (
          <div className="container-custom mt-16">
            <DailyTopic 
              title={editorsPick.title}
              excerpt={editorsPick.excerpt}
              author={editorsPick.author}
              date={editorsPick.date}
              slug={editorsPick.slug}
            />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
