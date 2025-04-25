"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Key, BarChart3, PanelLeft, Shield, Package, Layers, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { fetchApps } from "@/lib/api-service"
import type { AppSchema } from "@/lib/schemas"
import type { z } from "zod"

interface SidebarNavigationProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

// This component is for use in specific views that need a secondary sidebar
// NOT as a main layout wrapper
export function SidebarNavigation({ isOpen, onToggle, className }: SidebarNavigationProps) {
  const [expandedSections, setExpandedSections] = useState({
    team: true,
    apps: true,
    resources: false,
    settings: false,
  })
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(isOpen)

  // API connection states
  const [apps, setApps] = useState<z.infer<typeof AppSchema>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadApps = async () => {
      try {
        setIsLoading(true)
        const appsData = await fetchApps()
        setApps(appsData)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch apps:", err)
        setError("Failed to load applications. Please try again.")
        // Fallback to mock data in case of error
        setApps([
          {
            id: "app_1",
            name: "Customer Portal",
            icon: "layers",
            status: "active",
            type: "web",
            clientId: "",
            clientSecret: "",
            redirectUris: [],
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "app_2",
            name: "Analytics Dashboard",
            icon: "bar-chart",
            status: "active",
            type: "web",
            clientId: "",
            clientSecret: "",
            redirectUris: [],
            createdAt: "",
            updatedAt: "",
          },
          {
            id: "app_3",
            name: "License Manager",
            icon: "key",
            status: "active",
            type: "web",
            clientId: "",
            clientSecret: "",
            redirectUris: [],
            createdAt: "",
            updatedAt: "",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadApps()
  }, [])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Helper function to get icon based on app type or icon property
  const getAppIcon = (app: z.infer<typeof AppSchema>) => {
    switch (app.icon || app.type) {
      case "layers":
        return <Layers className="h-4 w-4" />
      case "bar-chart":
        return <BarChart3 className="h-4 w-4" />
      case "key":
        return <Key className="h-4 w-4" />
      case "web":
        return <Layers className="h-4 w-4" />
      case "native":
        return <Package className="h-4 w-4" />
      case "spa":
        return <BarChart3 className="h-4 w-4" />
      case "service":
        return <Key className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div
      className={cn(
        "bg-keyauth-dark border-r border-keyauth-dark-border h-full flex flex-col transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-20",
        className,
      )}
    >
      <div className="h-16 border-b border-keyauth-dark-border flex items-center justify-between px-4">
        <div className={cn("flex items-center", !isOpen && "justify-center w-full")}>
          <div className="h-8 w-8 rounded-md bg-keyauth-blue/10 flex items-center justify-center text-keyauth-blue">
            <Shield className="h-5 w-5" />
          </div>
          {isOpen && <span className="ml-2 text-lg font-semibold">App Menu</span>}
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className={!isOpen ? "hidden" : ""}>
          <PanelLeft className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {/* App Navigation Items */}
          <NavItem
            href="/dashboard/apps"
            icon={<Package className="h-5 w-5" />}
            label="All Apps"
            isActive={pathname === "/dashboard/apps"}
            isCollapsed={!isOpen}
          />

          {isOpen && <Separator className="my-2 bg-keyauth-dark-border" />}

          {/* App List */}
          {isOpen && <div className="text-xs text-muted-foreground mb-2 px-2">Your Applications</div>}

          {/* Loading state */}
          {isLoading && isOpen && (
            <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">Loading apps...</div>
          )}

          {/* Error state */}
          {error && isOpen && (
            <div className="flex items-center text-sm text-red-500 p-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {/* Apps list */}
          {!isLoading &&
            apps.map((app) => (
              <NavItem
                key={app.id}
                href={`/dashboard/apps/${app.id}`}
                icon={getAppIcon(app)}
                label={app.name}
                isActive={pathname === `/dashboard/apps/${app.id}`}
                isCollapsed={!isOpen}
              />
            ))}
        </div>
      </ScrollArea>

      {/* Collapsed sidebar toggle button */}
      {!isOpen && (
        <Button variant="ghost" size="icon" onClick={onToggle} className="m-2">
          <PanelLeft className="h-5 w-5 rotate-180" />
        </Button>
      )}
    </div>
  )
}

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
  isCollapsed: boolean
  indented?: boolean
  className?: string
}

function NavItem({ href, icon, label, isActive, isCollapsed, indented = false, className }: NavItemProps) {
  return (
    <Link href={href} className="block">
      <div
        className={cn(
          "flex items-center p-2 rounded-md hover:bg-keyauth-dark-card cursor-pointer",
          isActive && "bg-keyauth-blue/10 text-keyauth-blue font-medium",
          isCollapsed && "justify-center",
          indented && "text-sm",
          className,
        )}
      >
        <div className={indented ? "w-4 h-4 mr-2" : "w-5 h-5 mr-2"}>{icon}</div>
        {!isCollapsed && <span className={indented ? "ml-1" : "ml-2"}>{label}</span>}
      </div>
    </Link>
  )
}
