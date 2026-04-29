import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Bell, XCircle, BarChart3,
  Activity, Settings, HelpCircle, Plane, ChevronLeft, PiggyBank
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", to: "/dashboard" as const },
  { icon: FileText, label: "Contracts", to: "/dashboard/contracts" as const },
  { icon: Bell, label: "Reminders", to: "/dashboard/reminders" as const },
  { icon: XCircle, label: "Cancellations", to: "/dashboard/cancellations" as const },
  { icon: BarChart3, label: "Analytics", to: "/dashboard/analytics" as const },
  { icon: PiggyBank, label: "AI Savings", to: "/dashboard/savings" as const },
  { icon: Activity, label: "Activity", to: "/dashboard/activity" as const },
  { icon: Settings, label: "Settings", to: "/dashboard/settings" as const },
  { icon: HelpCircle, label: "Help", to: "/dashboard/settings" as const },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={`${collapsed ? "w-16" : "w-60"} border-r border-border bg-sidebar flex flex-col transition-all duration-200 shrink-0 hidden lg:flex`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <img
                src="/logo_subpilot.png"
                alt="SubPilot Logo"
                className="h-18 w-auto object-contain"
            />
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <Plane className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              } ${collapsed ? "justify-center" : ""}`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
