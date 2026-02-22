"use client";

import { HeroSection } from "@/components/hero/HeroSection";
import { FeaturesSection } from "@/components/hero/FeaturesSection";
import { HowItWorksSection } from "@/components/hero/HowItWorksSection";
import { CTASection } from "@/components/hero/CTASection";

export default function HomePage() {
  return (
    <main className="bg-[#030614] overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
    </main>
  );
}
