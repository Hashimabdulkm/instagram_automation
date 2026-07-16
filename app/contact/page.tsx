"use client"

import { DashboardHeader } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, MessageCircle, Send, Users, Headphones, Twitter, Linkedin, Instagram } from "lucide-react"

export default function ContactPage() {
  const contactMethods = [
    {
      name: "Email Support",
      description: "Get help via email within 24 hours",
      icon: Mail,
      contact: "support@example.com",
      availability: "24/7"
    },
    {
      name: "Sales Inquiries",
      description: "Looking for a demo or custom plan?",
      icon: Users,
      contact: "sales@example.com",
      availability: "Mon-Fri, 9AM-6PM"
    },
    {
      name: "Phone Support",
      description: "Call us for urgent issues (Enterprise only)",
      icon: Phone,
      contact: "+91 8590989804",
      availability: "Mon-Sat, 9AM-9PM"
    }
  ]

  const officeInfo = {
    name: "Instagram AI",
    address: "Street",
    city: "Ernakulam, Kerala, India",
    hours: "Monday - Saturday: 9:00 AM - 9:00 PM"
  }

  const socialLinks = [
    { name: "Twitter", icon: Twitter, url: "#" },
    { name: "LinkedIn", icon: Linkedin, url: "#" },
    { name: "Instagram", icon: Instagram, url: "#" }
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
                <MessageCircle className="h-4 w-4" />
                Get in Touch
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Contact Us
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="container mx-auto max-w-6xl py-12 md:py-16">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a message</CardTitle>
                <p className="text-muted-foreground">Fill out the form below and we'll get back to you within 24 hours.</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <form className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" placeholder="Doe" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="john@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="phone" placeholder="+91 9567533871" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input id="company" placeholder="Acme Inc." />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="sales">Sales Inquiry</SelectItem>
                        <SelectItem value="billing">Billing Question</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <Button
                    className="w-full" size="lg"
                    onClick={() => {
                      const firstName = (document.getElementById('firstName') as HTMLInputElement)?.value || '';
                      const lastName = (document.getElementById('lastName') as HTMLInputElement)?.value || '';
                      const email = (document.getElementById('email') as HTMLInputElement)?.value || '';
                      const company = (document.getElementById('company') as HTMLInputElement)?.value || '';
                      const subject = (document.getElementById('subject') as HTMLSelectElement)?.value || '';
                      const message = (document.getElementById('message') as HTMLTextAreaElement)?.value || '';

                      const fullName = `${firstName} ${lastName}`.trim();
                      const whatsappMessage = `Hi Instagram AI Team!

Name: ${fullName}
Email: ${email}
Company: ${company || 'Not provided'}
Subject: ${subject || 'General Inquiry'}

Message:
${message}

I'm interested in learning more about your Instagram automation platform. Please get back to me at your earliest convenience.

Thank you!`;

                      const encodedMessage = encodeURIComponent(whatsappMessage);
                      const whatsappNumber = '8590989804'; // Replace with your actual WhatsApp number
                      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

                      window.open(whatsappUrl, '_blank');
                    }}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send via WhatsApp
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <div className="space-y-6">
                {/* <h2 className="text-2xl font-bold">Other ways to reach us</h2> */}
                {contactMethods.map((method, index) => {
                  const Icon = method.icon
                  return (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold">{method.name}</h3>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                            <p className="font-medium text-primary">{method.contact}</p>
                            <p className="text-xs text-muted-foreground">{method.availability}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Office Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Our Office
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{officeInfo.name}</h3>
                    <p>{officeInfo.address}</p>
                    <p>{officeInfo.city}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{officeInfo.hours}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              {/* <Card>
                <CardHeader>
                  <CardTitle>Follow us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon
                      return (
                        <Button key={index} variant="outline" size="sm" className="gap-2">
                          <Icon className="h-4 w-4" />
                          {social.name}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto max-w-4xl py-12 md:py-16">
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Quick answers to common questions</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">How quickly do you respond?</h3>
                  <p className="text-sm text-muted-foreground">
                    We typically respond to all inquiries within 24 hours. Enterprise customers get priority support with faster response times.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Do you offer custom solutions?</h3>
                  <p className="text-sm text-muted-foreground">
                    Yes! We work with enterprise customers to create custom integrations and automation solutions tailored to their specific needs.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Can I schedule a demo?</h3>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! Contact our sales team to schedule a personalized demo of our platform and see how it can work for your business.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What's your refund policy?</h3>
                  <p className="text-sm text-muted-foreground">
                    We offer a 30-day money-back guarantee. If you're not satisfied with our service, we'll provide a full refund.
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


