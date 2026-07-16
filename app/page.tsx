import { DashboardHeader } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { FeaturesSection } from "@/components/features-section"
import { SocialProofSection } from "@/components/social-proof-section"
import { CtaBanner } from "@/components/cta-banner"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        {/* <SocialProofSection /> */}
        <CtaBanner />
      </main>
      <Footer />
    </div>
  )
}
