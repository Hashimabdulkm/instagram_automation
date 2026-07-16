import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Activity, CheckCircle, AlertCircle, Clock, Server, Zap, Webhook } from "lucide-react"

export default function StatusPage() {
  const services = [
    {
      name: "API",
      status: "operational",
      uptime: 99.9,
      responseTime: "45ms",
      icon: Server,
      description: "Core API services"
    },
    {
      name: "Automations",
      status: "operational", 
      uptime: 99.8,
      responseTime: "120ms",
      icon: Zap,
      description: "Automation engine"
    },
    {
      name: "Webhooks",
      status: "operational",
      uptime: 99.7,
      responseTime: "85ms", 
      icon: Webhook,
      description: "Webhook processing"
    }
  ]

  const incidents = [
    {
      id: "inc-001",
      title: "API Response Time Degradation",
      status: "resolved",
      impact: "minor",
      startTime: "2025-01-15T10:30:00Z",
      endTime: "2025-01-15T11:45:00Z",
      description: "Some API endpoints experienced slower response times due to increased load."
    },
    {
      id: "inc-002", 
      title: "Webhook Delivery Delays",
      status: "resolved",
      impact: "minor",
      startTime: "2025-01-12T14:20:00Z",
      endTime: "2025-01-12T16:10:00Z",
      description: "Webhook deliveries were delayed by up to 5 minutes during peak hours."
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-600 bg-green-50 border-green-200"
      case "degraded": return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "outage": return "text-red-600 bg-red-50 border-red-200"
      default: return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical": return "destructive"
      case "major": return "destructive"
      case "minor": return "secondary"
      default: return "outline"
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
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
                <CheckCircle className="h-4 w-4" />
                All Systems Operational
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                System Status
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Real-time monitoring of our platform's health and performance
              </p>
            </div>
          </div>
        </section>

        {/* Services Status */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Service Status</h2>
              <p className="text-muted-foreground">Current status of all platform services</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {services.map((service, index) => {
                const Icon = service.icon
                return (
                  <Card key={index} className="relative overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Uptime</span>
                          <span className="font-medium">{service.uptime}%</span>
                        </div>
                        <Progress value={service.uptime} className="h-2" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Response Time</span>
                        <span className="font-medium">{service.responseTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Overall Status */}
        <section className="container mx-auto max-w-6xl py-8">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-8">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-green-900">All Systems Operational</h3>
                  <p className="text-green-700">All services are running normally with no known issues.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Incident History */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Recent Incidents</h2>
              <p className="text-muted-foreground">Past incidents and their resolutions</p>
            </div>
            
            <div className="space-y-4">
              {incidents.map((incident, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{incident.title}</h3>
                          <Badge variant={getImpactColor(incident.impact)}>
                            {incident.impact}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {incident.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{incident.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Started: {new Date(incident.startTime).toLocaleString()}</span>
                          <span>Resolved: {new Date(incident.endTime).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Monitoring Info */}
        <section className="container mx-auto max-w-6xl py-8">
          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Monitoring & Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    We continuously monitor our systems and will post updates here if any issues arise.
                  </p>
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


