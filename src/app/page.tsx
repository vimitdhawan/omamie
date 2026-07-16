import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import PainPoints from "@/components/landing/PainPoints";
import HowItWorks from "@/components/landing/HowItWorks";
import Benefits from "@/components/landing/Benefits";
import StatsSection from "@/components/landing/StatsSection";
import CTASection from "@/components/landing/CTASection";
import Contact from "@/components/landing/Contact";
import Footer from "@/components/landing/Footer";

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
