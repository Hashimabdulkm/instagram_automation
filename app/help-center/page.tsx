import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, BookOpen, Settings, Zap, Users, Mail, ArrowRight, HelpCircle, FileText, Video, Phone } from "lucide-react"

export default function HelpCenterPage() {
  const categories = [
    {
      name: "Getting Started",
      icon: BookOpen,
      description: "Learn the basics and set up your account",
      articles: [
        "Creating your first automation",
        "Connecting Instagram",
        "Setting up integrations",
        "Understanding the dashboard"
      ]
    },
    {
      name: "Automations",
      icon: Zap,
      description: "Master automation features and best practices",
      articles: [
        "Creating keyword triggers",
        "Setting up follow-up sequences",
        "A/B testing your messages",
        "Managing automation rules"
      ]
    },
    {
      name: "Integrations",
      icon: Settings,
      description: "Connect with your tools",
      articles: [
        "CRM integration setup",
        "Payment processor connections",
        "Webhook configuration",
        "API documentation"
      ]
    },
    {
      name: "Account & Billing",
      icon: Users,
      description: "Manage your account and subscription",
      articles: [
        "Upgrading your plan",
        "Team management",
        "Billing questions",
        "Account settings"
      ]
    }
  ]

  const faqs = [
    {
      question: "How do I connect my Instagram account?",
      answer: "Go to Settings → Integrations and click 'Connect Instagram'. Follow the OAuth flow to authorize our app to access your Instagram Business account."
    },
    {
      question: "Can I use multiple Instagram accounts?",
      answer: "Yes! Depending on your plan, you can connect multiple Instagram Business accounts. Each account can have its own set of automations and settings."
    },
    {
      question: "How do I create my first automation?",
      answer: "Navigate to Dashboard → Campaigns and click 'New Campaign'. Choose your trigger type (keyword, time-based, etc.) and set up your response messages."
    },
    {
      question: "What happens if Instagram changes their API?",
      answer: "We monitor Instagram's API changes closely and update our platform accordingly. You'll be notified of any required actions through email and in-app notifications."
    },
    {
      question: "How can I track my automation performance?",
      answer: "Visit the Analytics section to see detailed metrics including message volume, response rates, conversion tracking, and engagement statistics."
    },
    {
      question: "Is there a mobile app?",
      answer: "Our platform is fully responsive and works great on mobile browsers. We're also developing native mobile apps for iOS and Android."
    }
  ]

  const supportOptions = [
    {
      name: "Email Support",
      description: "Get help via email within 24 hours",
      icon: Mail,
      action: "support@example.com",
      href: "mailto:support@example.com"
    },
    {
      name: "Phone Support",
      description: "Call us for urgent issues (Enterprise only)",
      icon: Phone,
      action: "+91 8590989804",
      href: "tel:+918590989804"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <DashboardHeader />
      <main>
        {/* Page hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
          <div className="container mx-auto max-w-6xl py-16 md:py-24 relative">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <HelpCircle className="h-4 w-4" />
                Help & Support
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Help Center
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Find answers, learn best practices, and get the support you need
              </p>
              
              {/* Search Bar */}
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search help articles..." 
                    className="pl-10 pr-4 py-3"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="container mx-auto max-w-7xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Browse by Category</h2>
              <p className="text-muted-foreground">Find help articles organized by topic</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => {
                const Icon = category.icon
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-4">
                      <div className="p-3 rounded-lg bg-primary/10 w-fit mb-3">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.articles.map((article, articleIndex) => (
                          <li key={articleIndex} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                            • {article}
                          </li>
                        ))}
                      </ul>
                      {/* <Button variant="ghost" size="sm" className="mt-4 p-0 h-auto">
                        View all <ArrowRight className="h-3 w-3 ml-1" />
                      </Button> */}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto max-w-4xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Quick answers to common questions</p>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">{faq.question}</h3>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Support Options */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Get Support</h2>
              <p className="text-muted-foreground">Choose how you'd like to get help</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {supportOptions.map((option, index) => {
                const Icon = option.icon
                return (
                  <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{option.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{option.description}</p>
                      <Button variant="outline" size="sm" asChild>
                        <a href={option.href}>
                          {option.action}
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Quick Start Guide */}
        {/* <section className="container mx-auto max-w-4xl py-12 md:py-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="text-center space-y-4">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">New to our platform?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Check out our comprehensive getting started guide to learn everything you need to know about automating your Instagram DMs.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg">
                    <Video className="h-4 w-4 mr-2" />
                    Watch Tutorial
                  </Button>
                  <Button variant="outline" size="lg">
                    <FileText className="h-4 w-4 mr-2" />
                    Read Guide
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section> */}
      </main>
      <Footer />
    </div>
  )
}


