import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Briefcase, Heart, Zap, Globe, Coffee, BookOpen, ArrowRight, MapPin, Clock, DollarSign } from "lucide-react"

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "San Francisco, CA",
      type: "Full-time",
      remote: true,
      description: "Build scalable features for our Instagram automation platform",
      requirements: ["5+ years experience", "React/Next.js", "Node.js", "PostgreSQL"],
      posted: "2 days ago"
    },
    {
      title: "Product Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      remote: true,
      description: "Drive growth through strategic marketing initiatives",
      requirements: ["3+ years experience", "B2B SaaS", "Content marketing", "Analytics"],
      posted: "1 week ago"
    },
    {
      title: "Customer Success Specialist",
      department: "Customer Success",
      location: "San Francisco, CA",
      type: "Full-time",
      remote: false,
      description: "Help customers succeed with our platform",
      requirements: ["2+ years experience", "Customer support", "Technical skills", "Communication"],
      posted: "3 days ago"
    }
  ]

  const companyValues = [
    {
      title: "Innovation First",
      description: "We're always pushing the boundaries of what's possible in automation",
      icon: Zap
    },
    {
      title: "Customer Obsessed",
      description: "Our customers' success is our success",
      icon: Heart
    },
    {
      title: "Remote Friendly",
      description: "Work from anywhere with flexible hours and great benefits",
      icon: Globe
    },
    {
      title: "Growth Mindset",
      description: "We invest in our team's learning and development",
      icon: BookOpen
    }
  ]

  const benefits = [
    {
      category: "Health & Wellness",
      items: ["Health, dental, and vision insurance", "Mental health support", "Gym membership", "Wellness stipend"]
    },
    {
      category: "Work & Life",
      items: ["Flexible working hours", "Unlimited PTO", "Remote work options", "Home office stipend"]
    },
    {
      category: "Learning & Development",
      items: ["Learning budget", "Conference attendance", "Internal training", "Career development"]
    },
    {
      category: "Perks & Benefits",
      items: ["Competitive salary", "Equity options", "401k matching", "Team events"]
    }
  ]

  const teamStats = [
    { label: "Team Members", value: "25+" },
    { label: "Countries", value: "8" },
    { label: "Remote Workers", value: "80%" },
    { label: "Years Average Experience", value: "6+" }
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
                <Briefcase className="h-4 w-4" />
                Join Our Team
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Careers at Instagram
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Help us shape the future of Instagram automation and build something amazing together
              </p>
            </div>
          </div>
        </section>

        {/* Team Stats */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-4">
            {teamStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Open Positions</h2>
              <p className="text-muted-foreground">Join our growing team and make an impact</p>
            </div>
            
            <div className="space-y-6">
              {openPositions.map((position, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl font-semibold">{position.title}</h3>
                          <Badge variant="outline">{position.department}</Badge>
                        </div>
                        <p className="text-muted-foreground">{position.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {position.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {position.type}
                          </div>
                          {position.remote && (
                            <Badge variant="secondary" className="text-xs">Remote OK</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Requirements:</h4>
                          <div className="flex flex-wrap gap-2">
                            {position.requirements.map((req, reqIndex) => (
                              <Badge key={reqIndex} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-3">
                        <span className="text-xs text-muted-foreground">Posted {position.posted}</span>
                        <Button>
                          Apply Now
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Don't see a role that fits? We're always looking for great talent.</p>
              <Button variant="outline">View All Positions</Button>
            </div>
          </div>
        </section>

        {/* Company Values */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Our Values</h2>
              <p className="text-muted-foreground">What drives us every day</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {companyValues.map((value, index) => {
                const Icon = value.icon
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Benefits & Perks</h2>
              <p className="text-muted-foreground">We take care of our team</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{benefit.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {benefit.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-muted-foreground">
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Culture Section */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Our Culture</h2>
                <p className="text-muted-foreground max-w-3xl mx-auto">
                  We're a diverse, inclusive team that values collaboration, innovation, and work-life balance. 
                  We believe in empowering our team members to do their best work while maintaining a healthy, 
                  supportive environment where everyone can thrive.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg">View Open Positions</Button>
                  <Button variant="outline" size="lg">Learn More About Us</Button>
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


