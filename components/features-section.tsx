import { Card, CardContent } from "@/components/ui/card"
import { MessageSquareReply, Workflow, Users, BarChart3 } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: MessageSquareReply,
      title: "Smart Auto-Replies",
      description: "Respond to DMs instantly with intelligent, contextual messages that feel personal.",
    },
    {
      icon: Workflow,
      title: "DM Funnels",
      description: "Create sophisticated conversation flows that guide prospects through your sales process.",
    },
    {
      icon: Users,
      title: "Lead Capture",
      description: "Automatically collect contact information and qualify leads through engaging conversations.",
    },
    {
      icon: BarChart3,
      title: "CRM Integration",
      description: "Sync leads directly to your CRM and track the entire customer journey seamlessly.",
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Powerful Features for Growth</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Everything you need to turn Instagram conversations into revenue
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground text-pretty">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
