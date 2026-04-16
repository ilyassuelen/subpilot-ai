import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    q: "How does SubPilot track renewal and cancellation dates?",
    a: "Contracts are added manually with their start date, end date, and notice period. Based on that information, SubPilot can calculate cancellation deadlines and help surface important dates in the dashboard.",
  },
  {
    q: "Does the AI see my personal data?",
    a: "The cancellation draft workflow is designed so that sensitive personal data can be kept separate from AI-generated draft text. Customer-specific details are intended to be handled later in the backend workflow.",
  },
  {
    q: "Can I send cancellation emails directly from SubPilot?",
    a: "SubPilot prepares send-ready email content and opens a pre-composed draft in your mail client, so the final review and sending step stays under user control.",
  },
  {
    q: "Can I manage contracts beyond subscriptions?",
    a: "Yes. SubPilot is designed not only for subscriptions, but also for recurring contracts such as telecom plans, insurance policies, memberships, and software services.",
  },
  {
    q: "Does SubPilot support multiple billing cycles?",
    a: "Yes. Contracts can be created with weekly, monthly, quarterly, or yearly billing cycles, which helps the dashboard represent recurring costs more realistically.",
  },
  {
    q: "Is multi-language cancellation generation supported?",
    a: "The product is designed with multi-language draft generation in mind. Current and future language support depends on the cancellation workflow configuration and planned product expansion.",
  },
  {
    q: "Will future versions support inbox or email scanning?",
    a: "Yes, inbox-based subscription detection is planned as a future feature. The goal is to keep it opt-in and privacy-aware rather than making it automatic by default.",
  },
  {
    q: "What is the main AI use case in the current product?",
    a: "The current AI focus is cancellation draft generation. Additional AI capabilities such as smarter insights and automation support are part of the broader product direction.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 lg:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
            Frequently Asked Questions
          </h2>

          <p className="mt-4 text-muted-foreground text-lg">
            A quick overview of how SubPilot handles contracts, recurring costs,
            AI-generated drafts, and planned platform capabilities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card rounded-xl border border-border/50 px-5 shadow-soft data-[state=open]:shadow-card"
              >
                <AccordionTrigger className="text-left font-semibold font-[var(--font-display)] text-sm hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>

                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}