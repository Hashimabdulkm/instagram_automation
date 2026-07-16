import { ReactNode } from "react"
import { DashboardSidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/header"
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { prefetchUserProfile, pretetchUserAutomations } from "@/react-query/prefetch"


export default async function DashboardSlugLayout({
  children,
}: {
  children: ReactNode
}) {
  const query = new QueryClient()
  await Promise.all([
    prefetchUserProfile(query),
    pretetchUserAutomations(query),
  ])
  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="flex h-screen bg-background">
        <DashboardSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </HydrationBoundary>
  )
}


