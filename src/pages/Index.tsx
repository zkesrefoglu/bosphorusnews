import { Header } from "@/components/Header";
import { DailyTopic } from "@/components/DailyTopic";
import { NewsFeedItem } from "@/components/NewsFeedItem";

// Sample data - will be replaced with dynamic content
const dailyTopic = {
  title: "Turkey's Strategic Position in Mediterranean Energy Dynamics",
  excerpt: "As regional powers compete for influence over newly discovered natural gas reserves, Turkey's diplomatic approach signals a shift in Eastern Mediterranean geopolitics. Our analysis examines the economic implications and potential cooperation frameworks.",
  author: "Ayşe Demir",
  date: "November 16, 2025",
  slug: "turkey-mediterranean-energy-dynamics",
};

const newsItems = [
  {
    title: "Defense Ministry Announces Modernization of Naval Fleet",
    excerpt: "The Turkish Defense Ministry unveiled plans for upgrading its naval capabilities with domestically produced vessels, expected to enhance regional maritime security operations.",
    section: "Defense",
    author: "Mehmet Yılmaz",
    date: "November 16, 2025",
    slug: "defense-naval-fleet-modernization",
  },
  {
    title: "Istanbul Stock Exchange Reaches Record High Amid Economic Reforms",
    excerpt: "Market analysts attribute the surge to recent policy adjustments and increased foreign investor confidence in Turkish equities.",
    section: "Business & Economy",
    author: "Elif Kaya",
    date: "November 16, 2025",
    slug: "istanbul-stock-exchange-record",
  },
  {
    title: "Ancient Byzantine Mosaics Discovered in Izmir Excavation",
    excerpt: "Archaeologists have uncovered remarkably preserved Byzantine-era mosaics during routine construction work, offering new insights into the region's cultural heritage.",
    section: "Life",
    author: "Can Öztürk",
    date: "November 15, 2025",
    slug: "byzantine-mosaics-izmir",
  },
  {
    title: "New Healthcare Initiative Targets Rural Communities",
    excerpt: "The Health Ministry's mobile clinic program aims to improve access to medical services in underserved areas across Anatolia.",
    section: "Health",
    author: "Dr. Zeynep Arslan",
    date: "November 15, 2025",
    slug: "healthcare-rural-initiative",
  },
  {
    title: "Turkish Basketball Federation Announces Youth Development Program",
    excerpt: "With an investment of 50 million lira, the federation plans to establish training centers in 15 cities to nurture young talent.",
    section: "Sports",
    author: "Burak Şahin",
    date: "November 15, 2025",
    slug: "basketball-youth-program",
  },
  {
    title: "EU Trade Negotiations Enter Critical Phase",
    excerpt: "Officials from both sides express cautious optimism as customs union modernization talks continue in Brussels.",
    section: "World",
    author: "Leyla Avcı",
    date: "November 14, 2025",
    slug: "eu-trade-negotiations",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <DailyTopic {...dailyTopic} />
        
        <section>
          <h2 className="text-2xl font-bold mb-6 tracking-tight">Latest News</h2>
          <div className="space-y-0">
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
