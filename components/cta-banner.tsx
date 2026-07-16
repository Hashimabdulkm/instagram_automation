import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function CtaBanner() {
  return (
    <section className="py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 md:p-12 text-center text-white">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Ready to Automate Your Instagram Success?</h2>
            <p className="text-xl opacity-90 text-pretty max-w-2xl mx-auto">
              Join with us and grow faster with intelligent DM automation. Start your free trial
              today and see results in 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8">
                <Link href="/dashboard">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 border-white text-white hover:bg-white hover:text-primary bg-transparent"
              >
                <Link href="https://example.com/" target="_blank" rel="noopener noreferrer">
                  Schedule Demo
                </Link>
              </Button>
            </div>
            <p className="text-sm opacity-75">No credit card required • 14-day free trial • Cancel anytime</p>
          </div>
        </div>
      </div>
    </section>
  )
}
