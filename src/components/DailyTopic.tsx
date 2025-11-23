import { Link } from "react-router-dom";
import dailyTopicBg from "@/assets/daily-topic-diplomatic.jpg";

interface DailyTopicProps {
  title: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
  imageUrl?: string;
}

export const DailyTopic = ({ title, excerpt, author, date, slug, imageUrl }: DailyTopicProps) => {
  const backgroundImage = imageUrl || dailyTopicBg;
  
  return (
    <article className="relative mb-16 animate-fade-in overflow-hidden rounded-lg group">
      <div 
        className="absolute inset-0 bg-cover bg-center animate-[subtle-zoom_20s_ease-in-out_infinite]"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent animate-[gradient-shift_8s_ease-in-out_infinite]" />
      
      <div className="relative px-8 md:px-12 py-16 md:py-20">
        <div className="mb-4 flex items-center space-x-3 animate-[fade-in_0.6s_ease-out]">
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-primary text-primary-foreground rounded">
            Xtra
          </span>
          <time className="text-sm text-muted-foreground">{date}</time>
        </div>
        
        <Link to="/section/xtra">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight hover:text-primary transition-all duration-300 text-balance max-w-4xl animate-[fade-in_0.8s_ease-out_0.2s_both] hover:translate-x-2">
            {title}
          </h2>
        </Link>
        
        <p className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-6 max-w-3xl animate-[fade-in_1s_ease-out_0.4s_both]">
          {excerpt}
        </p>
      </div>
    </article>
  );
};
