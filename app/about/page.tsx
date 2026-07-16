import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Heart, Zap, Globe, Award, TrendingUp, Shield, Coffee, BookOpen, ArrowRight } from "lucide-react"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Hashim Gafoor KM",
      role: "CEO & Co-Founder",
      bio: "Former product lead at Meta with 10+ years in social media automation",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Muhammed Yasin KA",
      role: "CTO & Co-Founder",
      bio: "Ex-Google engineer specializing in scalable automation systems",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Farhan Shabeer",
      role: "Head of Product",
      bio: "Product strategist with expertise in B2B SaaS and user experience",
      image: "/api/placeholder/150/150"
    },
    {
      name: "muhammed Shabeeb KM",
      role: "Head of Engineering",
      bio: "Full-stack architect passionate about building reliable systems",
      image: "/api/placeholder/150/150"
    }
  ]

  const companyStats = [
    { label: "Customers Served", value: "10,000+" },
    { label: "Messages Automated", value: "50M+" },
    { label: "Team Members", value: "25+" },
    { label: "Countries", value: "8" }
  ]

  const values = [
    {
      title: "Customer First",
      description: "Every decision we make is guided by what's best for our customers' success",
      icon: Heart
    },
    {
      title: "Innovation",
      description: "We're constantly pushing the boundaries of what's possible in automation",
      icon: Zap
    },
    {
      title: "Transparency",
      description: "We believe in open communication and honest relationships with our users",
      icon: Globe
    },
    {
      title: "Security",
      description: "Your data privacy and security are our top priorities",
      icon: Shield
    }
  ]

  const milestones = [
    {
      year: "2025",
      title: "Company Founded",
      description: "Started with a vision to democratize Instagram automation"
    },
    {
      year: "coming soon",
      title: "First 1,000 Customers",
      description: "Reached our first major milestone with growing customer base"
    },
    // {
    //   year: "2024",
    //   title: "Series A Funding",
    //   description: "Raised $5M to accelerate product development and growth"
    // },
    // {
    //   year: "2025",
    //   title: "10,000+ Customers",
    //   description: "Expanded globally with customers in 8 countries"
    // }
  ]

  const culture = [
    {
      title: "Remote First",
      description: "Work from anywhere with flexible hours and great benefits",
      icon: Globe
    },
    {
      title: "Learning Culture",
      description: "We invest in our team's growth with learning budgets and conferences",
      icon: BookOpen
    },
    {
      title: "Work-Life Balance",
      description: "Unlimited PTO, flexible schedules, and mental health support",
      icon: Coffee
    },
    {
      title: "Impact Driven",
      description: "Every team member contributes to helping businesses grow",
      icon: TrendingUp
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
                <Users className="h-4 w-4" />
                Our Story
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                About Instagram AI
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                We're on a mission to help businesses grow faster by automating Instagram conversations
                with intelligent and personal customer interactions.
              </p>
            </div>
          </div>
        </section>

        {/* Company Stats */}
        {/* <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="grid gap-6 md:grid-cols-4">
            {companyStats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section> */}

        {/* Our Story */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Instagram AI was born from a simple observation: businesses were missing out on countless
                  opportunities because they couldn't respond to Instagram DMs fast enough. We saw the gap
                  between customer expectations and business capabilities, and we knew we could bridge it.
                </p>
                <p>
                  Founded in 2025 by instagram  , we set out to create the most
                  intelligent Instagram automation platform. Our goal wasn't just to automate responses,
                  but to create genuine, helpful conversations that convert followers into customers.
                </p>
                {/* <p>
                  Today, we're proud to serve over 10,000 businesses worldwide, helping them automate 
                  millions of conversations while maintaining the personal touch that makes Instagram 
                  marketing so powerful.
                </p> */}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Our Mission</h3>
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-lg font-medium mb-2">Empowering Business Growth</p>
                      <p className="text-muted-foreground">
                        We help businesses grow faster by automating Instagram conversations with
                        intelligent and personal customer interactions that convert followers into loyal customers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team */}
        {/* <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Meet Our Team</h2>
              <p className="text-muted-foreground">The passionate people behind Instagram AI</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">{member.name}</h3>
                    <p className="text-sm text-primary mb-2">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section> */}

        {/* Values */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Our Values</h2>
              <p className="text-muted-foreground">The principles that guide everything we do</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => {
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

        {/* Timeline */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Our Journey</h2>
              <p className="text-muted-foreground">Key milestones in our company's growth</p>
            </div>

            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Award className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline">{milestone.year}</Badge>
                          <h3 className="font-semibold">{milestone.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Culture */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Our Culture</h2>
              <p className="text-muted-foreground">What it's like to work at Instagram AI</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {culture.map((item, index) => {
                const Icon = item.icon
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
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
                <h2 className="text-2xl font-bold">Ready to join our journey?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Whether you're looking to automate your Instagram DMs or join our growing team, 
                  we'd love to hear from you.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button size="lg">Start Free Trial</Button>
                  <Button variant="outline" size="lg">
                    View Open Positions
                    <ArrowRight className="h-4 w-4 ml-2" />
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


