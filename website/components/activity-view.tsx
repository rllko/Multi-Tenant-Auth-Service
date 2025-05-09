"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Download, Filter, RefreshCw, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityViewProps {
  activities: any[]
  teamId: string
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function ActivityView({ activities = [], teamId, onRefresh, isRefreshing = false }: ActivityViewProps) {
  const [date, setDate] = useState<Date>()
  const [isFiltering, setIsFiltering] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activityType, setActivityType] = useState("all")

  // Filter activities based on search query and activity type
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
        searchQuery === "" ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = activityType === "all" || activity.type === activityType

    return matchesSearch && matchesType
  })

  return (
      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="user">User Activity</TabsTrigger>
            <TabsTrigger value="system">System Events</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsFiltering(!isFiltering)}>
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
                  <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
            )}
          </div>
        </div>

        {isFiltering && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                          id="search"
                          type="search"
                          placeholder="Search activities..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="activity-type">Activity Type</Label>
                    <Select value={activityType} onValueChange={setActivityType}>
                      <SelectTrigger id="activity-type" className="w-full md:w-[180px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="create">Create</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="delete">Delete</SelectItem>
                        <SelectItem value="permission">Permission Change</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal md:w-[240px]",
                                !date && "text-muted-foreground",
                            )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Showing {filteredActivities.length} activities for team {teamId}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredActivities.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">No activity records found</div>
              ) : (
                  filteredActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-4 rounded-md border p-4">
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.description || "Activity description"}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{activity.user?.name || "Unknown user"}</span>
                            <span className="mx-1">•</span>
                            <span>{activity.timestamp || new Date().toISOString()}</span>
                            <span className="mx-1">•</span>
                            <span className="capitalize">{activity.type || "action"}</span>
                          </div>
                        </div>
                        <div
                            className={cn(
                                "rounded-full px-2 py-1 text-xs font-medium",
                                activity.type === "login" && "bg-blue-100 text-blue-800",
                                activity.type === "create" && "bg-green-100 text-green-800",
                                activity.type === "update" && "bg-amber-100 text-amber-800",
                                activity.type === "delete" && "bg-red-100 text-red-800",
                                activity.type === "permission" && "bg-purple-100 text-purple-800",
                            )}
                        >
                          {activity.type || "Action"}
                        </div>
                      </div>
                  ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>User-initiated actions and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">Filter set to user activity</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Events</CardTitle>
              <CardDescription>Automated system events and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">Filter set to system events</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>Security-related events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">Filter set to security events</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
  )
}
