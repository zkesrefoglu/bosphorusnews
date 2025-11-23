// Centralized news data for the application

export interface NewsArticle {
  title: string;
  excerpt: string;
  section: string;
  author: string;
  date: string;
  slug: string;
  timestamp: Date;
}

export interface DailyTopicArticle {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
  timestamp: Date;
  section: string;
}

// Xtra - Agenda category
export const dailyTopic: DailyTopicArticle = {
  title: "Indictment Controversy Surrounds Istanbul Municipality Investigation",
  excerpt: "The Yeni Şafak newspaper, known for its pro-government stance, published a story titled 'Indictment' regarding the Istanbul Metropolitan Municipality investigation, breaching confidentiality. The story claimed that the indictment would be 4,000 pages long and that Istanbul Mayor Ekrem İmamoğlu was listed as the 'number one suspect.'",
  author: "SÖZCÜ",
  date: "2025/11/11 09:00 TRT",
  slug: "istanbul-municipality-investigation-indictment",
  timestamp: new Date("2025-11-11T09:00:00+03:00"),
  section: "Agenda",
};

// Latest News items from various categories
export const newsItems: NewsArticle[] = [
  {
    title: "Turkish Football Federation Refers 1,024 Players to Disciplinary Committee",
    excerpt: "The Turkish Football Federation announced that 1,024 footballers found to have placed bets have been referred to the Disciplinary Committee as part of a betting investigation into professional leagues.",
    section: "Sports",
    author: "OFFICIAL",
    date: "2025/11/11 08:00 TRT",
    slug: "turkish-football-betting-investigation",
    timestamp: new Date("2025-11-11T08:00:00+03:00"),
  },
  {
    title: "Eight Suspects Including Eyüpspor President Arrested in Betting Scandal",
    excerpt: "Eight suspects, including Eyüpspor Club President Özkaya and referees, were arrested and referred to court in connection with an investigation into allegations that referees had placed bets.",
    section: "Sports",
    author: "TRT",
    date: "2025/11/11 08:15 TRT",
    slug: "eyupspor-president-arrested-betting",
    timestamp: new Date("2025-11-11T08:15:00+03:00"),
  },
  {
    title: "Turkish Football Leagues Postponed Due to Betting Investigation",
    excerpt: "Since players who have been disciplined as a precautionary measure are unable to play in matches, the Turkish Football Federation announced that the second and third leagues have been postponed for two weeks. Urgent talks have begun with FIFA to provide teams whose players have been disciplined with a 15-day transfer window.",
    section: "Sports",
    author: "APOSTO",
    date: "2025/11/11 09:30 TRT",
    slug: "turkish-leagues-postponed-betting",
    timestamp: new Date("2025-11-11T09:30:00+03:00"),
  },
  {
    title: "FM Fidan Meets US Officials in Washington on Syria and Regional Security",
    excerpt: "FM Fidan answered questions from the press regarding his meetings in Washington. Fidan stated that he had been invited by the US to hold talks at the White House with US Secretary of State Rubio, US President Donald Trump's Special Representative for the Middle East Witkoff, US Ambassador to Ankara and Special Representative for Syria Barrack, and many other officials, adding that his visit coincided with the visit of Syrian President Ahmed Shara.",
    section: "FP & Defense",
    author: "SOURCES",
    date: "2025/11/11 10:00 TRT",
    slug: "fidan-washington-syria-talks",
    timestamp: new Date("2025-11-11T10:00:00+03:00"),
  },
  {
    title: "Turkey-US Discuss Syria Development and Regional Cooperation",
    excerpt: "FM Fidan stated that he met with many officials in the US regarding Syria, saying, 'How can the problem areas in southern Syria, northern Syria, and other places be better managed? How can work related to the Caesar Act be done? We had the opportunity to look at them in detail. We presented our views and positions.'",
    section: "FP & Defense",
    author: "TRT",
    date: "2025/11/11 10:15 TRT",
    slug: "turkey-us-syria-cooperation",
    timestamp: new Date("2025-11-11T10:15:00+03:00"),
  },
  {
    title: "President Trump Receives Syrian President Shara at White House",
    excerpt: "President Trump received Syrian Interim Government President Shara at the White House. Trump stated that President Erdoğan supports developments in Syria and has established an excellent relationship with Shara.",
    section: "FP & Defense",
    author: "AA",
    date: "2025/11/11 11:00 TRT",
    slug: "trump-shara-white-house-meeting",
    timestamp: new Date("2025-11-11T11:00:00+03:00"),
  },
  {
    title: "Israeli Defense Minister Issues Insulting Statement to Erdogan",
    excerpt: "The Israeli Defense Minister wrote to Erdogan in an insulting post in Hebrew and Turkish on his X social media account: 'Take your ridiculous arrest warrants and get out of here. These warrants are more appropriate for the massacres you have committed against the Kurds.'",
    section: "FP & Defense",
    author: "AVA",
    date: "2025/11/11 11:30 TRT",
    slug: "israeli-minister-erdogan-insult",
    timestamp: new Date("2025-11-11T11:30:00+03:00"),
  },
  {
    title: "Turkish Cyprus President to Visit Turkey",
    excerpt: "The President of the Turkish Republic of Northern Cyprus, Erhürman, will make his first overseas visit to Turkey on Thursday at the invitation of President Erdoğan.",
    section: "FP & Defense",
    author: "OFFICIAL",
    date: "2025/11/11 12:00 TRT",
    slug: "turkish-cyprus-president-turkey-visit",
    timestamp: new Date("2025-11-11T12:00:00+03:00"),
  },
  {
    title: "Netanyahu Holds Security Meeting on Turkey's Role in Syria and Gaza",
    excerpt: "Israeli PM Netanyahu reportedly held a meeting with his security and political advisors on Turkey's role in Syria and the Gaza Strip.",
    section: "FP & Defense",
    author: "DÜNYA",
    date: "2025/11/11 12:30 TRT",
    slug: "netanyahu-turkey-security-meeting",
    timestamp: new Date("2025-11-11T12:30:00+03:00"),
  },
  {
    title: "Turkey's Ministers to Visit Pakistan for Afghanistan Ceasefire Talks",
    excerpt: "Türkiye's foreign and defence ministers and intelligence chief plan to travel to Pakistan this week to discuss its stop-start talks with Afghanistan over a ceasefire in place in South Asia, President Erdogan said.",
    section: "FP & Defense",
    author: "TRTWORLD",
    date: "2025/11/11 13:00 TRT",
    slug: "turkey-pakistan-afghanistan-ceasefire",
    timestamp: new Date("2025-11-11T13:00:00+03:00"),
  },
  {
    title: "Turkish Cyprus Condemns Norway Over Arms Embargo Lift",
    excerpt: "Turkish Cyprus condemns Norway over lifting arms embargo on Greek Cypriot side.",
    section: "FP & Defense",
    author: "HÜRRİYET",
    date: "2025/11/11 13:30 TRT",
    slug: "turkish-cyprus-norway-arms-embargo",
    timestamp: new Date("2025-11-11T13:30:00+03:00"),
  },
  {
    title: "AKP Spokesman: People's Alliance Growing Stronger",
    excerpt: "'There is no rift in the People's Alliance, no discord. In fact, after each of their attacks, we see the People's Alliance growing stronger because we see very clearly what these evil networks are trying to bring upon Turkey and upon regional peace.' – AKP Spokesman Çelik",
    section: "Politics",
    author: "AKP SPOKESMAN ÇELİK",
    date: "2025/11/11 14:00 TRT",
    slug: "akp-peoples-alliance-statement",
    timestamp: new Date("2025-11-11T14:00:00+03:00"),
  },
  {
    title: "Over 15,000 Earthquakes Hit Balıkesir in Three Months",
    excerpt: "Over 15,000 earthquakes occurred in Balıkesir in three months. While an average of 25,000 earthquakes are recorded annually across Turkey, nearly 60% of this average occurred in the Sındırgı region in just three months.",
    section: "Politics",
    author: "AA",
    date: "2025/11/11 14:30 TRT",
    slug: "balikesir-earthquakes-three-months",
    timestamp: new Date("2025-11-11T14:30:00+03:00"),
  },
  {
    title: "Interest in Turkish Language Growing in Armenia",
    excerpt: "Interest in Turkish is growing in Armenia following the introduction of Turkish as an elective subject in high schools.",
    section: "Politics",
    author: "TRT",
    date: "2025/11/11 15:00 TRT",
    slug: "turkish-language-armenia-schools",
    timestamp: new Date("2025-11-11T15:00:00+03:00"),
  },
  {
    title: "Uber in Talks to Acquire Getir's Turkey Operations for $1 Billion",
    excerpt: "Uber is in talks to acquire Getir's operations in Turkey for $1 billion.",
    section: "Business & Economy",
    author: "BLOOMBERG",
    date: "2025/11/11 15:30 TRT",
    slug: "uber-getir-turkey-acquisition",
    timestamp: new Date("2025-11-11T15:30:00+03:00"),
  },
  {
    title: "Restaurants Consider Creating Own Platform to Counter High Commission Rates",
    excerpt: "The high commission rates charged by food ordering platforms have prompted restaurants to take action. Industry representatives have stated that if no solution is found, they will establish their own digital platforms. It is anticipated that if commission rates decrease, menu prices will drop by approximately 10%.",
    section: "Business & Economy",
    author: "OKSİJEN",
    date: "2025/11/11 16:00 TRT",
    slug: "restaurants-food-platform-commission",
    timestamp: new Date("2025-11-11T16:00:00+03:00"),
  },
  {
    title: "TOKİ Applications Begin, e-Government System Crashes",
    excerpt: "TOKİ applications have begun, e-Government crashed.",
    section: "Business & Economy",
    author: "OKSİJEN",
    date: "2025/11/11 16:30 TRT",
    slug: "toki-applications-egovernment-crash",
    timestamp: new Date("2025-11-11T16:30:00+03:00"),
  },
  {
    title: "TRT Plans New Fee on Computer Systems",
    excerpt: "TRT is preparing to allocate a fee from ready-made computer systems. If the regulation submitted to Parliament is approved, computer prices are expected to increase by at least 20 percent. (We already pay this tax for TV's etc.)",
    section: "Business & Economy",
    author: "SÖZCÜ",
    date: "2025/11/11 17:00 TRT",
    slug: "trt-computer-fee-regulation",
    timestamp: new Date("2025-11-11T17:00:00+03:00"),
  },
  {
    title: "Quantum Computing Breakthrough Could Revolutionize Encryption Standards",
    excerpt: "Scientists at a leading research institute have achieved a major milestone in quantum computing, developing a new algorithm that could process complex calculations 1,000 times faster than current systems. The breakthrough raises both excitement and concerns about the future of data security and encryption methods used worldwide.",
    section: "Technology",
    author: "TECH DAILY",
    date: "2025/11/11 17:30 TRT",
    slug: "quantum-computing-encryption-breakthrough",
    timestamp: new Date("2025-11-11T17:30:00+03:00"),
  },
  {
    title: "AI Language Models Now Capable of Understanding Complex Medical Diagnoses",
    excerpt: "Major technology companies have unveiled next-generation artificial intelligence systems that can analyze medical imaging and patient data with unprecedented accuracy. Early trials show the AI can detect rare diseases that human doctors might miss, potentially transforming healthcare delivery in underserved regions.",
    section: "Technology",
    author: "INNOVATION POST",
    date: "2025/11/11 18:00 TRT",
    slug: "ai-medical-diagnosis-advancement",
    timestamp: new Date("2025-11-11T18:00:00+03:00"),
  },
  {
    title: "Neural Interface Technology Enables Paralyzed Patients to Control Devices with Thoughts",
    excerpt: "A groundbreaking neural interface system has allowed patients with severe paralysis to control computers, smartphones, and robotic limbs using only their thoughts. The technology represents a massive leap forward in brain-computer interfaces and offers hope to millions living with mobility impairments.",
    section: "Technology",
    author: "SCIENCE WEEKLY",
    date: "2025/11/11 18:30 TRT",
    slug: "neural-interface-paralysis-breakthrough",
    timestamp: new Date("2025-11-11T18:30:00+03:00"),
  },
  {
    title: "Mediterranean Diet Linked to 30% Reduction in Heart Disease Risk",
    excerpt: "A comprehensive 20-year study involving over 100,000 participants has confirmed that following a Mediterranean diet rich in olive oil, fish, and fresh vegetables significantly reduces the risk of cardiovascular disease. Researchers emphasize that the lifestyle approach, rather than individual foods, drives the health benefits.",
    section: "Life",
    author: "HEALTH JOURNAL",
    date: "2025/11/11 19:00 TRT",
    slug: "mediterranean-diet-heart-health-study",
    timestamp: new Date("2025-11-11T19:00:00+03:00"),
  },
  {
    title: "Global Wellness Tourism Industry Reaches $800 Billion Milestone",
    excerpt: "The wellness tourism sector has experienced explosive growth, with travelers increasingly seeking destinations that offer mental health retreats, spa experiences, and fitness-focused vacations. Industry experts predict the trend will continue as more people prioritize self-care and work-life balance in their travel planning.",
    section: "Life",
    author: "LIFESTYLE TODAY",
    date: "2025/11/11 19:30 TRT",
    slug: "wellness-tourism-industry-growth",
    timestamp: new Date("2025-11-11T19:30:00+03:00"),
  },
  {
    title: "Scientists Discover That Regular Forest Walks Can Boost Immune Function by 50%",
    excerpt: "New research from environmental health scientists shows that spending just two hours per week in forested areas can dramatically improve immune system function. The study found that natural compounds released by trees, combined with reduced stress levels, create measurable health improvements that last for days.",
    section: "Life",
    author: "NATURE & WELLNESS",
    date: "2025/11/11 20:00 TRT",
    slug: "forest-walks-immune-function-study",
    timestamp: new Date("2025-11-11T20:00:00+03:00"),
  },
];

// Combine daily topic with news items for article lookup
export const allArticles: NewsArticle[] = [
  {
    ...dailyTopic,
    excerpt: dailyTopic.excerpt,
  },
  ...newsItems,
];

// Helper function to get article by slug
export const getArticleBySlug = (slug: string): NewsArticle | undefined => {
  return allArticles.find((article) => article.slug === slug);
};

// Helper function to get articles by section
export const getArticlesBySection = (section: string): NewsArticle[] => {
  return allArticles
    .filter((article) => article.section === section)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
