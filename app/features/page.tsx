import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, MessageSquare, BarChart3, Settings, Shield, Clock, Users, Smartphone, Globe, CheckCircle, Star } from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      name: "Smart Automations",
      description: "Create intelligent, keyword-based automations that respond instantly to customer inquiries",
      icon: Zap,
      highlights: ["Keyword triggers", "Conditional logic", "Multi-step sequences", "A/B testing"],
      popular: true
    },
    {
      name: "Unified Inbox",
      description: "Manage all your Instagram conversations in one centralized, easy-to-use interface",
      icon: MessageSquare,
      highlights: ["Real-time sync", "Message threading", "Quick replies", "Bulk actions"],
      popular: true
    },
    {
      name: "Advanced Analytics",
      description: "Track performance with detailed insights on response rates, conversions, and engagement",
      icon: BarChart3,
      highlights: ["Response metrics", "Conversion tracking", "Engagement analysis", "Custom reports"],
      popular: false
    },
    {
      name: "Seamless Integrations",
      description: "Connect with your existing tools and workflows for a complete automation solution",
      icon: Settings,
      highlights: ["CRM sync", "Payment triggers", "Email marketing", "Webhook support"],
      popular: false
    },
    {
      name: "Enterprise Security",
      description: "High-level security and advanced data protection",
      icon: Shield,
      highlights: ["Data encryption", "Access controls", "Audit logs"],
      popular: false
    },
    {
      name: "24/7 Availability",
      description: "Never miss a customer inquiry with round-the-clock automated responses",
      icon: Clock,
      highlights: ["Always-on automations", "Time zone handling", "Scheduled responses", "Offline mode"],
      popular: false
    }
  ]

  const benefits = [
    {
      title: "10x Faster Response Times",
      description: "Respond to customer inquiries in seconds, not hours",
      icon: Zap,
      metric: "< 30s"
    },
    {
      title: "100% Customer Satisfaction Guaranteed",
      description: "Keep customers happy with instant, relevant responses",
      icon: Star,
      metric: "100%"
    },
    {
      title: "50% Less Manual Work",
      description: "Automate repetitive tasks and focus on what matters",
      icon: Users,
      metric: "50%"
    },
    {
      title: "3x More Conversions",
      description: "Turn more conversations into sales with smart automation",
      icon: BarChart3,
      metric: "3x"
    }
  ]

  const useCases = [
    {
      title: "E-commerce Brands",
      description: "Automate order inquiries, product questions, and post-purchase support",
      icon: Smartphone,
      features: ["Order tracking", "Product recommendations", "Return processing", "Upselling"]
    },
    {
      title: "Service Businesses",
      description: "Handle appointment bookings, service inquiries, and customer support",
      icon: Globe,
      features: ["Appointment scheduling", "Service quotes", "FAQ responses", "Follow-ups"]
    },
    {
      title: "Content Creators",
      description: "Engage with your audience and manage fan interactions at scale",
      icon: Users,
      features: ["Fan engagement", "Content promotion", "Community management", "Collaboration requests"]
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
                <Zap className="h-4 w-4" />
                Powerful Features
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Everything You Need
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed to automate your Instagram DMs and grow your business
              </p>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="container mx-auto max-w-7xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Core Features</h2>
              <p className="text-muted-foreground">Everything you need to automate your Instagram DMs</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Card 
                    key={index} 
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                      feature.popular ? 'ring-2 ring-primary/20' : ''
                    }`}
                  >
                    {feature.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium rounded-bl-lg">
                        Popular
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">{feature.name}</CardTitle>
                      </div>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Key Features</h4>
                        <ul className="space-y-1">
                          {feature.highlights.map((highlight, highlightIndex) => (
                            <li key={highlightIndex} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Proven Results</h2>
              <p className="text-muted-foreground">See the impact our platform has on businesses</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-3xl font-bold text-primary mb-2">{benefit.metric}</div>
                      <h3 className="font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Perfect For</h2>
              <p className="text-muted-foreground">See how different businesses use our platform</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon
                return (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-xl">{useCase.title}</CardTitle>
                      </div>
                      <p className="text-muted-foreground">{useCase.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Common Use Cases</h4>
                        <ul className="space-y-1">
                          {useCase.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="text-sm text-muted-foreground">
                              • {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="container mx-auto max-w-4xl py-12 md:py-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Ready to automate your Instagram DMs?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of businesses already using our platform to save time and grow their customer base
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg">Start Free Trial</Button>
                  <Button variant="outline" size="lg">View Demo</Button>
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


