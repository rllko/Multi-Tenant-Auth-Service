"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Edit, MoreHorizontal, Plus, RefreshCw, Shield, Trash, Building, Search } from "lucide-react"
import { ApplicationScopeSelector } from "./application-scope-selector"
import { predefinedScopes } from "./scope-models"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Mock data for applications
const applications = [
  {
    id: "app_1",
    name: "Web Dashboard",
    type: "web",
    clientId: "client_1a2b3c4d5e6f7g8h9i",
    clientSecret: "secret_1a2b3c4d5e6f7g8h9i0j",
    redirectUris: ["https://dashboard.example.com/callback"],
    createdAt: "2023-04-12",
    status: "active",
    scopes: ["user.read", "license.read"],
    organization: "Acme Inc.",
  },
  {
    id: "app_2",
    name: "Discord Bot",
    type: "service",
    clientId: "client_2a3b4c5d6e7f8g9h0i",
    clientSecret: "secret_2a3b4c5d6e7f8g9h0i1j",
    redirectUris: [],
    createdAt: "2023-05-23",
    status: "active",
    scopes: ["user.read", "user.write", "license.read", "license.write"],
    organization: "Acme Inc.",
  },
  {
    id: "app_3",
    name: "License Manager Bot",
    type: "service",
    clientId: "client_3a4b5c6d7e8f9g0h1i",
    clientSecret: "secret_3a4b5c6d7e8f9g0h1i2j",
    redirectUris: [],
    createdAt: "2023-06-10",
    status: "active",
    scopes: ["license.read", "license.write", "license.delete", "license.admin"],
    organization: "Globex Corporation",
  },
  {
    id: "app_4",
    name: "Legacy System",
    type: "web",
    clientId: "client_4a5b6c7d8e9f0g1h2i",
    clientSecret: "secret_4a5b6c7d8e9f0g1h2i3j",
    redirectUris: ["https://legacy.example.com/oauth/callback"],
    createdAt: "2023-03-01",
    status: "inactive",
    scopes: ["user.read"],
    organization: "Initech",
  },
]

// Mock data for organizations
const organizations = [
  { id: "org_1", name: "Acme Inc.", members: 12 },
  { id: "org_2", name: "Globex Corporation", members: 8 },
  { id: "org_3", name: "Initech", members: 5 },
]

