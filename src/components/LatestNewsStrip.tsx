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
  const [isPaused, setIsPaused] = useState(false);

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 10
      );
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const autoScroll = setInterval(() => {
      if (!isPaused && container) {
        // If at the end, scroll back to start
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 10) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 1, behavior: "auto" });
        }
      }
    }, 30);

    return () => clearInterval(autoScroll);
  }, [isPaused]);

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
        <div 
          className="relative group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left arrow */}
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {/* Cards container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-5 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* LATEST NEWS Title Card */}
            <div className="flex-none w-[280px] md:w-[300px] snap-start">
              <div className="relative h-full min-h-[280px] bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                {/* Text */}
                <div className="relative z-10 text-center px-6">
                  <span className="block text-primary-foreground/60 text-sm font-ui uppercase tracking-[0.3em] mb-2">
                    Breaking
                  </span>
                  <h2 className="font-headline text-3xl md:text-4xl font-black text-primary-foreground leading-tight tracking-tight">
                    LATEST
                    <br />
                    NEWS
                  </h2>
                  <div className="mt-4 w-12 h-1 bg-primary-foreground/40 mx-auto rounded-full" />
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
                <article className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
