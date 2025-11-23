import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Article {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
}

interface HomeFeaturedMidProps {
  article: Article | null;
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

export const HomeFeaturedMid = ({ article }: HomeFeaturedMidProps) => {
  if (!article) return null;

  return (
    <section className="my-8 sm:my-12 md:my-16">
      <Link to={`/article/${article.slug}`}>
        <div className="relative overflow-hidden rounded-lg group cursor-pointer h-[400px] sm:h-[500px] md:h-[600px]">
          {/* Background Image */}
          <img
            src={article.imageUrl || `https://picsum.photos/seed/${article.slug}/1200/800`}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover image-darkened transition-transform duration-[5s] ease-out group-hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 gradient-overlay-subtle" />

          {/* Content */}
          <div className="absolute top-1/2 left-4 sm:left-8 md:left-12 lg:left-16 -translate-y-1/2 max-w-2xl pr-4 sm:pr-8">
            <span className={`category-badge text-xs sm:text-sm ${getCategoryColor(article.category)} text-white mb-3 sm:mb-4`}>
              {article.category}
            </span>
            
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 sm:mb-5 md:mb-6 text-shadow-lg text-balance">
              {article.title}
            </h2>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/95 leading-relaxed mb-6 sm:mb-7 md:mb-8 line-clamp-2 sm:line-clamp-3">
              {article.excerpt}
            </p>

            <div className="inline-flex items-center gap-2 px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 bg-white text-foreground text-sm sm:text-base font-semibold rounded transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:translate-x-1 touch-manipulation">
              <span>Read Full Story</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
};