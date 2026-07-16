import { Card, CardContent } from "@/components/ui/card"
import { Link, MessageCircle, TrendingUp } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      icon: Link,
      title: "Connect",
      description: "Link your Instagram account in seconds with our secure integration.",
    },
    {
      icon: MessageCircle,
      title: "Automate",
      description: "Set up smart auto-replies and conversation flows that engage your audience.",
    },
    {
      icon: TrendingUp,
      title: "Convert",
      description: "Turn conversations into customers with automated lead capture and nurturing.",
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">How It Works</h2>
          <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Get started with Instagram DM automation in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="relative border-0 shadow-lg">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-pretty">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
