import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import logo from "@/assets/logo.png";
import xtraLogo from "@/assets/xtra-logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LiveTicker } from "@/components/LiveTicker";

const sections = [
  { name: "Home", slug: "", isLogo: false },
  { name: "Agenda", slug: "agenda", isLogo: false },
  { name: "Economy", slug: "economy", isLogo: false },
  { name: "Defense", slug: "defense", isLogo: false },
  { name: "Life", slug: "life", isLogo: false },
  { name: "Türkiye", slug: "turkiye", isLogo: false },
  { name: "World", slug: "world", isLogo: false },
  { name: "Sports", slug: "sports", isLogo: false },
  { name: "Xtra", slug: "xtra", isLogo: true },
];

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        {/* Live Ticker Row */}
        <div className="hidden lg:flex justify-end py-2 border-b border-border/50">
          <LiveTicker />
        </div>

        <div className="flex items-center justify-between py-2 sm:py-4 gap-2 sm:gap-4">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={logo} alt="Bosphorus News" className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex ml-auto overflow-x-auto scrollbar-hide">
            <ul className="flex space-x-8 text-sm font-medium items-center">
              {sections.map((section) => (
                <li key={section.slug}>
                  <Link
                    to={section.slug === "" ? "/" : `/section/${section.slug}`}
                    className="hover-underline whitespace-nowrap text-foreground hover:text-accent transition-colors inline-block"
                  >
                    {section.isLogo ? <img src={xtraLogo} alt="Xtra" className="h-16 w-auto" /> : section.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile/Tablet Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
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

              <nav className="mt-8">
                <ul className="flex flex-col space-y-2">
                  {sections.map((section) => (
                    <li key={section.slug}>
                      <Link
                        to={section.slug === "" ? "/" : `/section/${section.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 text-lg font-medium hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors py-3 px-4 rounded-md ${
                          section.slug === "xtra"
                            ? "bg-xtra-light hover:bg-xtra-light/90 text-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {section.isLogo ? (
                          <>
                            <img src={xtraLogo} alt="Xtra" className="h-10 w-auto" />
                            <span className="font-bold">Xtra</span>
                          </>
                        ) : (
                          section.name
                        )}
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
