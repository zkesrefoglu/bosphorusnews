import { Header } from "@/components/Header";
import { DailyTopic } from "@/components/DailyTopic";
import { NewsFeedItem } from "@/components/NewsFeedItem";
import { dailyTopic, newsItems } from "@/data/newsData";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <DailyTopic {...dailyTopic} />
        
        <section>
          <h2 className="text-2xl font-bold mb-6 tracking-tight">Latest News</h2>
          <div className="space-y-0 rounded-lg overflow-hidden border border-border">
            {newsItems.map((item, index) => (
              <NewsFeedItem key={index} {...item} />
            ))}
          </div>
        </section>
      </main>
      
      <footer className="border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 Bosphorus News. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
