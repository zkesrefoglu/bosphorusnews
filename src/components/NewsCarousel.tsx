import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselApi, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { BreakingNewsBadge } from "@/components/BreakingNewsBadge";
import { Pause, Play } from "lucide-react";

interface CarouselArticle {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
  photoCredit?: string;
  breakingNews?: boolean;
}

interface NewsCarouselProps {
  articles: CarouselArticle[];
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

const formatCategoryLabel = (category: string): string => {
  if (category === "Türkiye") return "TÜRKİYE";
  return category.toUpperCase();
};

const AUTOPLAY_DELAY = 9000;

export const NewsCarousel = ({ articles }: NewsCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const plugin = React.useRef(
    Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // Update current slide index
  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setProgress(0); // Reset progress on slide change
    });
  }, [api]);

  // Progress bar animation
  useEffect(() => {
    if (isPaused || !api) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / (AUTOPLAY_DELAY / 50));
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused, api, current]);

  const togglePause = useCallback(() => {
    if (!plugin.current) return;
    
    if (isPaused) {
      plugin.current.play();
      setIsPaused(false);
    } else {
      plugin.current.stop();
      setIsPaused(true);
    }
  }, [isPaused]);

  const goToSlide = useCallback((index: number) => {
    api?.scrollTo(index);
    setProgress(0);
  }, [api]);

  const nextSlideIndex = (current + 1) % articles.length;
  const nextArticle = articles[nextSlideIndex];

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[plugin.current]}
      setApi={setApi}
      className="w-full mb-16"
    >
      <CarouselContent>
        {articles.map((article, index) => (
          <CarouselItem key={index}>
            <Link to={`/article/${article.slug}`}>
              <div className="carousel-slide group cursor-pointer border-0 rounded-lg overflow-hidden shadow-2xl">
                {/* Background Image with Ken Burns Effect */}
                <div className="relative w-full h-full">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="carousel-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://picsum.photos/seed/${article.slug}/1920/820`;
                    }}
                  />
                  {article.photoCredit && (
                    <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
                      {article.photoCredit}
                    </div>
                  )}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 gradient-overlay-dark" />

                {/* Breaking News Badge - Top Right */}
                {article.breakingNews && (
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 h-[20%]">
                    <BreakingNewsBadge className="h-full w-auto" />
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 lg:p-12 container-custom">
                  <div className="max-w-4xl">
                    <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
                      <span className={`category-badge ${getCategoryColor(article.category)} text-white text-[10px] md:text-xs`}>
                        {formatCategoryLabel(article.category)}
                      </span>
                      <time className="text-xs md:text-sm text-white/80 font-ui uppercase tracking-wide">{article.date}</time>
                    </div>

                    <h2 className="font-headline text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-3 md:mb-6 text-shadow-lg text-balance group-hover:text-white/90 transition-colors">
                      {article.title}
                    </h2>

                    <p className="text-sm md:text-base lg:text-lg xl:text-xl text-white/90 leading-relaxed max-w-3xl line-clamp-2 md:line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Bottom Controls - Progress bar, pause button, dots, and next preview */}
      <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 flex items-center gap-3 z-20">
        {/* Pause/Play Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePause();
          }}
          className="w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full text-white hover:bg-black/60 transition-colors"
          aria-label={isPaused ? "Play" : "Pause"}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>

        {/* Progress Bar with Dots */}
        <div className="flex items-center gap-2">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goToSlide(index);
              }}
              className="relative h-1.5 rounded-full overflow-hidden bg-white/30 hover:bg-white/50 transition-colors"
              style={{ width: index === current ? "48px" : "8px" }}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === current && (
                <div
                  className="absolute inset-y-0 left-0 bg-white rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Next Article Preview - Expanded Card */}
        {articles.length > 1 && nextArticle && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToSlide(nextSlideIndex);
            }}
            className="hidden md:flex items-center gap-3 bg-black/50 backdrop-blur-md rounded-lg p-2 text-white hover:bg-black/70 transition-all max-w-[320px] group/next"
          >
            {/* Thumbnail */}
            <div className="relative w-20 h-14 rounded overflow-hidden shrink-0">
              <img
                src={nextArticle.imageUrl}
                alt={nextArticle.title}
                className="w-full h-full object-cover group-hover/next:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://picsum.photos/seed/${nextArticle.slug}/160/112`;
                }}
              />
            </div>
            {/* Text Content */}
            <div className="flex flex-col items-start gap-1 min-w-0">
              <span className="text-[10px] text-white/60 uppercase tracking-wider font-medium">Up Next</span>
              <span className="text-sm font-medium leading-tight line-clamp-2 text-left">{nextArticle.title}</span>
            </div>
          </button>
        )}
      </div>

      {/* Navigation Arrows */}
      <CarouselPrevious className="left-2 md:left-4 top-1/3 w-8 h-8 md:w-10 md:h-10 bg-black/30 backdrop-blur-sm border-white/10 text-white hover:bg-white/90 hover:text-foreground transition-all opacity-60 hover:opacity-100" />
      <CarouselNext className="right-2 md:right-4 top-1/3 w-8 h-8 md:w-10 md:h-10 bg-black/30 backdrop-blur-sm border-white/10 text-white hover:bg-white/90 hover:text-foreground transition-all opacity-60 hover:opacity-100" />
    </Carousel>
  );
};
