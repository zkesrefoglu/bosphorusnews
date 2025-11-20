import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const sections = [
  "Agenda",
  "Politics",
  "FP & Defense",
  "Business & Economy",
  "Technology",
  "Life",
  "Editorial",
];

export const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    
    setIsAdmin(!!data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between py-2 sm:py-4 gap-2 sm:gap-4">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={logo} alt="Bosphorus News" className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto" />
          </Link>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-2 ml-auto mr-4">
            {user ? (
              <>
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin")}
                  >
                    Admin
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            )}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex overflow-x-auto scrollbar-hide">
            <ul className="flex space-x-8 text-sm font-medium">
              {sections.map((section) => (
                <li key={section}>
                  <Link
                    to={`/section/${section.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                    className="hover-underline whitespace-nowrap text-foreground hover:text-accent transition-colors"
                  >
                    {section}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile/Tablet Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              
              {/* Mobile Auth Buttons */}
              <div className="mt-4 space-y-2">
                {user ? (
                  <>
                    {isAdmin && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate("/admin")}
                      >
                        Admin
                      </Button>
                    )}
                    <Button variant="outline" className="w-full" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                    Sign In
                  </Button>
                )}
              </div>

              <nav className="mt-8">
                <ul className="flex flex-col space-y-2">
                  {sections.map((section) => (
                    <li key={section}>
                      <Link
                        to={`/section/${section.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                        className="block text-lg font-medium text-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors py-3 px-4 rounded-md"
                      >
                        {section}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
