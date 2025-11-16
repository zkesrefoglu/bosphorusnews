import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { NewsFeedItem } from "@/components/NewsFeedItem";
import { getArticlesBySection } from "@/data/newsData";
import { ArrowLeft } from "lucide-react";

const Section = () => {
  const { section } = useParams<{ section: string }>();
  
  // Convert URL slug back to proper section name
  const getSectionName = (slug: string): string => {
    const sectionMap: { [key: string]: string } = {
      "agenda": "Agenda",
      "politics": "Politics",
      "fp-defense": "FP & Defense",
      "business-economy": "Business & Economy",
      "life": "Life",
      "health": "Health",
      "sports": "Sports",
      "world": "World",
      "xtra": "Xtra",
    };
    return sectionMap[slug] || slug;
  };

  const sectionName = section ? getSectionName(section) : "";
  const articles = sectionName ? getArticlesBySection(sectionName) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{sectionName}</h1>
          <p className="text-muted-foreground">
            {articles.length} {articles.length === 1 ? 'article' : 'articles'} in this section
          </p>
        </div>

        {articles.length > 0 ? (
          <section>
            <div className="space-y-0 rounded-lg overflow-hidden border border-border">
              {articles.map((item, index) => (
                <NewsFeedItem key={index} {...item} />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No articles found in this section yet.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Bosphorus News. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Section;
