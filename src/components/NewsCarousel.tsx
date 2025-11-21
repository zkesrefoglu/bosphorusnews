import React from "react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface CarouselArticle {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
}

interface NewsCarouselProps {
  articles: CarouselArticle[];
}

const getCategoryColor = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    "Agenda": "bg-category-agenda",
    "Turkiye": "bg-category-turkiye",
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
                <img src={article.imageUrl} alt={article.title} className="carousel-image" />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 gradient-overlay-dark" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 container-custom">
                  <div className="max-w-4xl">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`category-badge ${getCategoryColor(article.category)} text-white`}>
                        {article.category}
                      </span>
                      <time className="text-sm text-white/80 font-ui uppercase tracking-wide">{article.date}</time>
                    </div>

                    <h2 className="font-headline text-4xl md:text-6xl font-bold text-white leading-tight mb-6 text-shadow-lg text-balance group-hover:text-white/90 transition-colors">
                      {article.title}
                    </h2>

                    <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-3xl line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Navigation Buttons */}
      <CarouselPrevious className="left-6 w-12 h-12 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-foreground transition-all" />
      <CarouselNext className="right-6 w-12 h-12 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white hover:text-foreground transition-all" />
    </Carousel>
  );
};
