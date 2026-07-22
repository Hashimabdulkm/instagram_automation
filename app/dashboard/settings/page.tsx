"use client"

import { DashboardSidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Mail, User, Image as ImageIcon, Phone, Instagram, Plus, Trash2, Check } from "lucide-react"
import { updateContactInfo } from "@/actions/user/update-contact-info"
import { getContactInfo } from "@/actions/user/get-contact-info"
import { toast } from "sonner"
import { useSearchParams, useRouter } from "next/navigation"

type Integration = {
  id: string
  instagramId: string
  accountName: string | null
  username: string | null
  profilePicture: string | null
  expiresAt: string | null
}

export default function SettingsPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    additionalEmail: "",
    phone: "",
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<Integration[]>([])
  const [activeIntegrationId, setActiveIntegrationId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [switchingId, setSwitchingId] = useState<string | null>(null)

  // Show connect result toasts from URL params
  useEffect(() => {
    const connect = searchParams.get("connect")
    const reason = searchParams.get("reason")
    if (connect === "success") {
      toast.success("Instagram account connected successfully!")
      fetchAccounts()
    } else if (connect === "error") {
      const msg = reason === "already-linked"
        ? "This Instagram account is already linked to another user."
        : `Failed to connect account: ${reason || "unknown error"}`
      toast.error(msg)
    }
    if (connect) {
      // Clean the URL params without reload
      const url = new URL(window.location.href)
      url.searchParams.delete("connect")
      url.searchParams.delete("reason")
      router.replace(url.pathname + url.search, { scroll: false })
    }
  }, [searchParams])

  const fetchAccounts = () => {
    fetch("/api/integrations")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data.integrations || [])
        setActiveIntegrationId(data.activeIntegrationId)
      })
      .catch(() => {})
  }

  // Initialize form data when session loads
  useEffect(() => {
    async function loadContactInfo() {
      if (session?.user) {
        try {
          const contactInfo = await getContactInfo()
          setFormData({
            additionalEmail: contactInfo?.additionalEmail || "",
            phone: contactInfo?.phone || "",
          })
        } catch (error) {
          console.error("Failed to load contact info:", error)
        }
      }
      setLoading(false)
    }
    loadContactInfo()
    fetchAccounts()
  }, [session])

  const switchAccount = async (integrationId: string) => {
    setSwitchingId(integrationId)
    try {
      const res = await fetch("/api/instagram/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId }),
      })
      if (res.ok) {
        setActiveIntegrationId(integrationId)
        toast.success("Switched active account")
        router.refresh()
      }
    } finally {
      setSwitchingId(null)
    }
  }

  const removeAccount = async (integrationId: string) => {
    if (!confirm("Remove this Instagram account? This cannot be undone.")) return
    setRemovingId(integrationId)
    try {
      const res = await fetch(`/api/integrations?id=${integrationId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Account removed")
        fetchAccounts()
        router.refresh()
      } else {
        toast.error("Failed to remove account")
      }
    } finally {
      setRemovingId(null)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateContactInfo(formData)
      if (result.success) {
        toast.success("Contact information updated successfully!")
        // Reload the page to refresh session data
        // window.location.reload()
      } else {
        toast.error(result.error || "Failed to update contact information")
      }
    } catch (error) {
      console.error("Failed to save contact info:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setSaving(false)
    }
  }
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account and automation preferences</p>
            </div>

            <div className="grid gap-6">
              {/* Instagram Accounts */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Instagram className="w-5 h-5" />
                    Instagram Accounts
                  </CardTitle>
                  <CardDescription>Manage the Instagram accounts connected to your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {accounts.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2">No Instagram accounts connected yet.</p>
                  )}
                  {accounts.map((account) => {
                    const isActive = account.id === activeIntegrationId
                    const displayName = account.username ? `@${account.username}` : account.accountName || account.instagramId
                    const initials = (account.accountName || account.username || "IG").slice(0, 2).toUpperCase()
                    const isRemoving = removingId === account.id
                    const isSwitching = switchingId === account.id
                    return (
                      <div key={account.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={account.profilePicture || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-sm">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{displayName}</p>
                          {account.accountName && account.username && (
                            <p className="text-xs text-muted-foreground truncate">{account.accountName}</p>
                          )}
                          {isActive && (
                            <Badge variant="secondary" className="mt-1 text-xs">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!isActive && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => switchAccount(account.id)}
                              disabled={isSwitching}
                              className="text-xs"
                            >
                              {isSwitching ? "Switching…" : "Set Active"}
                            </Button>
                          )}
                          {isActive && <Check className="w-4 h-4 text-primary" />}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAccount(account.id)}
                            disabled={isRemoving}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}

                  <Button asChild variant="outline" className="w-full mt-2 gap-2">
                    <a href="/api/instagram/connect">
                      <Plus className="w-4 h-4" />
                      Add Instagram Account
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* User Profile Overview */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile Overview
                  </CardTitle>
                  <CardDescription>Your account information from Instagram</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session?.user ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{session.user.name || "User"}</h3>
                            <p className="text-sm text-muted-foreground">{(session.user as any).additionalEmail}</p>
                            <Badge variant="secondary" className="mt-1">
                              FREE
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {/* <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Instagram Email:</span>
                          <span>{session.user.email || "Not provided"}</span>
                        </div> */}
                        <div className="flex items-center space-x-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Name:</span>
                          <span>{session.user.name || "Not provided"}</span>
                        </div>
                        {(session.user as any).additionalEmail && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Email:</span>
                            <span>{(session.user as any).additionalEmail}</span>
                          </div>
                        )}
                        {(session.user as any).phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Phone:</span>
                            <span>{(session.user as any).phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No session data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Add optional contact details for notifications (name is from Instagram)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="additionalEmail">Additional Email (Optional)</Label>
                    <Input
                      id="additionalEmail"
                      type="email"
                      value={formData.additionalEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, additionalEmail: e.target.value }))}
                      placeholder="Enter your additional email address"
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Additional email is optional and will be used for notifications
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Enter your phone number"
                      disabled={loading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Phone number is optional and will be used for notifications
                    </p>
                  </div>
                  <Button onClick={handleSave} disabled={saving || loading}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>

              {/* <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Automation Settings</CardTitle>
                  <CardDescription>Configure your Instagram DM automation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-reply to new messages</Label>
                      <p className="text-sm text-muted-foreground">Automatically respond to incoming DMs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lead capture notifications</Label>
                      <p className="text-sm text-muted-foreground">Get notified when new leads are captured</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Campaign performance alerts</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts for campaign milestones</p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
