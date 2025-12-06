import { Link } from "react-router-dom";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LatestNewsArticle {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
}

interface LatestNewsStripProps {
  articles: LatestNewsArticle[];
}

const getCategoryColor = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    "Agenda": "bg-category-agenda",
    "Türkiye": "bg-category-turkiye",
    "Economy": "bg-category-business",
    "Business & Economy": "bg-category-business",
    "Defense": "bg-category-fp-defense",
    "FP & Defense": "bg-category-fp-defense",
    "Life": "bg-category-life",
    "Sports": "bg-category-sports",
    "World": "bg-category-world",
    "Xtra": "bg-category-xtra",
    "Editorial": "bg-category-xtra",
  };
  return categoryMap[category] || "bg-accent";
};

export const LatestNewsStrip = ({ articles }: LatestNewsStripProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollButtons);
      updateScrollButtons();
      return () => container.removeEventListener("scroll", updateScrollButtons);
    }
  }, [articles]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = 320;
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (articles.length === 0) return null;

  return (
    <section className="py-12 bg-muted/30">
      <div className="container-custom">
        {/* Scrollable container with navigation */}
        <div className="relative">
          {/* Left arrow */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background transition-opacity -translate-x-1/2 ${
              canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>

          {/* Right arrow */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background transition-opacity translate-x-1/2 ${
              canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Cards container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* FRONTPAGE NEWS Title Card */}
            <div className="flex-none w-[280px] md:w-[300px] snap-start">
              <div className="bg-muted border border-border overflow-hidden shadow-sm flex items-center justify-center aspect-[16/10] relative">
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.03)_0%,transparent_50%)]" />
                
                {/* Text */}
                <div className="relative z-10 text-center px-6">
                  <h2 className="font-headline text-2xl md:text-3xl font-black text-foreground leading-tight tracking-tight uppercase">
                    Frontpage
                    <br />
                    News
                  </h2>
                </div>
              </div>
            </div>

            {/* Article cards */}
            {articles.map((article) => (
              <Link
                key={article.slug}
                to={`/article/${article.slug}`}
                className="flex-none w-[280px] md:w-[300px] snap-start group/card"
              >
              <article className="bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://picsum.photos/seed/${article.slug}/600/400`;
                      }}
                    />
                    {/* Category badge */}
                    <span className={`absolute top-3 left-3 ${getCategoryColor(article.category)} text-white text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-wide`}>
                      {article.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-headline text-base font-semibold text-foreground leading-snug line-clamp-2 group-hover/card:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <time className="block mt-2 text-xs text-muted-foreground font-ui uppercase tracking-wide">
                      {article.date}
                    </time>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
