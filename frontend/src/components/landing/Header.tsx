import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X, Plane } from "lucide-react";
import { RegistrationModal } from "./RegistrationModal";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Analytics", href: "#analytics" },
  { label: "AI Cancellation", href: "#ai-cancellation" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    el?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
                <img
                    src="/logo_subpilot.png"
                    alt="SubPilot Logo"
                    className="h-20 w-auto object-contain cursor-pointer"
                />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Open Dashboard</Button>
              </Link>
              <Button variant="hero" size="sm" onClick={() => setRegisterOpen(true)}>
                Let's Start
              </Button>
            </div>

            <button
              className="lg:hidden p-2 rounded-lg hover:bg-accent cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full">Open Dashboard</Button>
                </Link>
                <Button variant="hero" className="w-full" onClick={() => { setRegisterOpen(true); setMobileOpen(false); }}>
                  Let's Start
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>
      <RegistrationModal open={registerOpen} onOpenChange={setRegisterOpen} />
    </>
  );
}
