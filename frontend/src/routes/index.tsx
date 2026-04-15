import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AICancellation } from "@/components/landing/AICancellation";
import { AnalyticsShowcase } from "@/components/landing/AnalyticsShowcase";
import { SecuritySection } from "@/components/landing/SecuritySection";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SubPilot — AI-Powered Subscription & Contract Assistant" },
      { name: "description", content: "Track subscriptions, get renewal reminders, see spending analytics, and generate AI-assisted cancellation emails with SubPilot." },
      { property: "og:title", content: "SubPilot — AI-Powered Subscription Assistant" },
      { property: "og:description", content: "Your AI co-pilot for subscriptions and contracts." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <AICancellation />
      <AnalyticsShowcase />
      <SecuritySection />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
