import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Shield, FileText, AlertCircle, CreditCard, XCircle, AlertTriangle, Scale, RefreshCw, Mail } from "lucide-react"

export default function TermsOfServicePage() {
  const sections = [
    {
      icon: Shield,
      title: "Accounts",
      content: "You are responsible for safeguarding your account credentials and for all activities under your account. Notify us immediately of any unauthorized use."
    },
    {
      icon: AlertCircle,
      title: "Acceptable Use",
      content: "Do not violate any applicable law or regulation, interfere with or disrupt the Service, or attempt to access non-public areas of the Service."
    },
    {
      icon: CreditCard,
      title: "Subscriptions and Billing",
      content: "Certain features may be offered on a subscription basis. Fees are billed in advance on a recurring basis, unless canceled per the terms of your plan."
    },
    {
      icon: XCircle,
      title: "Termination",
      content: "We may suspend or terminate access to the Service immediately, without prior notice, for conduct that violates these Terms."
    },
    {
      icon: AlertTriangle,
      title: "Disclaimers",
      content: "The Service is provided on an 'AS IS' and 'AS AVAILABLE' basis without warranties of any kind. To the maximum extent permitted by law, we disclaim all warranties, express or implied."
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content: "To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues."
    },
    {
      icon: RefreshCw,
      title: "Changes",
      content: "We may update these Terms from time to time. Changes will be effective upon posting. Your continued use of the Service constitutes acceptance of the revised Terms."
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
                <FileText className="h-4 w-4" />
                Legal Document
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Terms of Service
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our terms and conditions for using our Instagram automation platform
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
                    Contact
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
                      These Terms govern your access to and use of our website and services (the "Service"). 
                      By accessing or using the Service, you agree to be bound by these Terms.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Terms Sections */}
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
                    <CardTitle className="text-xl">Contact</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="leading-relaxed">
                      Questions about these Terms? Contact us at{" "}
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
      </main>
      <Footer />
    </div>
  )
}


