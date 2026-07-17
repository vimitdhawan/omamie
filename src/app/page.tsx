import Header from "@/features/landing/components/Header";
import Hero from "@/features/landing/components/Hero";
import PainPoints from "@/features/landing/components/PainPoints";
import HowItWorks from "@/features/landing/components/HowItWorks";
import Benefits from "@/features/landing/components/Benefits";
import StatsSection from "@/features/landing/components/StatsSection";
import CTASection from "@/features/landing/components/CTASection";
import Contact from "@/features/landing/components/Contact";
import Footer from "@/features/landing/components/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden font-sans antialiased">
      <Header />
      <main className="flex-1">
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
