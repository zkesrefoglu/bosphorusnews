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
  const [firstMatrixCategories, setFirstMatrixCategories] = useState<Array<{ name: string; articles: Article[] }>>([]);
  const [secondMatrixCategories, setSecondMatrixCategories] = useState<Array<{ name: string; articles: Article[] }>>([]);
  const [firstMidFeatured, setFirstMidFeatured] = useState<Article | null>(null);
  const [secondMidFeatured, setSecondMidFeatured] = useState<Article | null>(null);
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

      // 2. FIRST MATRIX SECTION: Politics, FP & Defense, Business & Economy
      const firstMatrixCats = ["Politics", "FP & Defense", "Business & Economy"];
      const firstMatrixData = await Promise.all(
        firstMatrixCats.map(async (category) => {
          const { data, error } = await supabase
            .from("news_articles")
            .select("*")
            .eq("published", true)
            .eq("category", category)
            .eq("is_carousel_featured", false)
            .order("created_at", { ascending: false })
            .limit(2);

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
      setFirstMatrixCategories(firstMatrixData);

      // 3. FIRST MID-FEATURED: From Politics, FP & Defense, Business categories
      const { data: firstMidData, error: firstMidError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("is_mid_featured", true)
        .in("category", ["Politics", "FP & Defense", "Business & Economy"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (firstMidError && firstMidError.code !== 'PGRST116') throw firstMidError;

      if (firstMidData) {
        setFirstMidFeatured({
          title: firstMidData.title,
          excerpt: firstMidData.excerpt,
          slug: firstMidData.slug,
          imageUrl: firstMidData.image_url || `https://picsum.photos/seed/${firstMidData.slug}/1200/600`,
          category: firstMidData.category,
          date: new Date(firstMidData.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        });
      }

      // 4. SECOND MATRIX SECTION: Technology, Life
      const secondMatrixCats = ["Technology", "Life"];
      const secondMatrixData = await Promise.all(
        secondMatrixCats.map(async (category) => {
          const { data, error } = await supabase
            .from("news_articles")
            .select("*")
            .eq("published", true)
            .eq("category", category)
            .eq("is_carousel_featured", false)
            .order("created_at", { ascending: false })
            .limit(2);

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
      setSecondMatrixCategories(secondMatrixData);

      // 5. SECOND MID-FEATURED: From Technology, Life
      const { data: secondMidData, error: secondMidError } = await supabase
        .from("news_articles")
        .select("*")
        .eq("published", true)
        .eq("is_mid_featured", true)
        .in("category", ["Technology", "Life"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (secondMidError && secondMidError.code !== 'PGRST116') throw secondMidError;

      if (secondMidData) {
        setSecondMidFeatured({
          title: secondMidData.title,
          excerpt: secondMidData.excerpt,
          slug: secondMidData.slug,
          imageUrl: secondMidData.image_url || `https://picsum.photos/seed/${secondMidData.slug}/1200/600`,
          category: secondMidData.category,
          date: new Date(secondMidData.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        });
      }

      // 6. AGENDA: All Agenda articles
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

        {/* FIRST MATRIX SECTION */}
        {firstMatrixCategories.length > 0 && (
          <div className="container-custom">
            <HomeMatrixSection categories={firstMatrixCategories} />
          </div>
        )}

        {/* FIRST MID-FEATURED */}
        {firstMidFeatured && (
          <div className="container-custom">
            <HomeFeaturedMid article={firstMidFeatured} />
          </div>
        )}

        {/* SECOND MATRIX SECTION */}
        {secondMatrixCategories.length > 0 && (
          <div className="container-custom">
            <HomeMatrixSection categories={secondMatrixCategories} />
          </div>
        )}

        {/* SECOND MID-FEATURED */}
        {secondMidFeatured && (
          <div className="container-custom">
            <HomeFeaturedMid article={secondMidFeatured} />
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
