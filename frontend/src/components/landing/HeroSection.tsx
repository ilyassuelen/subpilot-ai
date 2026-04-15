import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { RegistrationModal } from "./RegistrationModal";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Bell, Shield, FileText, Calendar, DollarSign } from "lucide-react";

const stats = [
  { value: "12,400+", label: "Contracts Tracked", icon: FileText },
  { value: "$2.1M", label: "Savings Found", icon: TrendingUp },
  { value: "8,200+", label: "Renewals Flagged", icon: Bell },
  { value: "5,600+", label: "AI Drafts Generated", icon: Shield },
];

const mockServices = [
  { name: "Netflix", cost: "$15.99", color: "oklch(0.58 0.24 27)", date: "Mar 15" },
  { name: "Spotify", cost: "$9.99", color: "oklch(0.65 0.17 155)", date: "Mar 18" },
  { name: "Adobe CC", cost: "$54.99", color: "oklch(0.58 0.24 27)", date: "Mar 22" },
  { name: "Vodafone", cost: "$39.99", color: "oklch(0.58 0.24 27)", date: "Apr 01" },
  { name: "Gym Plus", cost: "$29.99", color: "oklch(0.62 0.17 250)", date: "Apr 05" },
];

export function HeroSection() {
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-coral/5 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Shield className="w-3.5 h-3.5" />
                AI-Powered Subscription Assistant
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight font-[var(--font-display)]">
                Your AI Co-Pilot for{" "}
                <span className="text-gradient-primary">Subscriptions</span>{" "}
                & Contracts
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
                Track recurring costs, get renewal reminders, see spending analytics,
                and generate AI-assisted cancellation emails — all from one smart dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button variant="hero" size="xl" onClick={() => setRegisterOpen(true)}>
                  Let's Start <ArrowRight className="w-5 h-5" />
                </Button>
                <Link to="/dashboard">
                  <Button variant="hero-outline" size="xl">View Dashboard</Button>
                </Link>
              </div>
            </motion.div>

            {/* Right - Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-card rounded-2xl shadow-card-hover border border-border overflow-hidden">
                {/* Topbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-warning/60" />
                    <div className="w-3 h-3 rounded-full bg-success/60" />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">SubPilot Dashboard</span>
                  <div className="w-16" />
                </div>
                <div className="p-5 space-y-4">
                  {/* KPIs */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-card-blue rounded-xl p-3 text-center">
                      <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                      <div className="text-lg font-bold font-[var(--font-display)]">$150.95</div>
                      <div className="text-[10px] text-muted-foreground">Monthly Cost</div>
                    </div>
                    <div className="bg-gradient-card-coral rounded-xl p-3 text-center">
                      <Calendar className="w-4 h-4 text-coral mx-auto mb-1" />
                      <div className="text-lg font-bold font-[var(--font-display)]">3</div>
                      <div className="text-[10px] text-muted-foreground">Upcoming</div>
                    </div>
                    <div className="bg-gradient-card-green rounded-xl p-3 text-center">
                      <Bell className="w-4 h-4 text-success mx-auto mb-1" />
                      <div className="text-lg font-bold font-[var(--font-display)]">7</div>
                      <div className="text-[10px] text-muted-foreground">Active</div>
                    </div>
                  </div>
                  {/* Services */}
                  <div className="space-y-2">
                    {mockServices.map((s) => (
                      <div key={s.name} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ background: s.color }}>
                            {s.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{s.name}</div>
                            <div className="text-[10px] text-muted-foreground">Renews {s.date}</div>
                          </div>
                        </div>
                        <span className="text-sm font-bold">{s.cost}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-card rounded-xl shadow-card p-3 border border-border"
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  <Bell className="w-4 h-4 text-coral" />
                  <span>Netflix renews in 3 days</span>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-3 -left-4 bg-card rounded-xl shadow-card p-3 border border-border"
              >
                <div className="flex items-center gap-2 text-xs font-medium">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Cancellation draft ready</span>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 bg-card rounded-xl p-4 shadow-soft border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-lg font-bold font-[var(--font-display)]">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      <RegistrationModal open={registerOpen} onOpenChange={setRegisterOpen} />
    </>
  );
}
