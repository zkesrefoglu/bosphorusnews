import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

interface NewsArticle {
  title: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
  date: string;
}

interface CategoryNewsGridProps {
  articles: NewsArticle[];
}

const getCategoryColor = (category: string): string => {
  const categoryMap: { [key: string]: string } = {
    "Agenda": "bg-category-agenda/20",
    "Politics": "bg-category-politics/20",
    "FP & Defense": "bg-category-fp-defense/20",
    "Business & Economy": "bg-category-business/20",
    "Life": "bg-category-life/20",
    "Health": "bg-category-health/20",
    "Sports": "bg-category-sports/20",
    "World": "bg-category-world/20",
    "Xtra": "bg-category-xtra/20",
  };
  return categoryMap[category] || "bg-muted/20";
};

export const CategoryNewsGrid = ({ articles }: CategoryNewsGridProps) => {
  // Group articles by category
  const categorizedArticles: { [key: string]: NewsArticle[] } = {};
  
  articles.forEach(article => {
    if (!categorizedArticles[article.category]) {
      categorizedArticles[article.category] = [];
    }
    categorizedArticles[article.category].push(article);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.entries(categorizedArticles).map(([category, categoryArticles]) => (
        <div key={category} className="space-y-4 animate-fade-up">
          <Link to={`/section/${category.toLowerCase().replace(/\s+/g, '-').replace('&', '')}`}>
            <h2 className="text-2xl font-bold tracking-tight hover:text-primary transition-colors">
              {category}
            </h2>
          </Link>
          
          <div className="space-y-4">
            {categoryArticles.slice(0, 3).map((article, index) => {
              const isLarge = index === 0;
              const categoryColor = getCategoryColor(article.category);
              
              return (
                <Link key={article.slug} to={`/article/${article.slug}`}>
                  <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${categoryColor}`}>
                    {article.imageUrl && (
                      <div className={`relative overflow-hidden ${isLarge ? 'h-[400px]' : 'h-[200px]'}`}>
                        <img
                          src={article.imageUrl}
                          alt={article.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      </div>
                    )}
                    
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <time className="text-xs text-muted-foreground">{article.date}</time>
                      </div>
                      
                      <h3 className={`font-bold mb-2 leading-tight group-hover:text-primary transition-colors ${isLarge ? 'text-xl' : 'text-base'}`}>
                        {article.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
