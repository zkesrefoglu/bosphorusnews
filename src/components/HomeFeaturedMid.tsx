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

export const HomeFeaturedMid = ({ article }: HomeFeaturedMidProps) => {
  if (!article) return null;

  return (
    <section className="my-16">
      <Link to={`/article/${article.slug}`}>
        <div className="relative overflow-hidden rounded-lg group cursor-pointer" style={{ height: "600px" }}>
          {/* Background Image */}
          <img
            src={article.imageUrl || `https://picsum.photos/seed/${article.slug}/1200/800`}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover image-darkened transition-transform duration-[5s] ease-out group-hover:scale-105"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 gradient-overlay-subtle" />

          {/* Content */}
          <div className="absolute top-1/2 left-12 md:left-16 -translate-y-1/2 max-w-2xl">
            <span className={`category-badge ${getCategoryColor(article.category)} text-white mb-4`}>
              {article.category}
            </span>
            
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-white leading-tight mb-6 text-shadow-lg text-balance">
              {article.title}
            </h2>
            
            <p className="text-lg md:text-xl text-white/95 leading-relaxed mb-8 line-clamp-3">
              {article.excerpt}
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white text-foreground font-semibold rounded transition-all duration-300 group-hover:bg-accent group-hover:text-white group-hover:translate-x-1">
              <span>Read Full Story</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </Link>
    </section>
  );
};