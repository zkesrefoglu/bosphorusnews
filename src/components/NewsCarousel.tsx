import React from "react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { BreakingNewsBadge } from "@/components/BreakingNewsBadge";

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

export const NewsCarousel = ({ articles }: NewsCarouselProps) => {
  const plugin = React.useRef(Autoplay({ delay: 9000, stopOnInteraction: true }));

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      plugins={[plugin.current]}
      className="w-full mb-16"
    >
      <CarouselContent>
        {articles.map((article, index) => (
          <CarouselItem key={index}>
            <Link to={`/article/${article.slug}`}>
              <div className="carousel-slide group cursor-pointer border-0 rounded-lg overflow-hidden shadow-2xl">
                {/* Background Image with Ken Burns Effect */}
                <div className="relative w-full h-full">
                  <img src={article.imageUrl} alt={article.title} className="carousel-image" />
                  {article.photoCredit && (
                    <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/30 px-2 py-1 rounded">
                      {article.photoCredit}
                    </div>
                  )}
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 gradient-overlay-dark" />

                {/* Breaking News Badge - Top Left */}
                {article.breakingNews && (
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
                    <BreakingNewsBadge className="[&_span]:text-white [&_span]:drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] [&_img]:backdrop-blur-[2px] [&_img]:backdrop-brightness-[1.2] [&_img]:rounded [&_img]:p-1 [&_img]:w-12 [&_img]:h-12 md:[&_img]:w-16 md:[&_img]:h-16" />
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

      {/* Navigation Buttons - Smaller and positioned mid-height to avoid text */}
      <CarouselPrevious className="left-2 md:left-4 top-1/3 w-8 h-8 md:w-10 md:h-10 bg-black/30 backdrop-blur-sm border-white/10 text-white hover:bg-white/90 hover:text-foreground transition-all opacity-60 hover:opacity-100" />
      <CarouselNext className="right-2 md:right-4 top-1/3 w-8 h-8 md:w-10 md:h-10 bg-black/30 backdrop-blur-sm border-white/10 text-white hover:bg-white/90 hover:text-foreground transition-all opacity-60 hover:opacity-100" />
    </Carousel>
  );
};
