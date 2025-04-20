"use client"

import Link from "next/link"
import {
  BarChart3,
  Book,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Users,
  FileText,
  X,
  ExternalLink,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function DashboardSidebar({
  activeView,
  activeTab,
  setActiveView,
  setActiveTab,
  isOpen,
  isMobile,
  toggleSidebar,
}) {
  // Group the navigation items by category
  const navGroups = [
    {
      name: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      name: "Team & Access",
      items: [
        { id: "users", label: "Team Members", icon: Users, tab: "members" },
        { id: "roles", label: "Roles & Permissions", icon: Shield, tab: "roles" },
      ],
    },
    {
      name: "Applications",
      items: [
        { id: "applications", label: "Applications", icon: Globe },
        { id: "scopes", label: "OAuth Scopes", icon: Shield },
        { id: "api-docs", label: "API Documentation", icon: Book },
        {
          id: "public-docs",
          label: "Public API Docs",
          icon: ExternalLink,
          external: true,
          href: "/api-docs",
        },
      ],
    },
    {
      name: "Key Management",
      items: [{ id: "licenses", label: "License Keys", icon: Lock }],
    },
    {
      name: "Files & Storage",
      items: [{ id: "files", label: "File Storage", icon: Upload }],
    },
    {
      name: "Monitoring",
      items: [{ id: "logs", label: "Activity Logs", icon: FileText }],
    },
    {
      name: "System",
      items: [{ id: "settings", label: "Settings", icon: Settings }],
    },
  ]

  // If sidebar is closed and not on mobile, show collapsed version
  const isCollapsed = !isOpen && !isMobile

  // For mobile, we want to hide the sidebar completely when closed
  if (isMobile && !isOpen) {
    return null
  }

  const handleItemClick = (item) => {
    setActiveView(item.id)
    if (item.tab) {
      setActiveTab(item.tab)
    }
  }

  return (
    <div
      className={`
        ${isMobile ? "fixed inset-y-0 left-0 z-30" : "sticky top-0 h-full"}
        ${isCollapsed ? "w-[50px] sm:w-[60px]" : "w-[200px] sm:w-[240px]"}
        bg-white border-r transition-all duration-300 ease-in-out
      `}
    >
      <div className="flex min-h-full flex-col">
        <div className="flex h-12 sm:h-12 items-center justify-between border-b px-2 sm:px-3">
          <div
            className={`flex items-center gap-2 font-semibold overflow-hidden ${
              isCollapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            } transition-all duration-300`}
          >
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="text-base sm:text-lg whitespace-nowrap">Authio</span>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-7 w-7 sm:h-8 sm:w-8 rounded-full">
            {isMobile ? (
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : isCollapsed ? (
              <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2 scrollbar-thin">
          <TooltipProvider delayDuration={0}>
            <nav className="grid items-start px-2 text-sm font-medium">
              {navGroups.map((group, index) => (
                <div key={group.name} className="py-1 sm:py-2">
                  {index > 0 && <div className="h-px bg-gray-200 my-1 sm:my-2 mx-2 sm:mx-3" />}
                  {!isCollapsed && (
                    <div className="px-3 mb-1 sm:mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.name}
                    </div>
                  )}
                  {group.items.map((item) => (
                    <Tooltip key={item.id} delayDuration={0}>
                      <TooltipTrigger asChild>
                        {item.external ? (
                          <Link
                            href={item.href}
                            className={`flex items-center gap-1.5 sm:gap-2 rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 transition-all active:bg-gray-200 w-full justify-${
                              isCollapsed ? "center" : "start"
                            } text-muted-foreground hover:text-foreground hover:bg-gray-50`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            {!isCollapsed && <span className="truncate text-xs sm:text-sm">{item.label}</span>}
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleItemClick(item)}
                            className={`flex items-center gap-1.5 sm:gap-2 rounded-md px-1.5 sm:px-2 py-1 sm:py-1.5 transition-all active:bg-gray-200 w-full justify-${
                              isCollapsed ? "center" : "start"
                            } ${
                              activeView === item.id
                                ? "bg-gray-100 text-foreground font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-gray-50"
                            }`}
                          >
                            <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                            {!isCollapsed && <span className="truncate text-xs sm:text-sm">{item.label}</span>}
                          </button>
                        )}
                      </TooltipTrigger>
                      {isCollapsed && !isMobile && (
                        <TooltipContent side="right" className="font-normal text-xs">
                          {item.label}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  ))}
                </div>
              ))}
            </nav>
          </TooltipProvider>
        </div>
        <div className="mt-auto p-3 sm:p-2 border-t border-border">
          <Button
            variant="outline"
            className={`w-full justify-${isCollapsed ? "center" : "start"} active:bg-gray-200 transition-colors h-8 sm:h-9 text-xs sm:text-sm`}
            size="sm"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}
