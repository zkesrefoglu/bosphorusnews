import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { NewsCarousel } from "@/components/NewsCarousel";
import { HomeMatrixSection } from "@/components/HomeMatrixSection";
import { HomeFeaturedMid } from "@/components/HomeFeaturedMid";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

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
  const [agendaArticles, setAgendaArticles] = useState<Article[]>([]);
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

      // 2. MATRIX SECTION: Politics, FP & Defense, Business & Economy (3 articles each)
      const matrixCats = ["Politics", "FP & Defense", "Business & Economy"];
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

      // 3. AGENDA: All Agenda articles
      const { data: agendaData, error: agendaError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("category", "Agenda")
        .order("created_at", { ascending: false });

      if (agendaError) throw agendaError;

      if (agendaData) {
        setAgendaArticles(
          agendaData.map((article) => ({
            title: article.title,
            excerpt: article.excerpt,
            slug: article.slug,
            imageUrl: article.image_url || `https://picsum.photos/seed/${article.slug}/600/400`,
            category: article.category,
            date: new Date(article.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
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

        {/* AGENDA SECTION */}
        {agendaArticles.length > 0 && (
          <div className="container-custom mt-16">
            <h2 className="text-3xl font-bold mb-8">Agenda</h2>
            <div className="space-y-6">
              {agendaArticles.map((article, index) => (
                <Link key={index} to={`/article/${article.slug}`} className="block group">
                  <article className="flex flex-col md:flex-row gap-6 border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow p-6">
                    <div className="flex-1 flex flex-col justify-center order-2 md:order-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {article.category}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <time className="text-xs text-muted-foreground">{article.date}</time>
                      </div>
                      <h3 className="text-2xl font-bold mb-3 leading-tight group-hover:text-primary transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>
                    <div className="w-full md:w-[400px] h-[250px] flex-shrink-0 order-1 md:order-2">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover rounded transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
