import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { getArticleBySlug } from "@/data/newsData";
import { ArrowLeft } from "lucide-react";

const Article = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-16">
            <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist.</p>
            <Link to="/" className="text-primary hover:underline">
              Return to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <article className="animate-fade-in">
          <div className="mb-6">
            <Link
              to={`/section/${article.section.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
              className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-primary text-primary-foreground rounded hover:opacity-80 transition-opacity"
            >
              {article.section}
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
            {article.title}
          </h1>

          <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-border">
            <time className="text-sm text-muted-foreground">{article.date}</time>
            <span className="text-muted-foreground">•</span>
            <span className="text-sm font-medium text-foreground">{article.author}</span>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl leading-relaxed text-foreground mb-8">
              {article.excerpt}
            </p>
          </div>
        </article>
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Bosphorus News. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Article;
