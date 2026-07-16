import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main>
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-5xl py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">API</h1>
            <p className="text-muted-foreground mt-2">Developer endpoints and webhooks.</p>
          </div>
        </section>
        <section className="container mx-auto max-w-5xl py-10 md:py-12">
          <div className="bg-card border rounded-lg p-6 md:p-8 space-y-6 max-w-3xl">
            <div>
              <h2 className="text-xl font-semibold mb-2">Authentication</h2>
              <p>Use Bearer tokens to authenticate requests to our API.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Webhooks</h2>
              <p>Subscribe to conversation and automation events via webhooks.</p>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Rate Limits</h2>
              <p>Standard limits apply. Contact support for higher tiers.</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


