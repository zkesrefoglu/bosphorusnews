import { Link } from "react-router-dom";
import { stripCategoryPlaceholders, sanitizeArticleContent } from "@/lib/contentUtils";
import { Share2, Twitter, Cloud, Link2, Check, Facebook, Coffee } from "lucide-react";
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
import { BreakingNewsBadge } from "@/components/BreakingNewsBadge";

interface NewsFeedItemProps {
  title: string;
  excerpt: string;
  content: string;
  section: string;
  author: string;
  date: string;
  slug: string;
  breakingNews?: boolean;
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

export const NewsFeedItem = ({ title, excerpt, content, section, author, date, slug, breakingNews }: NewsFeedItemProps) => {
  const categoryColor = getCategoryColor(section);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  
  const articleUrl = `${window.location.origin}/article/${slug}`;
  
  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, [slug]);
  
  const handleShare = async (platform: 'twitter' | 'bluesky' | 'facebook' | 'copy', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Track share analytics
    await supabase.from('share_analytics').insert({
      article_slug: slug,
      platform,
      user_id: user?.id,
    });
    
    const getBlueskyText = () => {
      const baseText = `${title} | Bosphorus News Network`;
      const urlPart = `\n\n${articleUrl}`;
      const maxLength = 300;

      let middle = excerpt ? `\n\n${excerpt}` : '';
      let fullText = baseText + middle + urlPart;

      if (fullText.length <= maxLength) return fullText;

      if (!excerpt) {
        const allowedBaseLength = maxLength - urlPart.length - 3; // 3 for '...'
        const truncatedBase = allowedBaseLength > 0
          ? baseText.slice(0, allowedBaseLength) + '...'
          : baseText;
        return truncatedBase + urlPart;
      }

      const fixedLength = baseText.length + urlPart.length + 5; // 5 for "\n\n" and "..."
      const allowedExcerptLength = maxLength - fixedLength;

      if (allowedExcerptLength <= 0) {
        return baseText + urlPart;
      }

      const truncatedExcerpt = excerpt.slice(0, allowedExcerptLength) + '...';
      middle = `\n\n${truncatedExcerpt}`;
      return baseText + middle + urlPart;
    };
    
    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} | Bosphorus News Network`)}&url=${encodeURIComponent(articleUrl)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'bluesky': {
        const text = getBlueskyText();
        window.open(
          `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      }
      case 'facebook': {
        const facebookText = `${title}\n\n${excerpt}`;
        window.open(
          `https://www.facebook.com/share.php?u=${encodeURIComponent(articleUrl)}&quote=${encodeURIComponent(facebookText)}`,
          '_blank',
          'width=550,height=680'
        );
        break;
      }
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
        
        {breakingNews && (
          <div className="mb-3">
            <BreakingNewsBadge />
          </div>
        )}
        
        <h3 className="text-xl md:text-2xl font-bold mb-2 leading-tight">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed mb-2">
          {excerpt}
        </p>
        
        <div 
          className="rich-text-content text-foreground leading-relaxed mt-4"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(content) }}
        />
      </Link>
      
      {/* Action Buttons */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        {/* TEMPORARILY HIDDEN - Uncomment when payment account is finalized
        <Link to="/coffee" onClick={(e) => e.stopPropagation()}>
          <Button 
            variant="outline" 
            size="sm"
            className={`transition-opacity ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(e) => e.preventDefault()}
          >
            <Coffee className="w-4 h-4" />
          </Button>
        </Link>
        */}
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
            <DropdownMenuItem onClick={(e) => handleShare('facebook', e)}>
              <Facebook className="w-4 h-4 mr-2" />
              Share on Facebook
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => handleShare('copy', e)}>
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy Link"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
};
