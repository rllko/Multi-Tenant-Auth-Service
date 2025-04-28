"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Layers, Key, AlertCircle } from "lucide-react"
import { StatsCards } from "@/components/stats-cards"
import { ActivityFeed } from "@/components/activity-feed"
import { fetchDashboardStats } from "@/lib/api-service"
import type { DashboardStatsSchema } from "@/lib/schemas"
import type { z } from "zod"

interface DashboardViewProps {
  userRole: "admin" | "member"
}

export function DashboardView({ userRole }: DashboardViewProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for tenant stats
  const tenantStats = {
    activeUsers: 24,
    totalUsers: 30,
    activeApps: 3,
    totalApps: 5,
    activeOAuthClients: 8,
    totalOAuthClients: 12,
    storageUsed: 2.4, // GB
    storageTotal: 10, // GB
  }

  // Mock data for recent activity
  const recentActivity = [
    {
      id: "act_1",
      timestamp: "2023-06-15T14:30:00Z",
      user: {
        name: "John Doe",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      action: "Added user Alice Brown to Customer Portal with Viewer role",
      type: "team",
    },
    {
      id: "act_2",
      timestamp: "2023-06-14T10:15:00Z",
      user: {
        name: "Jane Smith",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      action: "Created new OAuth client 'Analytics Bot'",
      type: "oauth",
    },
    {
      id: "act_3",
      timestamp: "2023-06-13T16:45:00Z",
      user: {
        name: "System",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      action: "Rotated secret for 'License Manager Bot' client",
      type: "oauth",
    },
  ]

  // Mock data for apps
  const apps = [
    {
      id: "app_1",
      name: "Customer Portal",
      description: "Customer-facing portal for license management",
      icon: <Layers className="h-6 w-6 text-blue-500" />,
      userAccess: "manage", // "manage", "view", "none"
      activeUsers: 15,
      totalUsers: 20,
    },
    {
      id: "app_2",
      name: "Analytics Dashboard",
      description: "Internal analytics and reporting",
      icon: <BarChart3 className="h-6 w-6 text-green-500" />,
      userAccess: "view",
      activeUsers: 8,
      totalUsers: 10,
    },
    {
      id: "app_3",
      name: "License Manager",
      description: "License key generation and validation",
      icon: <Key className="h-6 w-6 text-amber-500" />,
      userAccess: userRole === "admin" ? "manage" : "none",
      activeUsers: 5,
      totalUsers: 8,
    },
  ]

  // Filter apps based on user role and access
  const accessibleApps = apps.filter((app) => userRole === "admin" || app.userAccess !== "none")

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const [stats, setStats] = useState<z.infer<typeof DashboardStatsSchema> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setIsLoading(true)
        const dashboardData = await fetchDashboardStats()
        setStats(dashboardData)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err)
        setError("Failed to load dashboard data. Please try again.")
        // Set fallback data
        setStats({
          totalApps: 0,
          totalUsers: 0,
          totalSessions: 0,
          activeKeys: 0,
          apiRequests: {
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
          },
          newUsers: {
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
          },
          recentActivity: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardStats()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="grid gap-4">
          <div className="h-24 bg-muted rounded-lg animate-pulse"></div>
          <div className="h-[400px] bg-muted rounded-lg animate-pulse"></div>
        </div>
      ) : (
        <>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <StatsCards
                totalApps={stats?.totalApps || 0}
                totalUsers={stats?.totalUsers || 0}
                totalSessions={stats?.totalSessions || 0}
                activeKeys={stats?.activeKeys || 0}
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      {stats?.recentActivity?.length || 0} activities in the last 24 hours
                    </CardDescription>
                  </CardHeader>
                  {/*<CardContent>*/}
                  {/*  <ActivityFeed activities={stats?.recentActivity || []} />*/}
                  {/*</CardContent>*/}
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>API Usage</CardTitle>
                    <CardDescription>API requests over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      {stats?.apiRequests.thisMonth || 0} requests this month
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7">
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>Detailed analytics for your applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      Analytics data will be displayed here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7">
                  <CardHeader>
                    <CardTitle>Reports</CardTitle>
                    <CardDescription>Generate and view reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      Reports will be displayed here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7">
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>System notifications and alerts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                      Notifications will be displayed here
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
