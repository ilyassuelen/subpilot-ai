import { motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  FileText,
  Globe,
  Shield,
  Zap,
  Activity,
  Lock,
  Search,
  BrainCircuit,
  Wallet,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Subscription Tracking",
    size: "large",
    description:
      "Manage subscriptions and contracts in one unified dashboard with a clear overview of active items, recurring costs, and status changes.",
    gradient: "bg-gradient-card-blue",
  },
  {
    icon: Bell,
    title: "Renewal Reminders",
    size: "small",
    description:
      "Stay ahead of renewals, notice periods, and cancellation deadlines before charges happen unexpectedly.",
    gradient: "bg-gradient-card-coral",
  },
  {
    icon: TrendingUp,
    title: "Spending Analytics",
    size: "small",
    description:
      "Understand recurring costs through category breakdowns, spending trends, and contract-based cost visibility.",
    gradient: "bg-gradient-card-green",
  },
  {
    icon: FileText,
    title: "AI Cancellation Drafts",
    size: "large",
    description:
      "Generate ready-to-send cancellation drafts with AI support while keeping sensitive personal data outside the AI layer.",
    gradient: "bg-gradient-card-purple",
  },
  {
    icon: Zap,
    title: "Send-Ready Emails",
    size: "small",
    description:
      "Review approved cancellation drafts and open pre-composed emails instantly for faster follow-through.",
    gradient: "bg-gradient-card-yellow",
  },
  {
    icon: Activity,
    title: "Activity Feed",
    size: "small",
    description:
      "Follow contract changes, reminders, and cancellation actions in one structured timeline.",
    gradient: "bg-gradient-card-blue",
  },
  {
    icon: Lock,
    title: "Privacy-Safe AI",
    size: "small",
    description:
      "AI is used selectively, while final letter composition and sensitive customer data handling remain safely managed in the backend.",
    gradient: "bg-gradient-card-green",
  },
  {
    icon: Shield,
    title: "Contract Deadlines",
    size: "small",
    description:
      "Track contract end dates, notice periods, and cancellation deadlines in a way that supports real decision-making.",
    gradient: "bg-gradient-card-coral",
  },
  {
    icon: BrainCircuit,
    title: "Planned: Smart Insights",
    size: "small",
    description:
      "Upcoming AI-powered insights will highlight recurring cost patterns, category shifts, and potential savings opportunities.",
    gradient: "bg-gradient-card-blue",
  },
  {
    icon: Search,
    title: "Planned: Email Scan",
    size: "small",
    description:
      "Future inbox integrations may help detect subscriptions and recurring services from emails with explicit user opt-in.",
    gradient: "bg-gradient-card-purple",
  },
  {
    icon: Wallet,
    title: "Planned: Budget Overview",
    size: "small",
    description:
      "A future budgeting layer will help users compare recurring costs against monthly spending limits.",
    gradient: "bg-gradient-card-yellow",
  },
  {
    icon: Globe,
    title: "Planned: Multi-Language Support",
    size: "small",
    description:
      "The product roadmap includes broader multi-language support for cancellation generation and international contract handling.",
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
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Core Features
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
            Everything you need to{" "}
            <span className="text-gradient-primary">stay in control</span>
          </h2>

          <p className="mt-4 text-muted-foreground text-lg">
            Track contracts, monitor recurring costs, stay ahead of deadlines,
            and generate cancellation drafts — with additional AI capabilities
            planned as the platform evolves.
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

              <h3 className="text-lg font-bold font-[var(--font-display)] mb-2">
                {feature.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
