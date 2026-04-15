import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Freelance Designer",
    text: "SubPilot saved me over €300 in forgotten subscriptions I didn't even know I was still paying for.",
    stars: 5,
  },
  {
    name: "Thomas K.",
    role: "IT Manager",
    text: "The AI cancellation feature is brilliant. I cancelled 4 contracts in under 10 minutes — with professional German letters.",
    stars: 5,
  },
  {
    name: "Lisa R.",
    role: "Student",
    text: "Finally an app that shows me exactly where my money goes every month. The analytics are beautiful and actually useful.",
    stars: 5,
  },
  {
    name: "Marco D.",
    role: "Small Business Owner",
    text: "I manage contracts for my whole team with SubPilot. The reminders alone have prevented several accidental renewals.",
    stars: 4,
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
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
            Trusted by{" "}
            <span className="text-gradient-primary">thousands</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Professionals, families, freelancers, and students use SubPilot to stay in control.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star key={si} className={`w-4 h-4 ${si < t.stars ? "text-warning fill-warning" : "text-muted"}`} />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
