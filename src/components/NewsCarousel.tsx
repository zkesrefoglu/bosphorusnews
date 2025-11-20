import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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

export const NewsCarousel = ({ articles }: NewsCarouselProps) => {
  return (
    <div className="mb-16 animate-fade-in">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {articles.map((article, index) => (
            <CarouselItem key={index}>
              <Link to={`/article/${article.slug}`}>
                <Card className="relative overflow-hidden rounded-lg group cursor-pointer h-[500px] md:h-[600px]">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ 
                      backgroundImage: `url(${article.imageUrl})`,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                  
                  <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                    <div className="mb-4 flex items-center space-x-3">
                      <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-primary text-primary-foreground rounded">
                        {article.category}
                      </span>
                      <time className="text-sm text-muted-foreground">{article.date}</time>
                    </div>
                    
                    <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {article.title}
                    </h2>
                    
                    <p className="text-lg text-foreground/90 leading-relaxed max-w-3xl line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </div>
  );
};
