import { Link } from "react-router-dom";

interface DailyTopicProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
}

export const DailyTopic = ({ title, excerpt, author, date, slug }: DailyTopicProps) => {
  return (
    <article className="border-b border-border pb-12 mb-12 animate-fade-in">
      <div className="mb-3 flex items-center space-x-3">
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-primary text-primary-foreground rounded">
          Daily Topic
        </span>
        <time className="text-sm text-muted-foreground">{date}</time>
      </div>
      
      <Link to={`/article/${slug}`}>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight hover:text-primary transition-colors text-balance">
          {title}
        </h2>
      </Link>
      
      <p className="text-lg text-muted-foreground leading-relaxed mb-4 max-w-3xl">
        {excerpt}
      </p>
      
      <div className="flex items-center text-sm">
        <span className="font-medium text-foreground">{author}</span>
      </div>
    </article>
  );
};
