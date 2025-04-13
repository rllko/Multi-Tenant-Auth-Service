"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { OrganizationSelector } from "./organization-selector"
import {
  Building,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Key,
  Users,
  ArrowRight,
  Plus,
  Upload,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Mock data for organizations
const organizations = [
  { id: "org_1", name: "Acme Inc.", members: 12 },
  { id: "org_2", name: "Globex Corporation", members: 8 },
  { id: "org_3", name: "Initech", members: 5 },
]

// Mock data for recent activities
const recentActivities = [
  {
    id: "act_1",
    type: "license_created",
    user: "john@example.com",
    timestamp: "2023-07-15T14:32:45Z",
    details: { key: "KEYAUTH-1234-5678-9ABC-DEFG", plan: "Pro" },
    organization: "Acme Inc.",
  },
  {
    id: "act_2",
    type: "user_login",
    user: "jane@example.com",
    timestamp: "2023-07-15T13:15:30Z",
    details: { ip: "192.168.1.1", location: "New York, USA" },
    organization: "Acme Inc.",
  },
  {
    id: "act_3",
    type: "application_created",
    user: "admin@example.com",
    timestamp: "2023-07-14T11:45:12Z",
    details: { name: "Web Dashboard", type: "web" },
    organization: "Acme Inc.",
  },
  {
    id: "act_4",
    type: "file_uploaded",
    user: "bob@example.com",
    timestamp: "2023-07-14T10:20:45Z",
    details: { name: "documentation.pdf", size: "2.5 MB" },
    organization: "Globex Corporation",
  },
  {
    id: "act_5",
    type: "user_invited",
    user: "admin@example.com",
    timestamp: "2023-07-13T09:05:22Z",
    details: { email: "new.user@example.com", role: "Developer" },
    organization: "Acme Inc.",
  },
]

// Mock data for applications
const applications = [
  {
    id: "app_1",
    name: "Web Dashboard",
    type: "web",
    status: "active",
    requests: 12500,
    organization: "Acme Inc.",
  },
  {
    id: "app_2",
    name: "Discord Bot",
    type: "service",
    status: "active",
    requests: 8700,
    organization: "Acme Inc.",
  },
  {
    id: "app_3",
    name: "License Manager Bot",
    type: "service",
    status: "active",
    requests: 4300,
    organization: "Globex Corporation",
  },
]

export function DashboardView() {
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0])

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org)
  }

  // Filter activities and applications by selected organization
  const filteredActivities = recentActivities.filter((activity) => activity.organization === selectedOrganization.name)
  const filteredApplications = applications.filter((app) => app.organization === selectedOrganization.name)

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case "license_created":
        return <Key className="h-4 w-4 text-blue-500" />
      case "user_login":
        return <Users className="h-4 w-4 text-green-500" />
      case "application_created":
        return <Globe className="h-4 w-4 text-purple-500" />
      case "file_uploaded":
        return <FileText className="h-4 w-4 text-orange-500" />
      case "user_invited":
        return <Users className="h-4 w-4 text-indigo-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  // Get activity description
  const getActivityDescription = (activity) => {
    switch (activity.type) {
      case "license_created":
        return (
          <>
            <span className="font-medium">{activity.user}</span> created a new license key{" "}
            <span className="font-mono text-xs">{activity.details.key.substring(0, 10)}...</span>
          </>
        )
      case "user_login":
        return (
          <>
            <span className="font-medium">{activity.user}</span> logged in from{" "}
            <span className="font-medium">{activity.details.location}</span>
          </>
        )
      case "application_created":
        return (
          <>
            <span className="font-medium">{activity.user}</span> created a new application{" "}
            <span className="font-medium">{activity.details.name}</span>
          </>
        )
      case "file_uploaded":
        return (
          <>
            <span className="font-medium">{activity.user}</span> uploaded{" "}
            <span className="font-medium">{activity.details.name}</span> ({activity.details.size})
          </>
        )
      case "user_invited":
        return (
          <>
            <span className="font-medium">{activity.user}</span> invited{" "}
            <span className="font-medium">{activity.details.email}</span> as {activity.details.role}
          </>
        )
      default:
        return <span>Unknown activity</span>
    }
  }

  // Quick action items
  const quickActions = [
    { href: "#applications", icon: Plus, label: "Create Application" },
    { href: "#licenses", icon: Key, label: "Generate License Key" },
    { href: "#users", icon: Users, label: "Invite Team Member" },
    { href: "#files", icon: Upload, label: "Upload File" },
    { href: "/api-docs", icon: ExternalLink, label: "View API Documentation", external: true },
  ]

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Organization Selector */}
      <OrganizationSelector
        organizations={organizations}
        selectedOrganization={selectedOrganization}
        onOrganizationChange={handleOrganizationChange}
      />

      {/* Organization Context Banner */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-2 sm:p-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <Building className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-medium text-sm sm:text-base">Organization Dashboard</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Overview for <span className="font-medium">{selectedOrganization.name}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-3 pb-1.5">
            <CardTitle className="text-sm sm:text-base">Recent Activity</CardTitle>
            <CardDescription className="text-xs">Latest actions in your organization</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <div className="px-4 sm:px-6">
              {filteredActivities.length === 0 ? (
                <div className="py-6 sm:py-8 text-center text-muted-foreground text-sm">No recent activities found</div>
              ) : (
                <div className="divide-y">
                  {filteredActivities.map((activity) => (
                    <div key={activity.id} className="py-2 sm:py-3 flex items-start gap-2 sm:gap-3">
                      <div className="mt-1">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm break-words">{getActivityDescription(activity)}</p>
                        <p className="text-xs text-muted-foreground">{formatRelativeTime(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t p-3 sm:p-4">
            <Button variant="outline" size="sm" className="ml-auto h-8 sm:h-9 text-xs sm:text-sm" asChild>
              <a href="#logs" className="flex items-center">
                View All Activity
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              </a>
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="p-3 pb-1.5">
            <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
            <CardDescription className="text-xs">Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-3">
            <div className="space-y-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="w-full justify-start h-9 sm:h-10 text-xs sm:text-sm"
                  asChild
                >
                  {action.external ? (
                    <a href={action.href} target="_blank" rel="noopener noreferrer" className="flex items-center">
                      <action.icon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>{action.label}</span>
                    </a>
                  ) : (
                    <a href={action.href} className="flex items-center">
                      <action.icon className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>{action.label}</span>
                    </a>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications and Usage */}
      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex h-auto">
          <TabsTrigger value="applications" className="py-1.5 px-2 text-xs">
            Applications
          </TabsTrigger>
          <TabsTrigger value="usage" className="py-1.5 px-2 text-xs">
            Usage & Limits
          </TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="mt-3 sm:mt-4">
          <Card>
            <CardHeader className="p-3 pb-1.5">
              <CardTitle className="text-sm sm:text-base">Your Applications</CardTitle>
              <CardDescription className="text-xs">Applications in {selectedOrganization.name}</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              {filteredApplications.length === 0 ? (
                <div className="py-6 sm:py-8 text-center text-muted-foreground text-sm">No applications found</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {filteredApplications.map((app) => (
                    <Card key={app.id} className="overflow-hidden">
                      <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2 bg-secondary/30">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-sm sm:text-base">{app.name}</CardTitle>
                          <Badge
                            variant={app.status === "active" ? "default" : "secondary"}
                            className={`text-xs ${
                              app.status === "active"
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-gray-500 hover:bg-gray-600"
                            }`}
                          >
                            {app.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">{app.type}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 pt-2">
                        <div className="mt-2">
                          <div className="flex justify-between text-xs sm:text-sm mb-1">
                            <span>API Requests</span>
                            <span className="font-medium">{app.requests.toLocaleString()}</span>
                          </div>
                          <Progress value={Math.min((app.requests / 20000) * 100, 100)} className="h-1.5 sm:h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round((app.requests / 20000) * 100)}% of monthly limit
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter className="p-3 sm:p-4 pt-0 flex justify-end">
                        <Button size="sm" className="h-8 text-xs sm:text-sm" asChild>
                          <a href="#applications" className="flex items-center">
                            Manage
                            <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t p-3 sm:p-4">
              <Button className="ml-auto h-8 sm:h-9 text-xs sm:text-sm" asChild>
                <a href="#applications" className="flex items-center">
                  View All Applications
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="mt-3 sm:mt-4">
          <Card>
            <CardHeader className="p-3 pb-1.5">
              <CardTitle className="text-sm sm:text-base">Usage & Limits</CardTitle>
              <CardDescription className="text-xs">Current usage and plan limits</CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-3">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>API Requests</span>
                    <span className="font-medium">25,500 / 100,000</span>
                  </div>
                  <Progress value={25.5} className="h-1.5 sm:h-2" />
                  <p className="text-xs text-muted-foreground mt-1">25.5% of monthly limit</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>Storage</span>
                    <span className="font-medium">125 MB / 1 GB</span>
                  </div>
                  <Progress value={12.5} className="h-1.5 sm:h-2" />
                  <p className="text-xs text-muted-foreground mt-1">12.5% of storage limit</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>Team Members</span>
                    <span className="font-medium">8 / 10</span>
                  </div>
                  <Progress value={80} className="h-1.5 sm:h-2" />
                  <p className="text-xs text-muted-foreground mt-1">80% of team member limit</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span>Applications</span>
                    <span className="font-medium">3 / 5</span>
                  </div>
                  <Progress value={60} className="h-1.5 sm:h-2" />
                  <p className="text-xs text-muted-foreground mt-1">60% of application limit</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:justify-between">
              <Button variant="outline" className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm" asChild>
                <a href="#settings" className="flex items-center justify-center">
                  <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  Download Report
                </a>
              </Button>
              <Button className="w-full sm:w-auto h-8 sm:h-9 text-xs sm:text-sm" asChild>
                <a href="#settings" className="flex items-center justify-center">
                  Upgrade Plan
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                </a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
