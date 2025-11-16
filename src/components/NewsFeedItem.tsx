import { Link } from "react-router-dom";

interface NewsFeedItemProps {
  title: string;
  excerpt: string;
  section: string;
  author: string;
  date: string;
  slug: string;
}

const getCategoryColor = (section: string): string => {
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
  return categoryMap[section] || "bg-muted/20";
};

export const NewsFeedItem = ({ title, excerpt, section, author, date, slug }: NewsFeedItemProps) => {
  const categoryColor = getCategoryColor(section);
  
  return (
    <article className={`py-6 px-6 border-b border-border last:border-0 animate-fade-up ${categoryColor}`}>
      <div className="flex items-center space-x-3 mb-2">
        <Link
          to={`/section/${section.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
          className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
        >
          {section}
        </Link>
        <span className="text-muted-foreground">•</span>
        <time className="text-xs text-muted-foreground">{date}</time>
      </div>
      
      <Link to={`/article/${slug}`}>
        <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight hover:text-primary transition-colors">
          {title}
        </h3>
      </Link>
      
      <p className="text-muted-foreground leading-relaxed mb-2">
        {excerpt}
      </p>
    </article>
  );
};
