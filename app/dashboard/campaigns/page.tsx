"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import Link from "next/link"
import { Plus, Play, Pause, MoreHorizontal, Loader2, Edit, Trash2, Eye } from "lucide-react"
import { useSession } from "next-auth/react"
import { useCampaigns, useToggleCampaignStatus, useDeleteCampaign } from "@/hooks/campaigns-queries"

export default function CampaignsPage() {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; campaignId: string | null; campaignName: string }>({
    open: false,
    campaignId: null,
    campaignName: ""
  })
  const { data: session, status } = useSession()
  const router = useRouter()

  // React Query hooks
  const { data: campaigns = [], isLoading, error } = useCampaigns()
  const toggleCampaignMutation = useToggleCampaignStatus()
  const deleteCampaignMutation = useDeleteCampaign()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  const handleToggleStatus = (campaignId: string, currentStatus: string) => {
    toggleCampaignMutation.mutate({ campaignId, currentStatus })
  }

  const handleDeleteCampaign = () => {
    if (!deleteDialog.campaignId) return
    deleteCampaignMutation.mutate(deleteDialog.campaignId, {
      onSuccess: () => {
        setDeleteDialog({ open: false, campaignId: null, campaignName: "" })
      },
    })
  }

  const openDeleteDialog = (campaignId: string, campaignName: string) => {
    setDeleteDialog({ open: true, campaignId, campaignName })
  }

  // Show loading while checking authentication
  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Campaigns</h1>
                <p className="text-muted-foreground">Manage your Instagram DM automation campaigns</p>
              </div>
              <Button asChild>
                <Link href="/dashboard/campaigns/new">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Link>
              </Button>
            </div>

            <div className="grid gap-4">
              {isLoading ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              ) : error ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-destructive">Error loading campaigns. Please try again.</p>
                  </CardContent>
                </Card>
              ) : campaigns.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground mb-4">No campaigns yet</p>
                    <Button asChild>
                      <Link href="/dashboard/campaigns/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Campaign
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                campaigns.map((campaign) => (
                  <Card key={campaign.id} className="border-0 shadow-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{campaign.name}</CardTitle>
                          <CardDescription>{campaign.messages || 0} messages sent</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                            {campaign.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(campaign.id, campaign.status)}
                            disabled={toggleCampaignMutation.isPending}
                          >
                            {toggleCampaignMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : campaign.status === "active" ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <MoreHorizontal className="w-4 h-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/campaigns/view/${campaign.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/campaigns/edit/${campaign.id}`)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteDialog(campaign.id, campaign.name)}
                                variant="destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        Conversion rate: <span className="font-medium text-foreground">{campaign.conversions || 0}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.campaignName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              disabled={deleteCampaignMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCampaignMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
