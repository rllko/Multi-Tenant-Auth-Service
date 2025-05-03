"use client"

import { useState, useEffect } from "react"
import { DashboardSidebar } from "./components/dashboard-sidebar"
import { DashboardHeader } from "./components/dashboard-header"
import { AnalyticsView } from "./components/analytics-view"
import { SettingsView } from "./components/settings-view"
import { ApplicationsView } from "./components/applications-view"
import { ScopesView } from "./components/scopes-view"
import { LicenseKeysView } from "./components/license-keys-view"
import { ApiDocumentation } from "./components/api-documentation"
import { LoggingView } from "./components/logging-view"
import { TeamAccessView } from "./components/team-access-view"
import { FilesView } from "./components/files-view"
import { Toaster } from "./components/ui/toaster"
import { DashboardView } from "./components/dashboard-view"
import { AppTeamPermissions } from "./components/app-team-permissions"
import { MultiTenantTeamManagement } from "./components/multi-tenant-team-management"

export default function Dashboard() {
  const [activeView, setActiveView] = useState("dashboard")
  const [activeTab, setActiveTab] = useState("members") // Default tab for TeamAccessView
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Close sidebar when view changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [activeView, isMobile])

  // Update the main container to have a fixed height and better overflow handling
  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        activeView={activeView}
        activeTab={activeTab}
        setActiveView={setActiveView}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        isMobile={isMobile}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 w-full overflow-hidden">
        <DashboardHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-2 sm:p-3 md:p-4 lg:p-6">
            {activeView === "dashboard" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">Dashboard</h1>
                <DashboardView />
              </>
            )}

            {activeView === "users" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">
                  Team & Access Management
                </h1>
                <MultiTenantTeamManagement />
              </>
            )}

            {activeView === "roles" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">
                  Roles & Permissions
                </h1>
                <TeamAccessView initialTab="roles" />
              </>
            )}

            {activeView === "applications" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">Applications</h1>
                <ApplicationsView />
              </>
            )}

            {activeView === "app_permissions" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">
                  Application Permissions
                </h1>
                <AppTeamPermissions />
              </>
            )}

            {activeView === "scopes" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">OAuth Scopes</h1>
                <ScopesView />
              </>
            )}

            {activeView === "analytics" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">Analytics</h1>
                <AnalyticsView />
              </>
            )}

            {activeView === "settings" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">Settings</h1>
                <SettingsView />
              </>
            )}

            {activeView === "licenses" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">License Keys</h1>
                <LicenseKeysView />
              </>
            )}

            {activeView === "api-docs" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">
                  API Documentation
                </h1>
                <ApiDocumentation />
              </>
            )}

            {activeView === "logs" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">Activity Logs</h1>
                <LoggingView />
              </>
            )}

            {activeView === "files" && (
              <>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight mb-3 sm:mb-4">File Storage</h1>
                <FilesView />
              </>
            )}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}
