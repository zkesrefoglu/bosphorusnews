import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { NewsCarousel } from "@/components/NewsCarousel";
import { CategoryNewsGrid } from "@/components/CategoryNewsGrid";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CarouselArticle {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
}

interface CategoryArticle {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
}

const Index = () => {
  const { toast } = useToast();
  const [carouselArticles, setCarouselArticles] = useState<CarouselArticle[]>([]);
  const [categoryArticles, setCategoryArticles] = useState<CategoryArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch top 5 articles with images for the carousel (prioritizing those with images)
      const { data: carouselData, error: carouselError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .not("image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(5);

      if (carouselError) throw carouselError;

      if (carouselData) {
        setCarouselArticles(
          carouselData.map((article) => ({
            title: article.title,
            excerpt: article.excerpt,
            slug: article.slug,
            imageUrl: article.image_url || "",
            category: article.category,
            date: new Date(article.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          }))
        );
      }

      // Fetch articles for category grid (excluding Agenda and Xtra, showing others with images)
      const { data: categoryData, error: categoryError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .not("category", "in", '("Agenda","Xtra")')
        .order("created_at", { ascending: false })
        .limit(30);

      if (categoryError) throw categoryError;

      if (categoryData) {
        setCategoryArticles(
          categoryData.map((article) => ({
            title: article.title,
            excerpt: article.excerpt,
            slug: article.slug,
            imageUrl: article.image_url || "",
            category: article.category,
            date: new Date(article.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
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
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <>
            {carouselArticles.length > 0 && (
              <NewsCarousel articles={carouselArticles} />
            )}
            
            {categoryArticles.length > 0 && (
              <CategoryNewsGrid articles={categoryArticles} />
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
