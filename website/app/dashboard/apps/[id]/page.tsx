"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Edit, Key, Save, Settings, Shield, Users, CopyrightIcon as License } from "lucide-react"
import { OAuthClientsTab } from "@/components/oauth-clients-tab"
import { PermissionsTab } from "@/components/permissions-tab"
import { SessionsTab } from "@/components/sessions-tab"
import { LicensesTab } from "@/components/licenses-tab"

// Mock data for the current app
const appData = {
  id: "app_1",
  name: "Customer Portal",
  description: "Customer-facing portal for license management and support",
  status: "active",
  type: "web",
  icon: "🌐",
  clientCount: 3,
  sessionCount: 28,
  createdAt: "2023-05-15",
  updatedAt: "2023-11-02",
  redirectUris: ["https://customer.example.com/callback", "https://dev.customer.example.com/auth"],
  organization: "Acme Inc.",
  stats: {
    totalUsers: 1245,
    activeUsers: 328,
    totalSessions: 4521,
    activeSessions: 28,
    totalClients: 3,
    activeClients: 2,
    totalLicenses: 1850,
    activeLicenses: 1243,
  },
}

export default function AppDetailPage({ params }: { params: { id: string } }) {
  const [isEditing, setIsEditing] = useState(false)
  const [app, setApp] = useState(appData)
  const [editedApp, setEditedApp] = useState(appData)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedApp((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setApp(editedApp)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedApp(app)
    setIsEditing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "maintenance":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "development":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">App Details: {app.name}</h1>
          <p className="text-muted-foreground">Manage your application settings and permissions</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit App
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
          <TabsTrigger value="oauth-clients">OAuth Clients</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* App Info Card */}
            <Card className="md:col-span-2 bg-card dark:bg-[#1E1E1E]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{app.icon}</div>
                    <div>
                      <CardTitle>Application Information</CardTitle>
                      <CardDescription>Basic details about this application</CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(app.status)}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Application Name</Label>
                      <Input id="name" name="name" value={editedApp.name} onChange={handleInputChange} />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={editedApp.description}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="type">Application Type</Label>
                      <select
                        id="type"
                        name="type"
                        value={editedApp.type}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="web">Web Application</option>
                        <option value="mobile">Mobile App</option>
                        <option value="desktop">Desktop App</option>
                        <option value="service">Service/API</option>
                      </select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="icon">Icon</Label>
                      <select
                        id="icon"
                        name="icon"
                        value={editedApp.icon}
                        onChange={handleInputChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="🌐">🌐 Web</option>
                        <option value="📱">📱 Mobile</option>
                        <option value="💻">💻 Desktop</option>
                        <option value="🔑">🔑 Auth</option>
                        <option value="📊">📊 Analytics</option>
                        <option value="🛒">🛒 E-commerce</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="status"
                        checked={editedApp.status === "active"}
                        onCheckedChange={(checked) =>
                          setEditedApp((prev) => ({
                            ...prev,
                            status: checked ? "active" : "inactive",
                          }))
                        }
                        className="data-[state=checked]:bg-[#8A63F9]"
                      />
                      <Label htmlFor="status">Active</Label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                        <p className="text-base">{app.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                        <p className="text-base capitalize">{app.type}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Organization</h3>
                        <p className="text-base">{app.organization}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                        <p className="text-base">{new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                      <p className="text-base">{app.description}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Redirect URIs</h3>
                      <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                        {app.redirectUris.map((uri, index) => (
                          <li key={index} className="text-base font-mono">
                            {uri}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="bg-card dark:bg-[#1E1E1E]">
              <CardHeader>
                <CardTitle>Application Stats</CardTitle>
                <CardDescription>Usage statistics for this application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Users</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{app.stats.totalUsers}</span>
                      <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{app.stats.activeUsers}</span>
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Licenses</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{app.stats.totalLicenses}</span>
                      <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{app.stats.activeLicenses}</span>
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Sessions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{app.stats.totalSessions}</span>
                      <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{app.stats.activeSessions}</span>
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">OAuth Clients</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{app.stats.totalClients}</span>
                      <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-2xl font-bold">{app.stats.activeClients}</span>
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="bg-card dark:bg-[#1E1E1E]">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for this application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <License className="h-5 w-5" />
                  <span>Create License</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <Key className="h-5 w-5" />
                  <span>Create OAuth Client</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span>Manage Permissions</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>View Active Sessions</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                  <Settings className="h-5 w-5" />
                  <span>Advanced Settings</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="licenses" className="mt-6">
          <LicensesTab appId={params.id} />
        </TabsContent>

        <TabsContent value="oauth-clients" className="mt-6">
          <OAuthClientsTab appId={params.id} />
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionsTab appId={params.id} />
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          <SessionsTab appId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
