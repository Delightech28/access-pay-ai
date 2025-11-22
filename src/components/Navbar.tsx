import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Zap, Home, Grid3x3, User, Info, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Services", path: "/services", icon: Grid3x3 },
    { name: "Leaderboard", path: "/leaderboard", icon: Trophy },
    { name: "Profile", path: "/profile", icon: User },
    { name: "About", path: "/about", icon: Info },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/40 transition-all duration-300" />
              <div className="relative bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold text-gradient">
              NeuraPay
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300",
                    isActive(item.path)
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive(item.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl glow-primary" />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-6 space-y-3 animate-in slide-in-from-top border-t border-border/50 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 px-5 py-3.5 rounded-xl font-medium transition-all",
                    isActive(item.path)
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive(item.path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-xl" />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
