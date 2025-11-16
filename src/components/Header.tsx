import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

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
          
          <nav className="overflow-x-auto scrollbar-hide flex-1">
            <ul className="flex space-x-3 sm:space-x-4 md:space-x-6 lg:space-x-8 text-xs sm:text-sm font-medium justify-end">
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
        </div>
      </div>
    </header>
  );
};
