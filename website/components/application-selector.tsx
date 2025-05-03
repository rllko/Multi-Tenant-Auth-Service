"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Search, Settings } from "lucide-react"

// Mock data for applications
const applications = [
  {
    id: "app_1",
    name: "Web Dashboard",
    type: "web",
    clientId: "client_1a2b3c4d5e6f7g8h9i",
    organization: "Acme Inc.",
    description: "Main web dashboard for customer access",
    icon: "🌐",
  },
  {
    id: "app_2",
    name: "Discord Bot",
    type: "service",
    clientId: "client_2a3b4c5d6e7f8g9h0i",
    organization: "Acme Inc.",
    description: "Bot for Discord integration",
    icon: "🤖",
  },
  {
    id: "app_3",
    name: "License Manager Bot",
    type: "service",
    clientId: "client_3a4b5c6d7e8f9g0h1i",
    organization: "Globex Corporation",
    description: "Automated license management system",
    icon: "🔑",
  },
  {
    id: "app_4",
    name: "Legacy System",
    type: "web",
    clientId: "client_4a5b6c7d8e9f0g1h2i",
    organization: "Initech",
    description: "Legacy system integration",
    icon: "📦",
  },
  {
    id: "app_5",
    name: "Mobile App",
    type: "native",
    clientId: "client_5a6b7c8d9e0f1g2h3i",
    organization: "Acme Inc.",
    description: "Mobile application for iOS and Android",
    icon: "📱",
  },
  {
    id: "app_6",
    name: "API Gateway",
    type: "service",
    clientId: "client_6a7b8c9d0e1f2g3h4i",
    organization: "Globex Corporation",
    description: "API gateway for third-party integrations",
    icon: "🔌",
  },
]

export function ApplicationSelector({ onApplicationSelect, selectedOrganization, onOrganizationChange }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Filter applications based on search, organization, and type
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchQuery === "" ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesOrganization = selectedOrganization.id === "all" || app.organization === selectedOrganization.name

    const matchesType =
      activeTab === "all" ||
      (activeTab === "web" && app.type === "web") ||
      (activeTab === "service" && app.type === "service") ||
      (activeTab === "native" && app.type === "native")

    return matchesSearch && matchesOrganization && matchesType
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Applications</CardTitle>
              <CardDescription>Select an application to manage its team permissions</CardDescription>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Application</DialogTitle>
                  <DialogDescription>Add a new OAuth application to your organization</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  {/* Application creation form would go here */}
                  <p className="text-muted-foreground text-center py-4">Application creation form placeholder</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setCreateDialogOpen(false)}>Create Application</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search applications..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Button variant="outline" className="w-full sm:w-auto">
                <Settings className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="web">Web Apps</TabsTrigger>
                <TabsTrigger value="service">Services</TabsTrigger>
                <TabsTrigger value="native">Native Apps</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredApplications.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No applications found matching your criteria.
                </div>
              ) : (
                filteredApplications.map((app) => (
                  <Card
                    key={app.id}
                    className="overflow-hidden hover:border-primary/50 cursor-pointer transition-colors"
                    onClick={() => onApplicationSelect(app.id)}
                  >
                    <CardHeader className="p-4 pb-2 flex flex-row items-start gap-2">
                      <div className="text-3xl">{app.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold">{app.name}</CardTitle>
                        <CardDescription className="text-xs">{app.organization}</CardDescription>
                      </div>
                      <Badge variant="outline" className="ml-auto">
                        {app.type}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm text-muted-foreground">{app.description}</p>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <div className="text-xs text-muted-foreground truncate max-w-[180px]">ID: {app.clientId}</div>
                      <Button variant="ghost" size="sm">
                        Manage
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
