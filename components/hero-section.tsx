import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Play } from "lucide-react"
import Image from "next/image"
import heroImage from "@/public/untitleddesign.png"

export function HeroSection() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">
                Automate Your Instagram DMs and <span className="text-primary">Grow Faster</span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty max-w-lg">
                Turn Instagram conversations into customers with smart automation. Capture leads, nurture prospects, and
                boost sales 24/7.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/dashboard">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                <Link href="https://example.com/" target="_blank" rel="noopener noreferrer">
                  <Play className="mr-2 h-5 w-5" />
                  Schedule Demo
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                14-day free trial
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 backdrop-blur-sm">
              <Image
                src={heroImage}
                width={600}
                height={600}
                alt="DMFlow Dashboard"
                className="w-full h-auto rounded-lg shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
