import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  Bell,
  Plus,
  User,
  FileText,
  BrainCircuit,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useContracts } from "@/hooks/useContracts";
import type { Contract } from "@/lib/types";
import { ContractDetailsModal } from "@/components/contracts/ContractDetailsModal";

export function DashboardTopbar() {
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [detailContract, setDetailContract] = useState<Contract | null>(null);

  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const quickAddRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const { data: contracts = [] } = useContracts();

  const filteredContracts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return [];

    return contracts
      .filter((contract) => {
        return (
          contract.title.toLowerCase().includes(query) ||
          contract.provider_name.toLowerCase().includes(query) ||
          contract.category.toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }, [contracts, search]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }

      if (quickAddRef.current && !quickAddRef.current.contains(target)) {
        setQuickAddOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(target)) {
        setSearchOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
        setQuickAddOpen(false);
        setProfileOpen(false);
        setSearchOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleGenerateCancellation = () => {
    if (detailContract) {
      setDetailContract(null);
    }
    setSearch("");
    setSearchOpen(false);
    navigate({ to: "/dashboard/cancellations" });
  };

  const handleAddReminder = () => {
    if (detailContract) {
      setDetailContract(null);
    }
    setSearch("");
    setSearchOpen(false);
    navigate({ to: "/dashboard/reminders" });
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex max-w-md flex-1 items-center gap-3">
          <div className="relative flex-1" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contracts..."
              className="h-9 rounded-xl border-0 bg-muted/50 pl-9 focus-visible:ring-1"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => {
                if (search.trim()) {
                  setSearchOpen(true);
                }
              }}
            />

            {searchOpen && search.trim() && (
              <div className="absolute left-0 right-0 top-11 z-50 rounded-2xl border border-border/50 bg-card p-2 shadow-card-hover">
                {filteredContracts.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    No matching contracts found.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredContracts.map((contract) => (
                      <button
                        key={contract.id}
                        type="button"
                        onClick={() => {
                          setDetailContract(contract);
                          setSearchOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-muted/50"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-xs font-bold text-primary-foreground">
                          {contract.provider_name[0]}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">
                            {contract.title}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {contract.provider_name} • {contract.category}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notificationsRef}>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => {
                setNotificationsOpen((prev) => !prev);
                setQuickAddOpen(false);
                setProfileOpen(false);
              }}
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-coral" />
            </Button>

            {notificationsOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border/50 bg-card p-4 shadow-card-hover">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-[var(--font-display)] text-sm font-semibold">
                    Notifications
                  </h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    3 new
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: "Netflix deadline coming up",
                      text: "Your cancellation deadline is approaching soon.",
                      time: "Today",
                    },
                    {
                      title: "Reminder missed",
                      text: "A pending reminder needs your attention.",
                      time: "Yesterday",
                    },
                    {
                      title: "Draft ready to review",
                      text: "A cancellation draft is waiting for approval.",
                      time: "2 days ago",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-xl border border-border/50 bg-muted/30 p-3"
                    >
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {item.text}
                      </div>
                      <div className="mt-2 text-[10px] text-muted-foreground">
                        {item.time}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <Link
                    to="/dashboard/activity"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    View all activity
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={quickAddRef}>
            <Button
              variant="hero"
              size="sm"
              onClick={() => {
                setQuickAddOpen((prev) => !prev);
                setNotificationsOpen(false);
                setProfileOpen(false);
              }}
            >
              <Plus className="h-4 w-4" />
              Add
            </Button>

            {quickAddOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-border/50 bg-card p-3 shadow-card-hover">
                <div className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Quick Actions
                </div>

                <div className="space-y-1">
                  <Link
                    to="/dashboard/contracts"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-muted/50"
                    onClick={() => setQuickAddOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Add Contract
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  <Link
                    to="/dashboard/cancellations"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-muted/50"
                    onClick={() => setQuickAddOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                      Generate Cancellation
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>

                  <Link
                    to="/dashboard/reminders"
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-muted/50"
                    onClick={() => setQuickAddOpen(false)}
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      Create Reminder
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="relative ml-2" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotificationsOpen(false);
                setQuickAddOpen(false);
              }}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-gradient-primary"
            >
              <User className="h-4 w-4 text-primary-foreground" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-border/50 bg-card p-3 shadow-card-hover">
                <div className="mb-3 rounded-xl bg-muted/30 p-3">
                  <div className="text-sm font-semibold">John Doe</div>
                  <div className="text-xs text-muted-foreground">
                    john@example.com
                  </div>
                </div>

                <div className="space-y-1">
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-muted/50"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-primary" />
                    Settings
                  </Link>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm hover:bg-muted/50"
                    onClick={() => {
                      setProfileOpen(false);
                      console.log("Logout clicked");
                    }}
                  >
                    <LogOut className="h-4 w-4 text-primary" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <ContractDetailsModal
        open={!!detailContract}
        onOpenChange={(open) => !open && setDetailContract(null)}
        contract={detailContract}
        onGenerateCancellation={handleGenerateCancellation}
        onAddReminder={handleAddReminder}
      />
    </>
  );
}
