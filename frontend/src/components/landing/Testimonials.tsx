import { motion } from "framer-motion";
import { User, Briefcase, Users, Wallet } from "lucide-react";

const useCases = [
  {
    icon: User,
    title: "Individuals",
    text: "Keep track of personal subscriptions, recurring services, and cancellation deadlines in one clear dashboard.",
  },
  {
    icon: Briefcase,
    title: "Freelancers",
    text: "Manage software tools, platforms, and service contracts while staying on top of recurring business costs.",
  },
  {
    icon: Users,
    title: "Families",
    text: "Monitor shared subscriptions and household contracts more clearly to avoid forgotten renewals and duplicate services.",
  },
  {
    icon: Wallet,
    title: "Cost-Conscious Users",
    text: "Understand recurring spending, identify expensive categories, and make better decisions before contracts renew.",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
            Who <span className="text-gradient-primary">SubPilot</span> is for
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            From personal subscriptions to recurring business services, SubPilot
            is designed for users who want more clarity, better timing, and less
            manual effort in contract management.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
            >
              <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-primary" />
              </div>

              <h3 className="text-lg font-bold font-[var(--font-display)] mb-2">
                {item.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}