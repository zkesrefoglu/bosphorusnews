import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const sections = [
  "Agenda",
  "Defense",
  "Business & Economy",
  "Life",
  "Health",
  "Sports",
  "World",
  "Xtra",
];

export const Header = () => {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between py-2 sm:py-4 gap-2 sm:gap-4">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={logo} alt="Bosphorus News" className="h-12 sm:h-16 md:h-20 lg:h-24 w-auto" />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex overflow-x-auto scrollbar-hide flex-1">
            <ul className="flex space-x-8 text-sm font-medium justify-end w-full">
              {sections.map((section) => (
                <li key={section}>
                  <Link
                    to={`/section/${section.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                    className="hover-underline whitespace-nowrap text-foreground hover:text-primary transition-colors"
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
              <nav className="mt-8">
                <ul className="flex flex-col space-y-4">
                  {sections.map((section) => (
                    <li key={section}>
                      <Link
                        to={`/section/${section.toLowerCase().replace(/\s&\s/g, '-').replace(/\s/g, '-')}`}
                        className="block text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
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
