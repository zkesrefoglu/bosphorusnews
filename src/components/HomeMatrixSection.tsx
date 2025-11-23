import { Link } from "react-router-dom";
import { Card } from "./ui/card";

interface Article {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
  photoCredit?: string;
}

interface CategoryColumn {
  name: string;
  articles: Article[];
}

interface HomeMatrixSectionProps {
  categories: CategoryColumn[];
}

const getCategoryColor = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    "Agenda": "bg-category-agenda",
    "Türkiye": "bg-category-turkiye",
    "Defense": "bg-category-fp-defense",
    "FP & Defense": "bg-category-fp-defense",
    "Economy": "bg-category-business",
    "Business & Economy": "bg-category-business",
    "Life": "bg-category-life",
    "Sports": "bg-category-sports",
    "World": "bg-category-world",
    "Xtra": "bg-category-xtra",
  };
  return categoryMap[category] || "bg-accent";
};

const formatCategoryLabel = (category: string): string => {
  if (category === "Türkiye") return "TÜRKİYE";
  return category.toUpperCase();
};

export const HomeMatrixSection = ({ categories }: HomeMatrixSectionProps) => {
  // Filter out Xtra category as it's displayed separately
  const filteredCategories = categories.filter(cat => cat.name.toLowerCase() !== 'xtra');
  
  return (
    <section className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredCategories.map((categoryColumn) => (
          <div key={categoryColumn.name} className="space-y-6">
            {/* Category Header */}
            <div className="flex items-center justify-between mb-4">
              <Link to={`/section/${categoryColumn.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}>
                <h3 className="text-lg font-ui font-bold uppercase tracking-wider text-foreground hover:text-accent transition-colors">
                  {formatCategoryLabel(categoryColumn.name)}
                </h3>
              </Link>
            </div>

            {/* Articles */}
            {categoryColumn.articles.map((article, index) => (
              <Link key={article.slug} to={`/article/${article.slug}`}>
                {index === 0 ? (
                  /* Large Card with Image */
                  <Card className="article-card group border-0 shadow-md hover:shadow-xl">
                    <div className="relative aspect-[3/2] overflow-hidden">
                      <img
                        src={article.imageUrl || `https://picsum.photos/seed/${article.slug}/600/400`}
                        alt={article.title}
                        className="article-image"
                      />
                      {article.photoCredit && (
                        <div className="absolute bottom-2 right-2 text-xs text-white/70 bg-black/30 px-2 py-1 rounded z-10">
                          {article.photoCredit}
                        </div>
                      )}
                      <div className="absolute inset-0 gradient-overlay-dark opacity-80" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                         <span className={`category-badge ${getCategoryColor(article.category)} text-white mb-3`}>
                           {formatCategoryLabel(article.category)}
                         </span>
                        <h4 className="font-headline text-2xl font-bold leading-tight mb-2 text-shadow-lg group-hover:text-accent-light transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-sm text-white/90 line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  /* Small Text-Heavy Card */
                  <div className="group py-4 border-t border-border hover:bg-muted/50 transition-colors px-2 -mx-2 rounded">
                    <h5 className="font-body text-base font-semibold leading-snug mb-2 text-foreground group-hover:text-accent transition-colors line-clamp-3">
                      {article.title}
                    </h5>
                    <time className="text-xs text-muted-foreground font-ui uppercase tracking-wide">
                      {article.date}
                    </time>
                  </div>
                )}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};