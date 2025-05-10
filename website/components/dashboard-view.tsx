"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCards } from "./stats-cards"
import { ActivityFeed } from "./activity-feed"
import { useTeam } from "@/contexts/team-context"
import { Loader2 } from "lucide-react"
import { RequireTeam } from "./require-team"
import { CreateTeamModal } from "./create-team-modal"

export function DashboardView() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { selectedTeam } = useTeam()

  useEffect(() => {
    const loadStats = async () => {
      if (!selectedTeam) return

      try {
        setIsLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/dashboard`)

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard stats: ${response.status}`)
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [selectedTeam])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        {selectedTeam && (
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            Team: {selectedTeam.name}
          </div>
        )}
        <CreateTeamModal />
      </div>

      <RequireTeam>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading dashboard data...</span>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              {stats && <StatsCards stats={stats} />}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      {selectedTeam ? `${selectedTeam.name}'s recent activities` : "Loading team data..."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    {stats?.recentActivity ? (
                      <ActivityFeed activities={stats.recentActivity} />
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>User Growth</CardTitle>
                    <CardDescription>User growth over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.userGrowth ? (
                      <div className="h-[200px] flex items-end gap-2">
                        {stats.userGrowth.map((item: any, index: number) => (
                          <div key={index} className="relative flex flex-col items-center flex-1">
                            <div
                              className="w-full bg-primary rounded-sm"
                              style={{
                                height: `${(item.users / Math.max(...stats.userGrowth.map((i: any) => i.users))) * 100}%`,
                              }}
                            ></div>
                            <span className="text-xs mt-2">{item.month}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No growth data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>View detailed analytics for your applications.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Analytics content will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>View and generate reports.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Reports content will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification settings.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <p className="text-muted-foreground">Notifications content will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </RequireTeam>
    </div>
  )
}
