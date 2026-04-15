import { motion } from "framer-motion";
import { Shield, Lock, Eye, Server, UserCheck, KeyRound } from "lucide-react";

const features = [
  { icon: Lock, title: "Encrypted Storage", desc: "All contract and personal data is encrypted at rest and in transit." },
  { icon: Eye, title: "AI Without Identity", desc: "The AI generates neutral text without accessing your personal details." },
  { icon: Server, title: "Backend Composition", desc: "Personal data is injected only in the final letter, never sent to AI models." },
  { icon: UserCheck, title: "User Control", desc: "Nothing is sent without your explicit review and approval." },
  { icon: KeyRound, title: "Minimal Data Access", desc: "SubPilot only stores what's needed — no excessive data collection." },
  { icon: Shield, title: "Privacy-First Architecture", desc: "Built from the ground up with privacy as a core design principle." },
];

export function SecuritySection() {
  return (
    <section id="security" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
            <Shield className="w-3.5 h-3.5" />
            Security & Privacy
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
            Your data stays{" "}
            <span className="text-gradient-primary">yours</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            SubPilot's privacy-first architecture ensures your personal data is never exposed to AI models.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-card-hover transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-bold font-[var(--font-display)] mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
