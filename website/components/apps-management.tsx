"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApplicationsView } from "@/components/applications-view"
import { fetchApps } from "@/lib/api-service"
import type { AppSchema } from "@/lib/schemas"
import type { z } from "zod"
import { AlertCircle, Plus } from "lucide-react"

export function AppsManagement() {
  const [apps, setApps] = useState<z.infer<typeof AppSchema>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadApps = async () => {
      try {
        setIsLoading(true)
        const appsData = await fetchApps()
        setApps(appsData)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch apps:", err)
        setError("Failed to load applications. Please try again.")
        // Set fallback data
        setApps([
          {
            id: "app_1",
            name: "Customer Portal",
            description: "Customer-facing portal application",
            status: "active",
            type: "web",
            clientId: "client_123",
            clientSecret: "secret_456",
            redirectUris: ["https://example.com/callback"],
            createdAt: "2023-01-15T00:00:00Z",
            updatedAt: "2023-04-28T14:30:00Z",
          },
          {
            id: "app_2",
            name: "Analytics Dashboard",
            description: "Internal analytics dashboard",
            status: "active",
            type: "spa",
            clientId: "client_789",
            clientSecret: "secret_012",
            redirectUris: ["https://analytics.example.com/callback"],
            createdAt: "2023-02-10T00:00:00Z",
            updatedAt: "2023-04-27T09:15:00Z",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadApps()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create App
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Apps</TabsTrigger>
          <TabsTrigger value="web">Web Apps</TabsTrigger>
          <TabsTrigger value="native">Native Apps</TabsTrigger>
          <TabsTrigger value="service">Service Apps</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Applications</CardTitle>
              <CardDescription>Manage all your registered applications.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[400px] bg-muted rounded-lg animate-pulse"></div>
              ) : (
                <ApplicationsView applications={apps} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="web" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Web Applications</CardTitle>
              <CardDescription>Traditional web applications with server-side components.</CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationsView applications={apps.filter((app) => app.type === "web")} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="native" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Native Applications</CardTitle>
              <CardDescription>Mobile and desktop applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationsView applications={apps.filter((app) => app.type === "native")} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="service" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Applications</CardTitle>
              <CardDescription>Machine-to-machine applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationsView applications={apps.filter((app) => app.type === "service")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
