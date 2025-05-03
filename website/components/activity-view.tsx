"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ActivityFeed } from "@/components/activity-feed"
import { AlertCircle, Loader2 } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { Button } from "@/components/ui/button"
import { ApiError } from "./api-error"

export function ActivityView() {
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { selectedTeam, teamsLoaded, teams } = useTeam()

  const loadActivityLogs = useCallback(
    async (pageNum = 1, append = false) => {
      if (!selectedTeam) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        if (pageNum === 1) {
          setError(null)
        }

        // Simulate API call with a timeout to test error handling
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out")), 15000)
        })

        // Real API call to fetch activity logs
        const fetchPromise = fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/activity?page=${pageNum}&limit=20`,
        ).then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch activity logs: ${response.status}`)
          }
          return response.json()
        })

        // Race between fetch and timeout
        const data = (await Promise.race([fetchPromise, timeoutPromise])) as any[]
        setActivities((prev) => (append ? [...prev, ...data] : data))
        setHasMore(data.length === 20) // If we got less than 20 items, there's no more data
      } catch (err) {
        console.error("Failed to fetch activity logs:", err)
        setError("Failed to load activity logs. Please check your connection and try again.")
        if (!append) {
          setActivities([])
        }
      } finally {
        setIsLoading(false)
        setIsRetrying(false)
      }
    },
    [selectedTeam],
  )

  useEffect(() => {
    if (selectedTeam) {
      loadActivityLogs(page, page > 1)
    } else {
      setIsLoading(false)
    }
  }, [selectedTeam, page, loadActivityLogs])

  const handleRetry = () => {
    setIsRetrying(true)
    setPage(1) // Reset to first page on retry
    loadActivityLogs(1, false)
  }

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

      {/* No team selected message */}
      {teamsLoaded && !selectedTeam && !isLoading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">No team selected</p>
            <p className="text-sm">
              {teams.length === 0
                ? "You don't have any teams yet. Create a team to get started."
                : "Please select a team to view activity logs."}
            </p>
          </div>
        </div>
      )}

      {/* Always show error if present */}
      {error && <ApiError message={error} onRetry={handleRetry} isRetrying={isRetrying} />}

      {teamsLoaded && selectedTeam && (
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
                {/* Show loading indicator only if not retrying and no error */}
                {isLoading && page === 1 && !isRetrying && !error ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Loading activity logs...</span>
                  </div>
                ) : (
                  <>
                    {!error && (
                      <>
                        <ActivityFeed activities={activities} />

                        {activities.length === 0 && !isLoading && (
                          <div className="text-center py-8 text-muted-foreground">No activity logs found</div>
                        )}

                        {hasMore && activities.length > 0 && (
                          <div className="mt-4 text-center">
                            <Button onClick={loadMore} disabled={isLoading} variant="outline">
                              {isLoading && page > 1 ? (
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
                {!error && <ActivityFeed activities={activities.filter((a) => a.resource === "auth")} />}
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
                {!error && <ActivityFeed activities={activities.filter((a) => a.resource === "app")} />}
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
                {!error && <ActivityFeed activities={activities.filter((a) => a.resource === "team")} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
