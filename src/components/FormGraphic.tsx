import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, parseISO } from "date-fns";

interface MatchData {
  id: string;
  date: string;
  opponent: string | null;
  rating: number | null;
  played: boolean;
  match_result: string | null;
}

interface FormGraphicProps {
  matches: MatchData[];
  maxMatches?: number;
}

const getRatingColor = (rating: number | null): string => {
  if (rating === null) return "bg-muted";
  if (rating >= 7.5) return "bg-emerald-500";
  if (rating >= 7.0) return "bg-green-400";
  if (rating >= 6.5) return "bg-yellow-400";
  if (rating >= 6.0) return "bg-orange-400";
  return "bg-red-500";
};

const getRatingTextColor = (rating: number | null): string => {
  if (rating === null) return "text-muted-foreground";
  if (rating >= 7.0) return "text-white";
  return "text-foreground";
};

const formatMatchDate = (dateStr: string): string => {
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
};

export const FormGraphic = ({ matches, maxMatches = 5 }: FormGraphicProps) => {
  // Filter to played matches with ratings, take most recent then reverse for ascending time (oldest to newest)
  const recentMatches = matches
    .filter((m) => m.played && m.rating !== null)
    .slice(0, maxMatches)
    .reverse(); // Oldest first (left) to newest (right)

  if (recentMatches.length === 0) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">No ratings</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {recentMatches.map((match) => (
          <Tooltip key={match.id}>
            <TooltipTrigger asChild>
              <div
                className={`w-8 h-8 md:w-9 md:h-9 rounded-md flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${getRatingColor(match.rating)}`}
              >
                <span className={`text-xs font-bold ${getRatingTextColor(match.rating)}`}>
                  {match.rating?.toFixed(1) || "—"}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-card border-border">
              <div className="text-sm">
                <div className="font-semibold text-foreground">
                  vs {match.opponent || "Unknown"}
                </div>
                <div className="text-muted-foreground text-xs">
                  {formatMatchDate(match.date)}
                </div>
                <div className="text-muted-foreground text-xs">
                  {match.match_result && <span className="mr-2">{match.match_result}</span>}
                  Rating: {match.rating?.toFixed(1) || "N/R"}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};