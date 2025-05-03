"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/toaster"
import { useTheme } from "next-themes"
import { TenantSwitcher } from "./tenant-switcher"
import { ActivityFeed } from "./activity-feed"
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal"
import { useTeam } from "@/contexts/team-context"
import { ErrorBoundary } from "@/components/error-boundary"
import {
  Home,
  Users,
  Package,
  Settings,
  ChevronRight,
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  Keyboard,
  PanelLeft,
  Shield,
  Activity,
  Store,
  BarChart2,
  Key,
  Plus,
  Loader2,
} from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: "admin" | "member"
}

export function DashboardLayout({ children, userRole = "admin" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activityFeedOpen, setActivityFeedOpen] = useState(false)
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    team: true,
    apps: true,
  })
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const { selectedTeam } = useTeam()
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch apps when the selected team changes
  useEffect(() => {
    const fetchApps = async () => {
      if (!selectedTeam) return

      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps`)

        if (!response.ok) {
          throw new Error(`Failed to fetch applications: ${response.status}`)
        }

        const data = await response.json()
        setApps(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch applications:", err)
        setError("Failed to load applications")
      } finally {
        setLoading(false)
      }
    }

    fetchApps()
  }, [selectedTeam])

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + / to toggle keyboard shortcuts modal
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault()
        setShortcutsModalOpen(true)
      }

      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault()
        setSidebarOpen((prev) => !prev)
      }

      // Ctrl/Cmd + J to toggle activity feed
      if ((e.ctrlKey || e.metaKey) && e.key === "j") {
        e.preventDefault()
        setActivityFeedOpen((prev) => !prev)
      }

      // Escape to close modals
      if (e.key === "Escape") {
        if (shortcutsModalOpen) setShortcutsModalOpen(false)
        if (activityFeedOpen) setActivityFeedOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [shortcutsModalOpen, activityFeedOpen])

  // Ensure theme is initialized
  useEffect(() => {
    // This ensures the theme is properly initialized and applied
    const currentTheme = localStorage.getItem("theme") || "system"
    if (currentTheme) {
      setTheme(currentTheme)
    }
  }, [setTheme])

  // Get app icon based on type
  const getAppIcon = (type) => {
    switch (type) {
      case "web":
        return <Store className="h-4 w-4" />
      case "service":
        return <Key className="h-4 w-4" />
      case "spa":
        return <BarChart2 className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-[#121212]">
      {/* Sidebar */}
      <div
        className={cn(
          "bg-card dark:bg-[#1E1E1E] border-r border-border h-screen flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-20",
        )}
      >
        <div className="h-16 border-b border-border flex items-center justify-between px-4">
          <div className={cn("flex items-center", !sidebarOpen && "justify-center w-full")}>
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Shield className="h-5 w-5" />
            </div>
            {sidebarOpen && <span className="ml-2 text-lg font-semibold">KeyAuth</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={!sidebarOpen ? "hidden" : ""}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className={cn("p-3", !sidebarOpen && "p-2")}>
          <TenantSwitcher isCollapsed={!sidebarOpen} />
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {/* Dashboard */}
            <NavItem
              href="/dashboard"
              icon={<Home className="h-5 w-5" />}
              label="Dashboard"
              isActive={pathname === "/dashboard"}
              isCollapsed={!sidebarOpen}
            />

            {/* Team Section */}
            <div className="pt-2">
              <div
                className={cn(
                  "flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer",
                  !sidebarOpen && "justify-center",
                )}
                onClick={() => sidebarOpen && toggleSection("team")}
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  {sidebarOpen && <span className="ml-2 font-medium">Team</span>}
                </div>
                {sidebarOpen &&
                  (expandedSections.team ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </div>
              {sidebarOpen && expandedSections.team && (
                <div className="ml-4 mt-1 space-y-1">
                  <NavItem
                    href="/dashboard/team/members"
                    icon={<Users className="h-4 w-4" />}
                    label="Members"
                    isActive={pathname === "/dashboard/team/members"}
                    isCollapsed={false}
                    indented
                  />
                  <NavItem
                    href="/dashboard/team/roles"
                    icon={<Shield className="h-4 w-4" />}
                    label="Roles"
                    isActive={pathname === "/dashboard/team/roles"}
                    isCollapsed={false}
                    indented
                  />
                  <NavItem
                    href="/dashboard/team/activity"
                    icon={<Activity className="h-4 w-4" />}
                    label="Activity"
                    isActive={pathname === "/dashboard/team/activity"}
                    isCollapsed={false}
                    indented
                  />
                </div>
              )}
            </div>

            {/* Apps Section */}
            <div className="pt-2">
              <div
                className={cn(
                  "flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer",
                  !sidebarOpen && "justify-center",
                )}
                onClick={() => sidebarOpen && toggleSection("apps")}
              >
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-green-500 dark:text-green-400" />
                  {sidebarOpen && <span className="ml-2 font-medium">Apps</span>}
                </div>
                {sidebarOpen &&
                  (expandedSections.apps ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
              </div>
              {sidebarOpen && expandedSections.apps && (
                <div className="ml-4 mt-1 space-y-1">
                  {loading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : error ? (
                    <div className="text-xs text-red-500 p-2">Failed to load apps</div>
                  ) : apps.length > 0 ? (
                    apps.map((app) => (
                      <NavItem
                        key={app.id}
                        href={`/dashboard/apps/${app.id}`}
                        icon={getAppIcon(app.type)}
                        label={app.name}
                        isActive={pathname === `/dashboard/apps/${app.id}`}
                        isCollapsed={false}
                        indented
                      />
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground p-2">No apps found</div>
                  )}
                  {userRole === "admin" && (
                    <NavItem
                      href="/dashboard/apps"
                      icon={<Plus className="h-4 w-4" />}
                      label="Manage Apps"
                      isActive={pathname === "/dashboard/apps"}
                      isCollapsed={false}
                      indented
                      className="text-muted-foreground hover:text-foreground"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Settings */}
            <NavItem
              href="/dashboard/settings"
              icon={<Settings className="h-5 w-5" />}
              label="Settings"
              isActive={pathname === "/dashboard/settings"}
              isCollapsed={!sidebarOpen}
            />

            <Separator className="my-4" />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              className={cn("w-full justify-start", !sidebarOpen && "justify-center px-0")}
              onClick={() => {
                const newTheme = theme === "dark" ? "light" : "dark"
                setTheme(newTheme)
              }}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
              {sidebarOpen && <span className="ml-2">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
            </Button>

            {/* Keyboard Shortcuts */}
            <div
              className={cn(
                "flex items-center p-2 rounded-md hover:bg-accent cursor-pointer",
                !sidebarOpen && "justify-center",
              )}
              onClick={() => setShortcutsModalOpen(true)}
            >
              <Keyboard className="h-5 w-5" />
              {sidebarOpen && <span className="ml-2">Keyboard Shortcuts</span>}
            </div>

            {/* Activity Feed Toggle */}
            <div
              className={cn(
                "flex items-center p-2 rounded-md hover:bg-accent cursor-pointer",
                !sidebarOpen && "justify-center",
                activityFeedOpen && "bg-accent",
              )}
              onClick={() => setActivityFeedOpen(!activityFeedOpen)}
            >
              <Activity className="h-5 w-5" />
              {sidebarOpen && <span className="ml-2">Activity Feed</span>}
            </div>

            {/* Logout */}
            <div
              className={cn(
                "flex items-center p-2 rounded-md hover:bg-destructive/10 hover:text-destructive cursor-pointer mt-4",
                !sidebarOpen && "justify-center",
              )}
            >
              <LogOut className="h-5 w-5" />
              {sidebarOpen && <span className="ml-2">Logout</span>}
            </div>
          </div>
        </ScrollArea>

        {/* Collapsed sidebar toggle button */}
        {!sidebarOpen && (
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="m-2">
            <PanelLeft className="h-5 w-5 rotate-180" />
          </Button>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>

        {/* Activity Feed Sidebar */}
        {activityFeedOpen && <ActivityFeed onClose={() => setActivityFeedOpen(false)} />}
      </div>

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)} />

      <Toaster />
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
          "flex items-center p-2 rounded-md hover:bg-accent cursor-pointer",
          isActive && "bg-accent",
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
