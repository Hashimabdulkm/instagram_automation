"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, BarChart3, Settings, Zap, ChevronLeft, ChevronRight, Boxes } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useSession } from "next-auth/react"
import Image from "next/image"



const navigation = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: Zap },
  // { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  // { name: "Products", href: "/dashboard/products", icon: Boxes },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()


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
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-sidebar border-r border-sidebar-border flex flex-col"
    >
      <div className="p-6 border-sidebar-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-15 h-15 rounded-lg flex items-center justify-center">
                <Image
                  src="/untitleddesign.png"
                  alt="Bot"
                  width={30}
                  height={30}
                  className="w-10 h-10"
                />
              </div>
              <span className="text-lg font-semibold text-sidebar-foreground">Instagram AI</span>
            </motion.div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <motion.div key={item.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className={cn("w-5 h-5", collapsed ? "mx-auto" : "mr-3")} />
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {item.name}
                  </motion.span>
                )}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div
          className={cn(
            "flex items-center space-x-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors cursor-pointer",
            collapsed && "justify-center",
          )}
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={session?.user?.image || "/professional-avatar.jpg"} alt={session?.user?.name || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 min-w-0"
            >
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {(session?.user as any)?.additionalEmail || session?.user?.email || "user@example.com"}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
