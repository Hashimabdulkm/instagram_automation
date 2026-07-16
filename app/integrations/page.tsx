import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Database, CreditCard, Mail, Webhook, Zap, Users, BarChart3, Settings, CheckCircle, Clock } from "lucide-react"

export default function IntegrationsPage() {
  const integrations = [
    {
      name: "CRM Systems",
      description: "Sync leads and conversations to your CRM",
      icon: Database,
      status: "available",
      category: "CRM",
      features: ["Lead sync", "Contact management", "Deal tracking"],
      popular: true
    },
    {
      name: "Payment Processors",
      description: "Trigger offers and follow-ups on purchases",
      icon: CreditCard,
      status: "available",
      category: "Payments",
      features: ["Purchase triggers", "Payment tracking", "Revenue analytics"],
      popular: true
    },
    {
      name: "Email Marketing",
      description: "Create multi-channel customer journeys",
      icon: Mail,
      status: "available",
      category: "Marketing",
      features: ["Email campaigns", "List management", "Automation"],
      popular: false
    },
    {
      name: "SMS Services",
      description: "Send SMS notifications and follow-ups",
      icon: Zap,
      status: "available",
      category: "Communication",
      features: ["SMS campaigns", "Delivery tracking", "Opt-out management"],
      popular: false
    },
    {
      name: "Webhooks",
      description: "Send and receive events from your systems",
      icon: Webhook,
      status: "available",
      category: "Development",
      features: ["Custom events", "Real-time sync", "API integration"],
      popular: false
    },
    {
      name: "Analytics Platforms",
      description: "Track performance across all channels",
      icon: BarChart3,
      status: "coming-soon",
      category: "Analytics",
      features: ["Performance tracking", "Custom dashboards", "ROI analysis"],
      popular: false
    },
    {
      name: "User Management",
      description: "Manage team access and permissions",
      icon: Users,
      status: "available",
      category: "Management",
      features: ["Team roles", "Access control", "Activity logs"],
      popular: false
    },
    {
      name: "Custom APIs",
      description: "Build custom integrations with our API",
      icon: Settings,
      status: "available",
      category: "Development",
      features: ["REST API", "Webhook support", "Custom fields"],
      popular: false
    }
  ]

  const categories = [
    { name: "All", count: integrations.length },
    { name: "CRM", count: integrations.filter(i => i.category === "CRM").length },
    { name: "Payments", count: integrations.filter(i => i.category === "Payments").length },
    { name: "Marketing", count: integrations.filter(i => i.category === "Marketing").length },
    { name: "Communication", count: integrations.filter(i => i.category === "Communication").length },
    { name: "Development", count: integrations.filter(i => i.category === "Development").length },
    { name: "Analytics", count: integrations.filter(i => i.category === "Analytics").length },
    { name: "Management", count: integrations.filter(i => i.category === "Management").length }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>
      case "coming-soon":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Coming Soon</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

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
                Integrations
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Connect Your Stack
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Seamlessly integrate with the tools you already use to automate your entire workflow
              </p>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="container mx-auto max-w-6xl py-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <Button
                key={index}
                variant={index === 0 ? "default" : "outline"}
                size="sm"
                className="gap-2"
              >
                {category.name}
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="container mx-auto max-w-7xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Available Integrations</h2>
              <p className="text-muted-foreground">Connect with popular tools and services</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {integrations.map((integration, index) => {
                const Icon = integration.icon
                return (
                  <Card 
                    key={index} 
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
                      integration.popular ? 'ring-2 ring-primary/20' : ''
                    }`}
                  >
                    {integration.popular && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-medium rounded-bl-lg">
                        Popular
                      </div>
                    )}
                    
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        {getStatusBadge(integration.status)}
                      </div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{integration.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Features</h4>
                        <ul className="space-y-1">
                          {integration.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="text-xs text-muted-foreground">
                              • {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        variant={integration.status === "available" ? "default" : "outline"}
                        disabled={integration.status === "coming-soon"}
                      >
                        {integration.status === "available" ? "Connect" : "Coming Soon"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Integration Benefits */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Why Integrate?</h2>
              <p className="text-muted-foreground">Unlock the full potential of your automation</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-3 rounded-full bg-blue-100 w-fit mx-auto mb-4">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Automate Everything</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect all your tools to create seamless, automated workflows that work 24/7
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-3 rounded-full bg-green-100 w-fit mx-auto mb-4">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Track Performance</h3>
                  <p className="text-sm text-muted-foreground">
                    Get insights across all channels and optimize your automation strategies
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-3 rounded-full bg-purple-100 w-fit mx-auto mb-4">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Scale Efficiently</h3>
                  <p className="text-sm text-muted-foreground">
                    Handle more conversations and customers without increasing your workload
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Custom Integration */}
        <section className="container mx-auto max-w-4xl py-12 md:py-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                  <Settings className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Need a Custom Integration?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Don't see the integration you need? We can build custom connections for your specific tools and workflows.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg">Request Integration</Button>
                  <Button variant="outline" size="lg">View API Docs</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  )
}


