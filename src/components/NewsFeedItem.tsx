import { Link } from "react-router-dom";

interface NewsFeedItemProps {
  title: string;
  excerpt: string;
  content: string;
  section: string;
  author: string;
  date: string;
  slug: string;
}

const getCategoryColor = (section: string): string => {
  const categoryMap: { [key: string]: string } = {
    "Agenda": "bg-category-agenda/20",
    "Turkiye": "bg-category-turkiye/20",
    "Economy": "bg-category-business/20",
    "Business & Economy": "bg-category-business/20",
    "Defense": "bg-category-fp-defense/20",
    "FP & Defense": "bg-category-fp-defense/20",
    "Life": "bg-category-life/20",
    "Sports": "bg-category-sports/20",
    "World": "bg-category-world/20",
    "Xtra": "bg-category-xtra/20",
    "Editorial": "bg-category-xtra/20",
  };
  return categoryMap[section] || "bg-muted/20";
};

export const NewsFeedItem = ({ title, excerpt, content, section, author, date, slug }: NewsFeedItemProps) => {
  const categoryColor = getCategoryColor(section);
  
  return (
    <Link to={`/article/${slug}`}>
      <article className={`py-6 px-6 border-b border-border last:border-0 animate-fade-up hover:opacity-80 transition-opacity cursor-pointer ${categoryColor}`}>
        <div className="flex items-center space-x-3 mb-2">
          <time className="text-xs text-muted-foreground">{date}</time>
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed mb-2">
          {excerpt}
        </p>
        
        <div className="text-foreground leading-relaxed whitespace-pre-wrap mt-4">
          {content}
        </div>
      </article>
    </Link>
  );
};
