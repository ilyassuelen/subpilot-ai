import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  Server,
  UserCheck,
  KeyRound,
} from "lucide-react";

const features = [
  {
    icon: Eye,
    title: "AI Without Sensitive Identity Data",
    desc: "AI-generated cancellation drafts are designed to avoid exposing sensitive personal details directly to the model layer.",
  },
  {
    icon: Server,
    title: "Separated Final Composition",
    desc: "Customer-specific details can be handled separately from draft generation and composed later in the backend workflow.",
  },
  {
    icon: UserCheck,
    title: "User Review First",
    desc: "Drafts are reviewed and approved by the user before any cancellation action is taken.",
  },
  {
    icon: KeyRound,
    title: "Minimal Data Exposure",
    desc: "The workflow is designed to use only the contract and customer information required for the specific task.",
  },
  {
    icon: Lock,
    title: "Privacy-Aware Design",
    desc: "SubPilot is structured around the idea that sensitive customer data should be handled carefully and kept separate from AI-generated text where possible.",
  },
  {
    icon: Shield,
    title: "Built for Trust",
    desc: "The product emphasizes transparency, controlled workflows, and privacy-conscious system design instead of black-box automation.",
  },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
            <Shield className="w-3.5 h-3.5" />
            Security & Privacy
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
            Built with a{" "}
            <span className="text-gradient-primary">privacy-aware workflow</span>
          </h2>

          <p className="mt-4 text-muted-foreground text-lg">
            SubPilot is designed to support AI-assisted cancellation workflows
            while keeping sensitive customer data separated from the draft
            generation process.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-card-hover transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-success" />
              </div>

              <h3 className="font-bold font-[var(--font-display)] mb-2">
                {feature.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}