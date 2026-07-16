"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Mail, Clock, Check, CheckCheck } from "lucide-react"
import { useSession } from "next-auth/react"

interface LeadNotification {
  id: string
  leadName: string
  leadId: string
  triggerType: string
  message: string
  campaignName: string
  triggeredAt: string
  read: boolean
  automation: {
    name: string
  }
}

interface NotificationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationModal({ open, onOpenChange }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<LeadNotification[]>([])
  const [loading, setLoading] = useState(false)
  const [markingAsRead, setMarkingAsRead] = useState(false)
  const { data: session } = useSession()

  const loadNotifications = async () => {
    const userId = (session?.user as any)?.id as string | undefined
    if (!userId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/notifications?limit=20`)
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read)
    if (unreadNotifications.length === 0) return

    setMarkingAsRead(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationIds: unreadNotifications.map(n => n.id),
          read: true
        })
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        )
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    } finally {
      setMarkingAsRead(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadNotifications()
    }
  }, [open, session])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getTriggerIcon = (triggerType: string) => {
    return triggerType === "dm" ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />
  }

  const getTriggerColor = (triggerType: string) => {
    return triggerType === "dm" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Lead Notifications</DialogTitle>
              <DialogDescription>
                Latest leads from your automation campaigns
              </DialogDescription>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={markingAsRead}
              >
                {markingAsRead ? (
                  <Check className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCheck className="w-4 h-4 mr-2" />
                )}
                Mark all read
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No notifications yet. Your leads will appear here when automations are triggered.
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    !notification.read ? "bg-blue-50 border-blue-200" : "bg-background"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1 rounded ${getTriggerColor(notification.triggerType)}`}>
                          {getTriggerIcon(notification.triggerType)}
                        </div>
                        <span className="font-medium">
                          {notification.leadName || `User ${notification.leadId.slice(-6)}`}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {notification.campaignName}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatTime(notification.triggeredAt)}
                        <span>•</span>
                        <span className="capitalize">{notification.triggerType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
