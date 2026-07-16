"use client"

import { useState, useEffect } from "react"
import { Bell, Settings, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { NotificationModal } from "@/components/notification-modal"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"

export function DashboardHeader() {
  const { data: session } = useSession()
  const [notificationModalOpen, setNotificationModalOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch('/api/notifications/count')
        if (response.ok) {
          const data = await response.json()
          setUnreadCount(data.count)
        }
      } catch (error) {
        console.error("Error fetching unread count:", error)
      }
    }

    if (session) {
      fetchUnreadCount()
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [session])

  // Get user initials from name or email
  const getUserInitials = () => {
    if (session?.user?.name) {
      const names = session.user.name.split(' ')
      return names.map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2)
    }
    if (session?.user?.email) {
      return session.user.email.charAt(0).toUpperCase()
    }
    return "U"
  }
  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Instagram AI Logo"
              width={38}
              height={38}
              priority
              className="object-contain"
            />
            <span className="text-base text-size-30 font-semibold">Instagram AI</span>
          </Link>
          <div className="relative max-w-md">
            {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search campaigns, messages..."
              className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
            /> */}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {session?.user && (
            <>
              {/* Notifications */}
              <Button
                variant="ghost"
                size="sm"
                className="relative"
                onClick={() => setNotificationModalOpen(true)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>

                  <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </span>

                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {(session?.user as any)?.additionalEmail || session?.user?.email || "user@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem> */}
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Notification Modal */}
      <NotificationModal
        open={notificationModalOpen}
        onOpenChange={(open) => {
          setNotificationModalOpen(open)
          // Refresh unread count when modal closes
          if (!open) {
            fetch('/api/notifications/count')
              .then(res => res.json())
              .then(data => setUnreadCount(data.count))
              .catch(console.error)
          }
        }}
      />
    </header>
  )
}
