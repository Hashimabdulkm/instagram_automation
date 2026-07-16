import { DashboardSidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/header"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { client } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Instagram, CheckCircle2 } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the analytics section to ensure it's client-side
const AnalyticsSection = dynamic(() => import("./_components/analytics-section"), {
  ssr: false,
  loading: () => <div className="space-y-6"><div className="h-64 bg-card border rounded-lg animate-pulse"></div></div>
})


// Protected by NextAuth middleware

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)
  let integration = null

  if (session?.user) {
    integration = await client.integrations.findFirst({
      where: {
        userId: (session.user as any).id,
        name: "INSTAGRAM"
      }
    })
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back! Here's what's happening with your Instagram automation.
              </p>
            </div>

            {/* Instagram Account Connection Status */}
            {integration && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Instagram className="w-5 h-5 text-primary" />
                      <CardTitle>Instagram Connected</CardTitle>
                    </div>
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Connected
                    </Badge>
                  </div>
                  <CardDescription>
                    Your Instagram Business account is connected and ready to use
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Account ID</p>
                      <p className="font-mono">{integration.instagramId}</p>
                    </div>
                    {integration.expiresAt && (
                      <div className="text-right">
                        <p className="text-muted-foreground">Expires</p>
                        <p>{new Date(integration.expiresAt).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Section */}
            <AnalyticsSection />

          </div>
        </main>
      </div>
    </div>
  )
}
