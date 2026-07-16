import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, X, Star, Zap, Users, Shield, Headphones } from "lucide-react"

export default function PricingPage() {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for individuals getting started",
      price: 19,
      period: "month",
      popular: false,
      features: [
        "Up to 1,000 messages/month",
        "Basic automations",
        "1 Instagram account",
        "Email support",
        "Basic analytics",
        "Standard templates"
      ],
      limitations: [
        "No custom integrations",
        "No priority support"
      ],
      cta: "Start Free Trial",
      icon: Zap
    },
    {
      name: "Growth",
      description: "Ideal for growing businesses",
      price: 49,
      period: "month",
      popular: true,
      features: [
        "Up to 10,000 messages/month",
        "Advanced automations",
        "Up to 3 Instagram accounts",
        "Priority support",
        "Advanced analytics",
        "Custom templates",
        "CRM integrations",
        "A/B testing"
      ],
      limitations: [],
      cta: "Start Free Trial",
      icon: Users
    },
    {
      name: "Scale",
      description: "For high-volume brands",
      price: "Custom",
      period: "monthly",
      popular: false,
      features: [
        "Unlimited messages",
        "Enterprise automations",
        "Unlimited Instagram accounts",
        "Dedicated support",
        "Custom analytics",
        "White-label options",
        "All integrations",
        "Custom development",
        "SLA guarantee"
      ],
      limitations: [],
      cta: "Contact Sales",
      icon: Shield
    }
  ]

  const features = [
    {
      category: "Messaging",
      items: [
        { name: "Monthly message limit", starter: "1,000", growth: "10,000", scale: "Unlimited" },
        { name: "Instagram accounts", starter: "1", growth: "3", scale: "Unlimited" },
        { name: "Automation rules", starter: "Basic", growth: "Advanced", scale: "Enterprise" }
      ]
    },
    {
      category: "Support & Features",
      items: [
        { name: "Support level", starter: "Email", growth: "Priority", scale: "Dedicated" },
        { name: "Analytics", starter: "Basic", growth: "Advanced", scale: "Custom" },
        { name: "Integrations", starter: "None", growth: "CRM", scale: "All" },
        { name: "Custom development", starter: "No", growth: "No", scale: "Yes" }
      ]
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
                <Star className="h-4 w-4" />
                Simple Pricing
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Choose Your Plan
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Simple, transparent pricing that scales with your business
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto max-w-7xl py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan, index) => {
              const Icon = plan.icon
              return (
                <Card 
                  key={index} 
                  className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                    plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-medium rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <p className="text-muted-foreground">{plan.description}</p>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">
                        {plan.price === "Custom" ? "" : "$"}{plan.price}
                      </span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        What's included
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                        {plan.limitations.map((limitation, limitIndex) => (
                          <li key={limitIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="container mx-auto max-w-7xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Feature Comparison</h2>
              <p className="text-muted-foreground">Compare plans side by side</p>
            </div>
            
            <div className="space-y-8">
              {features.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">{category.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium">Feature</th>
                            <th className="text-center py-3 px-4 font-medium">Starter</th>
                            <th className="text-center py-3 px-4 font-medium">Growth</th>
                            <th className="text-center py-3 px-4 font-medium">Scale</th>
                          </tr>
                        </thead>
                        <tbody>
                          {category.items.map((item, itemIndex) => (
                            <tr key={itemIndex} className="border-b last:border-b-0">
                              <td className="py-3 px-4">{item.name}</td>
                              <td className="py-3 px-4 text-center">{item.starter}</td>
                              <td className="py-3 px-4 text-center">{item.growth}</td>
                              <td className="py-3 px-4 text-center">{item.scale}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto max-w-4xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Common questions about our pricing</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Can I change plans anytime?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                  <p className="text-sm text-muted-foreground">
                    All plans come with a 14-day free trial. No credit card required to get started.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-sm text-muted-foreground">
                    We accept all major credit cards, PayPal, and bank transfers for annual plans.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Do you offer custom plans?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes, we offer custom enterprise plans for large organizations with specific needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="container mx-auto max-w-4xl py-12 md:py-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Ready to get started?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of businesses already using our platform to automate their Instagram DMs
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg">Start Free Trial</Button>
                  <Button variant="outline" size="lg">Contact Sales</Button>
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


