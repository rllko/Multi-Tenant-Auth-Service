"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Settings, Shield, Users, Key, Clock, Activity } from "lucide-react"
import { OAuthClientsTab } from "@/components/oauth-clients-tab"
import { PermissionsTab } from "@/components/permissions-tab"
import { SessionsTab } from "@/components/sessions-tab"
import { LicensesTab } from "@/components/licenses-tab"
import { useTeam } from "@/contexts/team-context"
import Link from "next/link"

export default function AppDetailsPage() {
  const params = useParams()
  const appId = params.id
  const { selectedTeam } = useTeam()
  const [app, setApp] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAppDetails = async () => {
      if (!selectedTeam || !appId) return

      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${appId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch app details: ${response.status}`)
        }

        const data = await response.json()
        setApp(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch app details:", err)
        setError("Failed to load app details")
      } finally {
        setLoading(false)
      }
    }

    fetchAppDetails()
  }, [selectedTeam, appId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading application details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
        <Shield className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    )
  }

  if (!app) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md flex items-center">
        <Shield className="h-5 w-5 mr-2" />
        <span>Application not found</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/apps">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{app.name}</h1>
          <Badge variant={app.status === "active" ? "default" : "secondary"} className="ml-2 capitalize">
            {app.status}
          </Badge>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          App Settings
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Application Overview</CardTitle>
          <CardDescription>Key information about this application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Client ID</div>
              <div className="font-mono text-xs bg-muted p-2 rounded-md truncate">{app.clientId}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Type</div>
              <div className="flex items-center">
                <Badge variant="outline" className="capitalize">
                  {app.type}
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Created</div>
              <div className="text-sm">{new Date(app.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">Last Used</div>
              <div className="text-sm">{app.lastUsed || "Never"}</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">{app.scopes?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Permissions</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">{app.sessionCount || 0}</div>
                <div className="text-xs text-muted-foreground">Active Sessions</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">{app.licenseCount || 0}</div>
                <div className="text-xs text-muted-foreground">Licenses</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium">{app.activityCount || 0}</div>
                <div className="text-xs text-muted-foreground">Activities</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="sessions">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="sessions">
            <Clock className="mr-2 h-4 w-4" />
            Sessions
          </TabsTrigger>
          <TabsTrigger value="licenses">
            <Key className="mr-2 h-4 w-4" />
            Licenses
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="mr-2 h-4 w-4" />
            Permissions
          </TabsTrigger>
          <TabsTrigger value="oauth">
            <Users className="mr-2 h-4 w-4" />
            OAuth Clients
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sessions">
          <SessionsTab appId={appId} />
        </TabsContent>
        <TabsContent value="licenses">
          <LicensesTab appId={appId} />
        </TabsContent>
        <TabsContent value="permissions">
          <PermissionsTab appId={appId} />
        </TabsContent>
        <TabsContent value="oauth">
          <OAuthClientsTab appId={appId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
