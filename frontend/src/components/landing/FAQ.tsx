import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  { q: "How does SubPilot detect renewal dates?", a: "You enter renewal dates manually when adding contracts. In future versions, SubPilot will support optional email scanning to auto-detect subscriptions and dates." },
  { q: "Does the AI see my personal data?", a: "No. SubPilot's AI generates neutral, professional letter templates without accessing your personal information. Your name, address, and customer details are added only in the final backend composition step." },
  { q: "Can I send cancellation emails directly?", a: "SubPilot prepares send-ready emails that open in your default mail client with the subject, body, and recipient pre-filled. You review everything before hitting send." },
  { q: "Can I manage non-subscription contracts too?", a: "Yes! SubPilot supports any type of recurring contract — gym memberships, insurance policies, telecom plans, software licenses, and more." },
  { q: "Can I use multiple languages?", a: "Absolutely. SubPilot can generate cancellation letters in German, English, French, Spanish, and more. Just select your preferred language when creating a draft." },
  { q: "Will future versions support email scanning?", a: "Yes, automated email scanning is on our roadmap. It will be opt-in and privacy-focused, allowing SubPilot to detect and import subscriptions from your inbox." },
  { q: "Can I export my contracts?", a: "Yes, you can export your contract data as CSV or PDF from the Settings page for your records or for use with other tools." },
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
