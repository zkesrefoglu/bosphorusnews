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
      <div className="container mx-auto px-4">
        <nav className="overflow-x-auto scrollbar-hide">
          <ul className="flex space-x-8 py-3 text-sm font-medium">
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
        
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="Bosphorus News" className="h-24 w-auto" />
          </Link>
        </div>
      </div>
    </header>
  );
};
