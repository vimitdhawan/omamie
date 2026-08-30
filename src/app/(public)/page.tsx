import { Hero } from "@/features/landing/components/hero";
import { PainPoints } from "@/features/landing/components/pain-points";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { Benefits } from "@/features/landing/components/benefit";
import { StatsSection } from "@/features/landing/components/stats-section";
import { CTASection } from "@/features/landing/components/cta-section";
import { Contact } from "@/features/landing/components/contact";
import { Footer } from "@/features/landing/components/footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden font-sans antialiased">
      <main>
        <Hero />
        <PainPoints />
        <HowItWorks />
        <Benefits />
        <StatsSection />
        <CTASection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
