"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityFeed } from "@/components/activity-feed"
import { AlertCircle, Loader2 } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { Button } from "@/components/ui/button"

export function ActivityView() {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { selectedTeam } = useTeam()

  useEffect(() => {
    const loadActivityLogs = async () => {
      if (!selectedTeam) return

      try {
        setIsLoading(true)

        // Real API call to fetch activity logs
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/activity?page=${page}&limit=20`,
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch activity logs: ${response.status}`)
        }

        const data = await response.json()
        setActivities((prev) => (page === 1 ? data : [...prev, ...data]))
        setHasMore(data.length === 20) // If we got less than 20 items, there's no more data
        setError(null)
      } catch (err) {
        console.error("Failed to fetch activity logs:", err)
        setError("Failed to load activity logs. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadActivityLogs()
  }, [page, selectedTeam])

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prev) => prev + 1)
    }
  }

  return (
    <div className="space-y-4">
      {/* Team context banner */}
      {selectedTeam && (
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-semibold text-primary">{selectedTeam.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-medium">Team: {selectedTeam.name}</h3>
              <p className="text-xs text-muted-foreground">Viewing activity logs for this team</p>
            </div>
          </div>
        </div>
      )}

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
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading activity logs...</span>
                </div>
              ) : (
                <>
                  <ActivityFeed activities={activities} />

                  {activities.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-muted-foreground">No activity logs found</div>
                  )}

                  {hasMore && (
                    <div className="mt-4 text-center">
                      <Button onClick={loadMore} disabled={isLoading} variant="outline">
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Load More"
                        )}
                      </Button>
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
