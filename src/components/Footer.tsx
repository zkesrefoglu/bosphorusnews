import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logoImage from "@/assets/logo.png";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const sections = [
    { name: "Agenda", path: "/section/agenda" },
    { name: "Politics", path: "/section/politics" },
    { name: "FP & Defense", path: "/section/fp-defense" },
    { name: "Business", path: "/section/business" },
    { name: "Life", path: "/section/life" },
    { name: "Health", path: "/section/health" },
    { name: "Sports", path: "/section/sports" },
    { name: "World", path: "/section/world" },
    { name: "Xtra", path: "/section/xtra" },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("newsletter_subscriptions")
        .insert([{ email }]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already subscribed",
            description: "This email is already subscribed to our newsletter",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success!",
          description: "You've been subscribed to our newsletter",
        });
        setEmail("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="border-t border-border mt-16 bg-muted/30">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and About */}
          <div className="md:col-span-1">
            <img src={logoImage} alt="Bosphorus News" className="h-8 mb-4" />
            <p className="text-sm text-muted-foreground">
              Your trusted source for news and analysis from Turkey and beyond.
            </p>
          </div>

          {/* Sections */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">Sections</h3>
            <ul className="space-y-2">
              {sections.slice(0, 5).map((section) => (
                <li key={section.path}>
                  <Link
                    to={section.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {section.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm opacity-0">More</h3>
            <ul className="space-y-2">
              {sections.slice(5).map((section) => (
                <li key={section.path}>
                  <Link
                    to={section.path}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {section.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4 text-sm">Newsletter</h3>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <Input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm"
              />
              <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>

        {/* Social & Contact */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border gap-4">
          <div className="flex gap-6">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Twitter
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              TikTok
            </a>
          </div>

          <div className="text-sm text-muted-foreground">
            Contact: info@bosphorusnews.com
          </div>

          <div className="text-sm text-muted-foreground">
            © 2025 Bosphorus News. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