export function ApplicationsView() {
  const [apps, setApps] = useState(applications)
  const [open, setOpen] = useState(false)
  const [scopesDialogOpen, setScopesDialogOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0])
  const [newApp, setNewApp] = useState({
    name: "",
    type: "web",
    redirectUris: "",
    scopes: [],
    organization: organizations[0].name,
    keyFormat: "guid",
    keyLength: 16,
  })

  const handleEdit = (app) => {
    setSelectedApp(app)
    setNewApp({
      name: app.name,
      type: app.type,
      redirectUris: app.redirectUris.join("\n"),
      scopes: app.scopes || [],
      organization: app.organization,
      keyFormat: "guid", // Default, since existing apps don't have this property
      keyLength: 16,
    })
    setOpen(true)
  }

  const handleCreate = () => {
    setSelectedApp(null)
    setNewApp({
      name: "",
      type: "web",
      redirectUris: "",
      scopes: [],
      organization: selectedOrganization.name,
      keyFormat: "guid",
      keyLength: 16,
    })
    setOpen(true)
  }

  const generateClientId = () => {
    if (newApp.keyFormat === "guid") {
      return `client_${crypto.randomUUID().replace(/-/g, "")}`
    } else {
      const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
      let result = "client_"
      for (let i = 0; i < newApp.keyLength; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }
  }

  const handleSave = () => {
    if (selectedApp) {
      // Update existing app
      setApps(
        apps.map((app) =>
          app.id === selectedApp.id
            ? {
                ...app,
                name: newApp.name,
                type: newApp.type,
                redirectUris: newApp.redirectUris.split("\n").filter((uri) => uri.trim()),
                scopes: newApp.scopes,
                organization: newApp.organization,
              }
            : app,
        ),
      )
    } else {
      // Create new app
      const newId = `app_${Date.now()}`
      setApps([
        ...apps,
        {
          id: newId,
          name: newApp.name,
          type: newApp.type,
          clientId: generateClientId(),
          clientSecret: `secret_${Math.random().toString(36).substring(2, 15)}`,
          redirectUris: newApp.redirectUris.split("\n").filter((uri) => uri.trim()),
          createdAt: new Date().toISOString().split("T")[0],
          status: "active",
          scopes: newApp.scopes,
          organization: newApp.organization,
        },
      ])
    }
    setOpen(false)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewApp((prev) => ({ ...prev, [name]: value }))
  }

  const handleManageScopes = (app) => {
    setSelectedApp(app)
    setNewApp({
      ...newApp,
      scopes: app.scopes || [],
    })
    setScopesDialogOpen(true)
  }

  const handleSaveScopes = () => {
    if (!selectedApp) return

    // Update the app with new scopes
    setApps(apps.map((app) => (app.id === selectedApp.id ? { ...app, scopes: newApp.scopes } : app)))

    setScopesDialogOpen(false)
  }

  const getScopeNames = (scopeIds) => {
    if (!scopeIds || scopeIds.length === 0) return "No scopes"

    const scopeNames = scopeIds.map((id) => {
      const scope = predefinedScopes.find((s) => s.id === id)
      return scope ? scope.name : id
    })

    if (scopeNames.length <= 2) return scopeNames.join(", ")
    return `${scopeNames.slice(0, 2).join(", ")} +${scopeNames.length - 2} more`
  }

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org)
    // Update new app form with new organization
    setNewApp({
      ...newApp,
      organization: org.name,
    })
  }

  // Filter applications based on search query and selected organization
  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      searchQuery === "" ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.clientId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesOrg = app.organization === selectedOrganization.name

    return matchesSearch && matchesOrg
  })

  return (
    <div className="space-y-6">
      {/* Organization Context Banner */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Organization Context</h3>
              <p className="text-sm text-muted-foreground">
                Managing applications for <span className="font-medium">{selectedOrganization.name}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Applications</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      <Card className="shadow-sm border-border bg-white">
        <CardHeader className="flex flex-row items-center border-b">
          <div className="space-y-1.5">
            <CardTitle>OAuth Applications</CardTitle>
            <CardDescription>Manage your OAuth client applications.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative flex-1 my-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search applications..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No applications found in this organization.
                  </TableCell>
                </TableRow>
              ) : (
                filteredApps.map((app) => (
                  <TableRow key={app.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {app.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="truncate max-w-[140px]">{app.clientId}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getScopeNames(app.scopes)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={app.status === "active" ? "default" : "secondary"}
                        className={
                          app.status === "active"
                            ? "bg-green-500 hover:bg-green-600 active:bg-green-700"
                            : "bg-gray-500 hover:bg-gray-600 active:bg-gray-700"
                        }
                      >
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(app)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Application
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageScopes(app)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Manage Scopes
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Rotate Secret
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Application
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Application Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedApp ? "Edit Application" : "Create New Application"}</DialogTitle>
            <DialogDescription>
              {selectedApp ? "Update your OAuth application details." : "Configure a new OAuth client application."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Application Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={newApp.name}
                    onChange={handleInputChange}
                    placeholder="My OAuth App"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="organization">Organization</Label>
                  <select
                    id="organization"
                    name="organization"
                    value={newApp.organization}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.name}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">Application Type</Label>
                  <select
                    id="type"
                    name="type"
                    value={newApp.type}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="web">Web Application</option>
                    <option value="native">Native Application</option>
                    <option value="spa">Single Page App</option>
                    <option value="service">Service (Discord Bot, etc.)</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="redirectUris">Redirect URIs (one per line)</Label>
                  <Textarea
                    id="redirectUris"
                    name="redirectUris"
                    value={newApp.redirectUris}
                    onChange={handleInputChange}
                    placeholder="https://example.com/callback"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Where to redirect users after authorization. Required for Authorization Code and Implicit flows.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 py-4">
              <div className="grid gap-4">
                {/* Key Format Options */}
                <div className="grid gap-2">
                  <Label>Client ID Format</Label>
                  <RadioGroup
                    value={newApp.keyFormat}
                    onValueChange={(value) => setNewApp({ ...newApp, keyFormat: value })}
                    className="grid gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="guid" id="guid" />
                      <Label htmlFor="guid" className="font-normal">
                        GUID (e.g., client_550e8400e29b41d4a716446655440000)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="random" id="random" />
                      <Label htmlFor="random" className="font-normal">
                        Random String
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {newApp.keyFormat === "random" && (
                  <div className="grid gap-2">
                    <Label htmlFor="keyLength">Key Length</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="keyLength"
                        name="keyLength"
                        type="number"
                        min="8"
                        max="32"
                        value={newApp.keyLength}
                        onChange={handleInputChange}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">characters</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Length of the random string (8-32 characters)</p>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label>Token Endpoint Auth Method</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="client_secret_basic">Client Secret Basic</option>
                    <option value="client_secret_post">Client Secret Post</option>
                    <option value="none">None (public client)</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label>Grant Types</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="authorization_code"
                        className="rounded border-gray-300"
                        defaultChecked
                      />
                      <Label htmlFor="authorization_code" className="font-normal">
                        Authorization Code
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="refresh_token" className="rounded border-gray-300" defaultChecked />
                      <Label htmlFor="refresh_token" className="font-normal">
                        Refresh Token
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="client_credentials" className="rounded border-gray-300" />
                      <Label htmlFor="client_credentials" className="font-normal">
                        Client Credentials
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Token Lifetime</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="access_token_lifetime" className="text-xs">
                        Access Token (seconds)
                      </Label>
                      <Input id="access_token_lifetime" type="number" defaultValue="3600" />
                    </div>
                    <div>
                      <Label htmlFor="refresh_token_lifetime" className="text-xs">
                        Refresh Token (seconds)
                      </Label>
                      <Input id="refresh_token_lifetime" type="number" defaultValue="86400" />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{selectedApp ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Scopes Dialog */}
      <Dialog open={scopesDialogOpen} onOpenChange={setScopesDialogOpen} className="max-w-4xl">
        <DialogContent className="max-w-4xl p-0">
          <ApplicationScopeSelector
            selectedScopes={newApp.scopes}
            onScopesChange={(scopes) => setNewApp({ ...newApp, scopes })}
            onCancel={() => setScopesDialogOpen(false)}
            onSave={handleSaveScopes}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
