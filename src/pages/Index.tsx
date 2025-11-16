import { Header } from "@/components/Header";
import { DailyTopic } from "@/components/DailyTopic";
import { NewsFeedItem } from "@/components/NewsFeedItem";
import { Footer } from "@/components/Footer";
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
      
      <Footer />
    </div>
  );
};

export default Index;
