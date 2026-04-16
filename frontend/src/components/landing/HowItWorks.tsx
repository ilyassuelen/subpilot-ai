import { motion } from "framer-motion";
import { Plus, Bell, BrainCircuit, Send } from "lucide-react";

const steps = [
  {
    icon: Plus,
    title: "Add Your Contracts",
    description:
      "Manually add subscriptions and contracts to build a structured overview of your recurring services and commitments.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Bell,
    title: "Track Costs & Deadlines",
    description:
      "Monitor recurring costs, renewal dates, notice periods, and cancellation deadlines in one dashboard.",
    color: "bg-coral/10 text-coral",
  },
  {
    icon: BrainCircuit,
    title: "Generate AI Drafts",
    description:
      "Create professional cancellation drafts with AI support while sensitive personal data stays safely handled outside the AI layer.",
    color: "bg-success/10 text-success",
  },
  {
    icon: Send,
    title: "Review & Take Action",
    description:
      "Approve the draft, open a send-ready email, and complete the cancellation workflow with less manual effort.",
    color: "bg-warning/10 text-warning",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
            How <span className="text-gradient-primary">SubPilot</span> Works
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A simple workflow for tracking contracts, staying ahead of deadlines,
            and handling cancellations more efficiently.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center group hover:shadow-card-hover transition-all"
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm">
                {i + 1}
              </div>

              <div
                className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-4`}
              >
                <step.icon className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold font-[var(--font-display)] mb-2">
                {step.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}