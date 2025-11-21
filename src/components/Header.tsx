import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import logo from "@/assets/logo.png";
import xtraLogo from "@/assets/xtra-logo.png";
import bannerImage from "@/assets/banner-diplomatic.jpg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const sections = [
  { name: "Agenda", slug: "agenda", isLogo: false },
  { name: "Economy", slug: "economy", isLogo: false },
  { name: "Defense", slug: "defense", isLogo: false },
  { name: "Life", slug: "life", isLogo: false },
  { name: "Turkiye", slug: "turkiye", isLogo: false },
  { name: "World", slug: "world", isLogo: false },
  { name: "Sports", slug: "sports", isLogo: false },
  { name: "Xtra", slug: "xtra", isLogo: true },
];

export const Header = () => {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between py-2 sm:py-4 gap-2 sm:gap-4">
          <Link to="/" className="flex items-center gap-4 flex-shrink-0">
            <img src={logo} alt="Bosphorus News" className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto" />
            <div className="hidden xl:block relative h-20 w-32 overflow-hidden rounded-lg group">
              <img 
                src={bannerImage} 
                alt="Diplomatic Banner" 
                className="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                style={{
                  filter: 'contrast(1.2) saturate(0.9) brightness(0.95)',
                  mixBlendMode: 'multiply'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 mix-blend-overlay" />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex ml-auto overflow-x-auto scrollbar-hide">
            <ul className="flex space-x-8 text-sm font-medium items-center">
              {sections.map((section) => (
                <li key={section.slug}>
                  <Link
                    to={`/section/${section.slug}`}
                    className="hover-underline whitespace-nowrap text-foreground hover:text-accent transition-colors inline-block"
                  >
                    {section.isLogo ? <img src={xtraLogo} alt="Xtra" className="h-16 w-auto" /> : section.name}
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

              <nav className="mt-8">
                <ul className="flex flex-col space-y-2">
                  {sections.map((section) => (
                    <li key={section.slug}>
                      <Link
                        to={`/section/${section.slug}`}
                        className="flex items-center text-lg font-medium text-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 transition-colors py-3 px-4 rounded-md"
                      >
                        {section.isLogo ? <img src={xtraLogo} alt="Xtra" className="h-6 w-auto" /> : section.name}
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
