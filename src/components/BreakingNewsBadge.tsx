import breakingNewsGif from "@/assets/breaking-news.gif";

interface BreakingNewsBadgeProps {
  className?: string;
}

export const BreakingNewsBadge = ({ className = "" }: BreakingNewsBadgeProps) => {
  return (
    <img 
      src={breakingNewsGif} 
      alt="Breaking News" 
      className={className}
    />
  );
};
