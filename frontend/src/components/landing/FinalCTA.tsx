import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plane } from "lucide-react";
import { RegistrationModal } from "./RegistrationModal";

export function FinalCTA() {
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-cta rounded-3xl p-10 lg:p-16 text-center text-primary-foreground relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-primary-foreground/5 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary-foreground/5 blur-2xl" />

            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6">
                <Plane className="w-7 h-7" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold font-[var(--font-display)] tracking-tight">
                Ready to take control of recurring costs?
              </h2>

              <p className="mt-4 text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                Explore how SubPilot combines contract tracking, deadline
                awareness, spending visibility, and AI-assisted cancellation
                workflows in one focused experience.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button
                  size="xl"
                  onClick={() => setRegisterOpen(true)}
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg font-bold"
                >
                  Explore SubPilot <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <RegistrationModal open={registerOpen} onOpenChange={setRegisterOpen} />
    </>
  );
}