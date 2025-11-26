import breakingNewsGif from "@/assets/breaking-news.gif";

interface BreakingNewsBadgeProps {
  className?: string;
}

export const BreakingNewsBadge = ({ className = "" }: BreakingNewsBadgeProps) => {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <img 
        src={breakingNewsGif} 
        alt="Breaking News" 
        className="w-24 h-24"
      />
      <span className="font-bold text-destructive text-xl uppercase tracking-wide">
        Breaking News
      </span>
    </div>
  );
};
