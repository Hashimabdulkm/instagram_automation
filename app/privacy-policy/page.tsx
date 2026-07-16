import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, FileText, Eye, Database, Share2, Clock, UserCheck, Mail, RefreshCw } from "lucide-react"

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: "We collect account information such as name, email, and workspace details, usage data like pages visited and features used, and integration data necessary to provide automation features you enable."
    },
    {
      icon: Eye,
      title: "How We Use Information",
      content: "We use your information to provide, maintain, and improve the Service, personalize your experience and deliver relevant features, and communicate service updates, security alerts, and support messages."
    },
    {
      icon: Share2,
      title: "Data Sharing",
      content: "We do not sell your personal information. We may share data with service providers who assist in operating the Service, subject to appropriate contractual safeguards, and when required by law."
    },
    {
      icon: Clock,
      title: "Data Retention",
      content: "We retain information for as long as necessary to provide the Service and comply with legal obligations. You may request deletion of your account and associated data where applicable."
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: "Depending on your location, you may have rights to access, correct, or delete personal information, and to object to or restrict certain processing activities."
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
                <Shield className="h-4 w-4" />
                Privacy & Security
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                How we collect, use, and protect your personal information
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <Badge variant="outline" className="gap-2">
                  <RefreshCw className="h-3 w-3" />
                  Last updated: October 16, 2025
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-4">
            {/* Table of Contents */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle className="text-lg">Table of Contents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a href="#introduction" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Introduction
                  </a>
                  {sections.map((section, index) => (
                    <a 
                      key={index}
                      href={`#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {section.title}
                    </a>
                  ))}
                  <a href="#contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact Us
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Introduction */}
              <Card id="introduction">
                <CardContent className="p-8">
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-lg leading-relaxed">
                      This Privacy Policy explains how we collect, use, and safeguard your information when you
                      use our website and services. By using the Service, you agree to the collection and use of
                      information in accordance with this policy.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Sections */}
              {sections.map((section, index) => {
                const Icon = section.icon
                return (
                  <Card key={index} id={section.title.toLowerCase().replace(/\s+/g, '-')}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-5 w-5" />
                        </div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <p className="leading-relaxed">{section.content}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Contact Section */}
              <Card id="contact">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">Contact Us</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="leading-relaxed">
                      For questions or requests about this policy, contact us at{" "}
                      <a href="mailto:support@example.com" className="font-medium text-primary hover:underline">
                        support@example.com
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Privacy Highlights */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Privacy Highlights</h2>
              <p className="text-muted-foreground">Key points about how we handle your data</p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-3 rounded-full bg-green-100 w-fit mx-auto mb-4">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">We Don't Sell Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Your personal information is never sold to third parties
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-3 rounded-full bg-blue-100 w-fit mx-auto mb-4">
                    <UserCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">You're In Control</h3>
                  <p className="text-sm text-muted-foreground">
                    Access, update, or delete your data anytime
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="p-3 rounded-full bg-purple-100 w-fit mx-auto mb-4">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Transparent Practices</h3>
                  <p className="text-sm text-muted-foreground">
                    Clear policies on how we use your information
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}


