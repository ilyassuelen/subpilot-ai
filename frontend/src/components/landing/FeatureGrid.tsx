import { motion } from "framer-motion";
import {
  BarChart3, Bell, FileText, Globe, Shield, Zap,
  Activity, Lock, Search, BrainCircuit, Wallet, TrendingUp
} from "lucide-react";

const features = [
  {
    icon: BarChart3, title: "Subscription Tracking", size: "large",
    description: "See all your active and cancelled subscriptions in one unified dashboard with real-time cost summaries.",
    gradient: "bg-gradient-card-blue",
  },
  {
    icon: Bell, title: "Renewal Reminders", size: "small",
    description: "Get notified before renewals so you never get charged by surprise.",
    gradient: "bg-gradient-card-coral",
  },
  {
    icon: TrendingUp, title: "Spending Analytics", size: "small",
    description: "Visual breakdowns of your spending by category, trend, and time.",
    gradient: "bg-gradient-card-green",
  },
  {
    icon: FileText, title: "AI Cancellation Drafts", size: "large",
    description: "Generate professional cancellation letters with AI — privacy-safe, multilingual, and ready to send.",
    gradient: "bg-gradient-card-purple",
  },
  {
    icon: Zap, title: "Send-Ready Emails", size: "small",
    description: "Review, approve, and open pre-composed cancellation emails with one click.",
    gradient: "bg-gradient-card-yellow",
  },
  {
    icon: Activity, title: "Activity Feed", size: "small",
    description: "Track every action — new contracts, reminders, cancellations — in a rich timeline.",
    gradient: "bg-gradient-card-blue",
  },
  {
    icon: Lock, title: "Privacy-Safe AI", size: "small",
    description: "Personal data never touches the AI layer. Final letters are composed safely in the backend.",
    gradient: "bg-gradient-card-green",
  },
  {
    icon: Globe, title: "Multi-Language", size: "small",
    description: "Write cancellation letters in any language — German, English, French, Spanish and more.",
    gradient: "bg-gradient-card-coral",
  },
  {
    icon: Search, title: "Future: Email Scan", size: "small",
    description: "Coming soon: auto-detect subscriptions from your inbox with opt-in email scanning.",
    gradient: "bg-gradient-card-purple",
  },
  {
    icon: Wallet, title: "Budget Overview", size: "small",
    description: "Set monthly budgets and get alerts when your recurring costs exceed your limits.",
    gradient: "bg-gradient-card-yellow",
  },
  {
    icon: BrainCircuit, title: "Smart Insights", size: "small",
    description: "AI-generated insights like 'Streaming costs rose 18% this quarter' help you optimize.",
    gradient: "bg-gradient-card-blue",
  },
  {
    icon: Shield, title: "Contract Deadlines", size: "small",
    description: "Track minimum terms, notice periods, and cancellation deadlines for every contract.",
    gradient: "bg-gradient-card-coral",
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Powerful Features
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient-primary">manage subscriptions</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            From tracking to cancellation — SubPilot handles every step of your subscription lifecycle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`${feature.gradient} rounded-2xl p-6 border border-border/30 hover:shadow-card-hover transition-all duration-300 group ${
                feature.size === "large" ? "lg:col-span-2" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-card shadow-soft flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold font-[var(--font-display)] mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
