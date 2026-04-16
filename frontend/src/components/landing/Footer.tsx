import { Plane } from "lucide-react";

const links = {
  Product: ["Features", "Analytics", "AI Cancellation"],
  Legal: ["Privacy Policy", "Terms of Service", "Imprint"],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center mb-4">
                <img
                    src="/logo_subpilot.png"
                    alt="SubPilot Logo"
                    className="h-14 w-auto object-contain"
                />
            </div>

            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              An AI-assisted platform for managing subscriptions and contracts,
              tracking recurring costs, and generating structured cancellation workflows.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold font-[var(--font-display)] text-sm mb-3">
                {title}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 SubPilot. Built by Ilyas Sülen.
          </p>

          <div className="flex gap-4">
            <a
              href="https://github.com/ilyassuelen/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/ilyas-suelen/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}