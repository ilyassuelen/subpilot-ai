import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  PieChart,
} from "lucide-react";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const values = [120, 145, 132, 168, 155, 151];
const maxVal = Math.max(...values);

const categories = [
  { name: "Streaming", amount: "$45.97", pct: 30, color: "bg-primary" },
  { name: "Telecom", amount: "$39.99", pct: 26, color: "bg-coral" },
  { name: "Software", amount: "$54.99", pct: 36, color: "bg-chart-4" },
  { name: "Fitness", amount: "$10.00", pct: 8, color: "bg-success" },
];

const kpis = [
  {
    icon: DollarSign,
    label: "Recurring Total",
    value: "$150.95",
    gradient: "bg-gradient-card-blue",
  },
  {
    icon: Calendar,
    label: "Next Deadline",
    value: "In 3 days",
    gradient: "bg-gradient-card-coral",
  },
  {
    icon: TrendingUp,
    label: "Trend Overview",
    value: "+8.2%",
    gradient: "bg-gradient-card-green",
  },
  {
    icon: AlertTriangle,
    label: "Needs Attention",
    value: "2 contracts",
    gradient: "bg-gradient-card-yellow",
  },
];

export function AnalyticsShowcase() {
  return (
    <section id="analytics" className="py-20 lg:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics Overview
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
            Clear visibility into your{" "}
            <span className="text-gradient-primary">recurring costs</span>
          </h2>

          <p className="mt-4 text-muted-foreground text-lg">
            Understand spending patterns, upcoming deadlines, and category
            breakdowns through a clean analytics experience designed for contract
            management.
          </p>
        </motion.div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`${kpi.gradient} rounded-2xl p-5 border border-border/30`}
            >
              <kpi.icon className="w-5 h-5 text-muted-foreground mb-2" />
              <div className="text-2xl font-bold font-[var(--font-display)]">
                {kpi.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {kpi.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Spending chart */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  className="lg:col-span-2 bg-card rounded-2xl shadow-card border border-border/50 p-6"
>
  <div className="flex items-center justify-between mb-6">
    <h3 className="font-bold font-[var(--font-display)]">
      Recurring Cost Trend
    </h3>
    <div className="flex gap-1 text-xs">
      {["6M", "1Y", "All"].map((t) => (
        <button
          key={t}
          className={`px-2.5 py-1 rounded-lg cursor-pointer ${
            t === "6M"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  </div>

  <div className="relative h-52">
    {/* Grid lines */}
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
      <div className="border-t border-border/40" />
      <div className="border-t border-border/40" />
      <div className="border-t border-border/40" />
      <div className="border-t border-border/40" />
    </div>

    {/* Bars */}
    <div className="absolute inset-0 flex items-end gap-3">
      {months.map((m, i) => {
        const barHeight = Math.max((values[i] / maxVal) * 100, 18);

        return (
          <div key={m} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
            <span className="text-[11px] font-semibold text-foreground">
              ${values[i]}
            </span>

            <div
              className="w-full max-w-[56px] rounded-t-lg relative overflow-hidden"
              style={{ height: `${barHeight}%` }}
            >
              <div className="absolute inset-0 bg-gradient-primary rounded-t-lg opacity-90" />
            </div>

            <span className="text-[10px] text-muted-foreground">{m}</span>
          </div>
        );
      })}
    </div>

    {/* Bottom axis */}
    <div className="absolute bottom-5 left-0 right-0 border-t border-border/60" />
  </div>
</motion.div>

          {/* Category breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl shadow-card border border-border/50 p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-bold font-[var(--font-display)]">
                By Category
              </h3>
            </div>

            {/* Simple donut */}
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {categories.reduce(
                  (
                    acc: { offset: number; elements: React.ReactNode[] },
                    cat,
                    i,
                  ) => {
                    const el = (
                      <circle
                        key={cat.name}
                        cx="18"
                        cy="18"
                        r="15.5"
                        fill="none"
                        stroke={
                          [
                            "oklch(0.62 0.17 250)",
                            "oklch(0.70 0.18 30)",
                            "oklch(0.72 0.15 300)",
                            "oklch(0.65 0.17 155)",
                          ][i]
                        }
                        strokeWidth="5"
                        strokeDasharray={`${cat.pct} ${100 - cat.pct}`}
                        strokeDashoffset={`${-acc.offset}`}
                        className="transition-all duration-500"
                      />
                    );
                    acc.elements.push(el);
                    acc.offset += cat.pct;
                    return acc;
                  },
                  { offset: 0, elements: [] },
                ).elements}
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-lg font-bold font-[var(--font-display)]">
                    $150
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    recurring
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {categories.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                    <span className="text-sm">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{cat.amount}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}