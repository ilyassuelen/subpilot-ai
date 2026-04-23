import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { RegistrationModal } from "./RegistrationModal";
import { LoginModal } from "./LoginModal";
import { useCurrentUser, logout } from "@/hooks/useAuth";

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
  const [loginOpen, setLoginOpen] = useState(false);

  const { data: user } = useCurrentUser();

  const scrollTo = (id: string) => {
    const el = document.querySelector(id);
    el?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const openLogin = () => {
    setRegisterOpen(false);
    setLoginOpen(true);
    setMobileOpen(false);
  };

  const openRegister = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 glass-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center">
            <img
              src="/logo_subpilot.png"
              alt="SubPilot Logo"
              className="h-20 cursor-pointer"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollTo(item.href)}
                className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    Dashboard
                  </Button>
                </Link>

                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={openLogin}>
                  Login
                </Button>

                <Button variant="hero" size="sm" onClick={openRegister}>
                  Let&apos;s Start
                </Button>
              </>
            )}
          </div>

          <button
            className="p-2 lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileOpen && (
          <div className="space-y-2 p-4 lg:hidden">
            <div className="mb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => scrollTo(item.href)}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Dashboard</Button>
                </Link>

                <Button className="w-full" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full" variant="outline" onClick={openLogin}>
                  Login
                </Button>

                <Button className="w-full" variant="hero" onClick={openRegister}>
                  Register
                </Button>
              </>
            )}
          </div>
        )}
      </header>

      <RegistrationModal
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSwitchToLogin={openLogin}
      />

      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToRegister={openRegister}
      />
    </>
  );
}
