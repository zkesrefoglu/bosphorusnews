import { Link } from "react-router-dom";

interface NewsFeedItemProps {
  title: string;
  excerpt: string;
  section: string;
  author: string;
  date: string;
  slug: string;
}

export const NewsFeedItem = ({ title, excerpt, section, author, date, slug }: NewsFeedItemProps) => {
  return (
    <article className="py-6 border-b border-border last:border-0 animate-fade-up">
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
      
      <span className="text-sm text-muted-foreground">{author}</span>
    </article>
  );
};
