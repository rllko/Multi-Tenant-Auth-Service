"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityFeed } from "@/components/activity-feed"
import { fetchActivityLogs } from "@/lib/api-service"
import type { ActivityLogSchema } from "@/lib/schemas"
import type { z } from "zod"
import { AlertCircle } from "lucide-react"

export function ActivityView() {
  const [activities, setActivities] = useState<z.infer<typeof ActivityLogSchema>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    const loadActivityLogs = async () => {
      try {
        setIsLoading(true)
        const logs = await fetchActivityLogs(page, 20)
        setActivities((prev) => (page === 1 ? logs : [...prev, ...logs]))
        setHasMore(logs.length === 20) // If we got less than 20 items, there's no more data
        setError(null)
      } catch (err) {
        console.error("Failed to fetch activity logs:", err)
        setError("Failed to load activity logs. Please try again.")
        // Set fallback data
        setActivities([
          {
            id: "1",
            action: "login",
            resource: "auth",
            userId: "user_1",
            userName: "John Doe",
            timestamp: new Date().toISOString(),
            ipAddress: "192.168.1.1",
          },
          {
            id: "2",
            action: "create",
            resource: "app",
            resourceId: "app_1",
            userId: "user_1",
            userName: "John Doe",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            ipAddress: "192.168.1.1",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadActivityLogs()
  }, [page])

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
          <TabsTrigger value="apps">Applications</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>A detailed log of all activities in your account.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && page === 1 ? (
                <div className="h-[400px] bg-muted rounded-lg animate-pulse"></div>
              ) : (
                <>
                  <ActivityFeed activities={activities} />

                  {activities.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-muted-foreground">No activity logs found</div>
                  )}

                  {hasMore && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {isLoading ? "Loading..." : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="auth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Activity</CardTitle>
              <CardDescription>Login, logout, and authentication-related activities.</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities.filter((a) => a.resource === "auth")} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="apps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Activity</CardTitle>
              <CardDescription>Activities related to application management.</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities.filter((a) => a.resource === "app")} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
              <CardDescription>Team member and role management activities.</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={activities.filter((a) => a.resource === "team")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
