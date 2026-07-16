import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main>
        <section className="border-b bg-muted/30">
          <div className="container mx-auto max-w-5xl py-12 md:py-16">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Blog</h1>
            <p className="text-muted-foreground mt-2">Product updates, guides, and best practices.</p>
          </div>
        </section>
        <section className="container mx-auto max-w-5xl py-10 md:py-12">
          <div className="bg-card border rounded-lg p-6 md:p-8 text-muted-foreground">
            <p>No posts yet. Check back soon.</p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


