import { motion } from "framer-motion";
import { BrainCircuit, Shield, Check, Mail, Globe, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AICancellation() {
  return (
    <section id="ai-cancellation" className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-coral/10 text-coral text-sm font-medium mb-4">
            <BrainCircuit className="w-3.5 h-3.5" />
            AI-Powered
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
            Smart Cancellation,{" "}
            <span className="text-gradient-coral">Privacy First</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Generate professional cancellation letters with AI while keeping your personal data private and secure.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left - Flow explanation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              { icon: FileText, title: "Select Contract", desc: "Choose the subscription or contract you want to cancel." },
              { icon: Globe, title: "Choose Language", desc: "Pick your language — German, English, French, Spanish, and more." },
              { icon: BrainCircuit, title: "AI Generates Draft", desc: "A neutral, professional cancellation letter is generated without personal data." },
              { icon: Shield, title: "Backend Composition", desc: "Your name, address, and customer details are injected securely in the backend." },
              { icon: Check, title: "Review & Approve", desc: "Read the final letter, make edits, and approve when ready." },
              { icon: Mail, title: "Send-Ready Email", desc: "Open a pre-composed email in your mail client — just hit send." },
            ].map((item, i) => (
              <div key={item.title} className="flex gap-4 items-start group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold font-[var(--font-display)] mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Right - Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl shadow-card-hover border border-border overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-border flex items-center justify-between bg-muted/30">
              <span className="text-sm font-semibold font-[var(--font-display)]">Cancellation Draft</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">Draft Ready</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-xl p-3">
                  <div className="text-[10px] text-muted-foreground mb-1">Provider</div>
                  <div className="text-sm font-semibold">Netflix Premium</div>
                </div>
                <div className="bg-muted/40 rounded-xl p-3">
                  <div className="text-[10px] text-muted-foreground mb-1">Language</div>
                  <div className="text-sm font-semibold flex items-center gap-1">
                    <Globe className="w-3 h-3" /> English
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <div className="text-xs text-muted-foreground mb-2 font-medium">Generated Draft</div>
                <div className="text-sm leading-relaxed space-y-2">
                  <p className="font-semibold">Subject: Cancellation of Subscription — [Customer Number]</p>
                  <p>Dear Netflix Team,</p>
                  <p>I hereby cancel my subscription effective at the earliest possible date. Please confirm the cancellation in writing and provide the exact end date of my contract.</p>
                  <p>Kind regards,<br />[Customer Name]</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="hero" size="sm" className="flex-1">
                  <Check className="w-4 h-4" /> Approve
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Mail className="w-4 h-4" /> Email Preview
                </Button>
              </div>
            </div>

            {/* Email Preview */}
            <div className="border-t border-border bg-gradient-card-blue p-5 space-y-3">
              <div className="text-xs font-semibold text-primary font-[var(--font-display)]">Email Preview</div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs w-10">To:</span>
                  <span className="font-medium">support@netflix.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs w-10">Subj:</span>
                  <span className="font-medium">Cancellation of Subscription — #12345</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="coral" size="sm">
                  <Mail className="w-4 h-4" /> Open in Mail <ArrowRight className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm">Copy Body</Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
