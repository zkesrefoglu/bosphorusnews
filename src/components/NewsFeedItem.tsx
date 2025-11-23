import { Link } from "react-router-dom";
import { stripCategoryPlaceholders, sanitizeArticleContent } from "@/lib/contentUtils";
import { Share2, Twitter, Cloud, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface NewsFeedItemProps {
  title: string;
  excerpt: string;
  content: string;
  section: string;
  author: string;
  date: string;
  slug: string;
}

const getCategoryColor = (section: string): string => {
  const categoryMap: { [key: string]: string } = {
    "Agenda": "bg-category-agenda/20",
    "Türkiye": "bg-category-turkiye/20",
    "Economy": "bg-category-business/20",
    "Business & Economy": "bg-category-business/20",
    "Defense": "bg-category-fp-defense/20",
    "FP & Defense": "bg-category-fp-defense/20",
    "Life": "bg-category-life/20",
    "Sports": "bg-category-sports/20",
    "World": "bg-category-world/20",
    "Xtra": "bg-category-xtra/20",
    "Editorial": "bg-category-xtra/20",
  };
  return categoryMap[section] || "bg-muted/20";
};

const REACTIONS = [
  { emoji: '😊', icon: '/emojis/smiling.svg', name: 'smiling' },
  { emoji: '🤣', icon: '/emojis/laughing.svg', name: 'laughing' },
  { emoji: '😢', icon: '/emojis/crying.svg', name: 'crying' },
  { emoji: '😒', icon: '/emojis/unamused.svg', name: 'unamused' },
  { emoji: '😡', icon: '/emojis/angry.svg', name: 'angry' },
  { emoji: '👍', icon: '/emojis/thumbs-up.svg', name: 'thumbs-up' },
  { emoji: '🙌', icon: '/emojis/celebrating.svg', name: 'celebrating' },
  { emoji: '👎', icon: '/emojis/thumbs-down.svg', name: 'thumbs-down' },
];

export const NewsFeedItem = ({ title, excerpt, content, section, author, date, slug }: NewsFeedItemProps) => {
  const categoryColor = getCategoryColor(section);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  
  const articleUrl = `${window.location.origin}/article/${slug}`;
  
  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    
    // Fetch reactions
    fetchReactions();
  }, [slug]);
  
  const fetchReactions = async () => {
    const { data } = await supabase
      .from('article_reactions')
      .select('reaction, user_id')
      .eq('article_slug', slug);
    
    if (data) {
      // Count reactions
      const counts: Record<string, number> = {};
      data.forEach(r => {
        counts[r.reaction] = (counts[r.reaction] || 0) + 1;
        if (user && r.user_id === user.id) {
          setUserReaction(r.reaction);
        }
      });
      setReactionCounts(counts);
    }
  };
  
  const handleReaction = async (reaction: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to react to articles",
        variant: "destructive",
      });
      return;
    }
    
    // If clicking same reaction, remove it
    if (userReaction === reaction) {
      await supabase
        .from('article_reactions')
        .delete()
        .eq('article_slug', slug)
        .eq('user_id', user.id);
      
      setUserReaction(null);
    } else {
      // Insert or update reaction
      await supabase
        .from('article_reactions')
        .upsert({
          article_slug: slug,
          user_id: user.id,
          reaction,
        });
      
      setUserReaction(reaction);
    }
    
    fetchReactions();
  };
  
  const handleShare = async (platform: 'twitter' | 'bluesky' | 'copy', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Track share analytics
    await supabase.from('share_analytics').insert({
      article_slug: slug,
      platform,
      user_id: user?.id,
    });
    
    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(articleUrl)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'bluesky':
        window.open(
          `https://bsky.app/intent/compose?text=${encodeURIComponent(`${title}\n\n${articleUrl}`)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'copy':
        navigator.clipboard.writeText(articleUrl).then(() => {
          setCopied(true);
          toast({
            title: "Link copied!",
            description: "Article link copied to clipboard",
          });
          setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
          toast({
            title: "Failed to copy",
            description: "Could not copy link to clipboard",
            variant: "destructive",
          });
        });
        break;
    }
  };
  
  return (
    <article className={`py-6 px-6 border-b border-border last:border-0 animate-fade-up ${categoryColor} relative group`}>
      <Link to={`/article/${slug}`} className="block hover:opacity-80 transition-opacity">
        <div className="flex items-center space-x-3 mb-2">
          <time className="text-xs text-muted-foreground">{date}</time>
        </div>
        
        <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed mb-2">
          {excerpt}
        </p>
        
        <div className="text-foreground leading-relaxed whitespace-pre-wrap mt-4">
          {sanitizeArticleContent(content)}
        </div>
      </Link>
      
      {/* Share Button */}
      <div className="absolute top-6 right-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button 
              variant="outline" 
              size="sm"
              className={`transition-opacity ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
              onClick={(e) => e.preventDefault()}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={(e) => handleShare('twitter', e)}>
              <Twitter className="w-4 h-4 mr-2" />
              Share on X
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleShare('bluesky', e)}>
              <Cloud className="w-4 h-4 mr-2" />
              Share on Bluesky
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleShare('copy', e)}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Reactions */}
      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2" onClick={(e) => e.preventDefault()}>
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.name}
            onClick={(e) => {
              e.preventDefault();
              handleReaction(reaction.emoji);
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-md ${
              userReaction === reaction.emoji
                ? 'bg-primary/15 border-primary shadow-sm scale-105'
                : 'bg-background/50 border-border/50 hover:border-primary/40 hover:bg-background'
            }`}
          >
            <img src={reaction.icon} alt={reaction.name} className="w-6 h-6" />
            {reactionCounts[reaction.emoji] > 0 && (
              <span className="text-xs font-semibold text-foreground/70">
                {reactionCounts[reaction.emoji]}
              </span>
            )}
          </button>
        ))}
      </div>
    </article>
  );
};
