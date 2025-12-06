import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { NewsCarousel } from "@/components/NewsCarousel";
import { LatestNewsStrip } from "@/components/LatestNewsStrip";
import { HomeMatrixSection } from "@/components/HomeMatrixSection";
import { DailyTopic } from "@/components/DailyTopic";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { bustImageCache } from "@/lib/imageUtils";

interface Article {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
  photoCredit?: string;
  breakingNews?: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [carouselArticles, setCarouselArticles] = useState<Article[]>([]);
  const [latestNewsArticles, setLatestNewsArticles] = useState<Article[]>([]);
  const [matrixCategories, setMatrixCategories] = useState<Array<{ name: string; articles: Article[] }>>([]);
  const [editorsPick, setEditorsPick] = useState<{
    title: string;
    excerpt: string;
    author: string;
    date: string;
    slug: string;
    imageUrl?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. CAROUSEL: Top 5 carousel-featured articles
      // Pinned articles first, then by display_order, then by date
      let carouselQuery = supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("is_carousel_featured", true)
        .order("is_carousel_pinned", { ascending: false })
        .order("display_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(5);

      const { data: carouselData, error: carouselError } = await carouselQuery;
      if (carouselError) throw carouselError;

      const carouselFinal = carouselData || [];

      setCarouselArticles([
        ...carouselFinal.map((article) => ({
          title: article.title,
          excerpt: article.excerpt,
          slug: article.slug,
          imageUrl: bustImageCache(article.image_url) || `https://picsum.photos/seed/${article.slug}/1200/600`,
          category: article.category,
          date: new Date(article.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          photoCredit: article.photo_credit,
          breakingNews: article.breaking_news || false,
        }))
      ]);

      // Get carousel slugs for exclusion
      const carouselSlugs = carouselFinal.map(a => a.slug);

      // 2. LATEST NEWS STRIP: Recent non-carousel articles (6 most recent)
      const { data: latestData, error: latestError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("is_carousel_featured", false)
        .order("created_at", { ascending: false })
        .limit(6);

      if (latestError) throw latestError;

      setLatestNewsArticles(
        (latestData || []).map((article) => ({
          title: article.title,
          excerpt: article.excerpt,
          slug: article.slug,
          imageUrl: bustImageCache(article.image_url) || `https://picsum.photos/seed/${article.slug}/600/400`,
          category: article.category,
          date: new Date(article.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        }))
      );

      // 3. MATRIX SECTION: Get all categories dynamically (3 articles each)
      // First get distinct categories excluding Xtra
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("news_articles")
        .select("category")
        .eq("published", true)
        .neq("category", "Xtra")
        .order("category");

      if (categoriesError) throw categoriesError;

      // Get unique categories
      const uniqueCategories = Array.from(
        new Set(categoriesData?.map((item) => item.category) || [])
      );

      // Fetch articles for each category
      const matrixData = await Promise.all(
        uniqueCategories.map(async (category) => {
          const { data, error } = await supabase
            .from("news_articles")
            .select("*")
            .eq("published", true)
            .eq("category", category)
            .order("category_pin_order", { ascending: true, nullsFirst: false })
            .order("created_at", { ascending: false })
            .limit(3);

          if (error) throw error;

          return {
            name: category,
            articles: (data || []).map((article) => ({
              title: article.title,
              excerpt: article.excerpt,
              slug: article.slug,
              imageUrl: bustImageCache(article.image_url) || `https://picsum.photos/seed/${article.slug}/600/400`,
              category: article.category,
              date: new Date(article.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              photoCredit: article.photo_credit,
              breakingNews: article.breaking_news || false,
            })),
          };
        })
      );
      setMatrixCategories(matrixData);

      // 3. XTRA: Latest from Xtra category
      const { data: xtraArticle, error: xtraError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("category", "Xtra")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (xtraError) {
        console.error("Error fetching Xtra article:", xtraError);
      }

      if (xtraArticle) {
        setEditorsPick({
          title: xtraArticle.title,
          excerpt: xtraArticle.excerpt,
          author: xtraArticle.author,
          date: new Date(xtraArticle.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          slug: xtraArticle.slug,
          imageUrl: xtraArticle.image_url || undefined,
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

        {/* LATEST NEWS STRIP */}
        {latestNewsArticles.length > 0 && (
          <LatestNewsStrip articles={latestNewsArticles} />
        )}

        {/* MATRIX SECTION */}
        {matrixCategories.length > 0 && (
          <div className="container-custom">
            <HomeMatrixSection categories={matrixCategories} />
          </div>
        )}

        {/* XTRA SECTION */}
        {editorsPick && (
          <div className="container-custom mt-16">
            <DailyTopic 
              title={editorsPick.title}
              excerpt={editorsPick.excerpt}
              author={editorsPick.author}
              date={editorsPick.date}
              slug={editorsPick.slug}
              imageUrl={editorsPick.imageUrl}
            />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
