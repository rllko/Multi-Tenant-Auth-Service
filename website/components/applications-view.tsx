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
import { Copy, Edit, MoreHorizontal, Plus, RefreshCw, Shield, Trash, Building, Search, Eye, EyeOff } from "lucide-react"
import { ApplicationScopeSelector } from "./application-scope-selector"
import { predefinedScopes } from "./scope-models"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "./empty-state"

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
    lastUsed: "2 hours ago",
    lastIp: "192.168.1.1",
    lastLocation: "New York, US",
    sessionCount: 3,
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
    lastUsed: "1 day ago",
    lastIp: "10.0.0.1",
    lastLocation: "AWS East, US",
    sessionCount: 1,
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
    lastUsed: "5 hours ago",
    lastIp: "172.16.0.1",
    lastLocation: "London, UK",
    sessionCount: 2,
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
    lastUsed: "2 months ago",
    lastIp: "192.168.0.1",
    lastLocation: "Berlin, DE",
    sessionCount: 0,
  },
]

// Mock data for organizations
const organizations = [
  { id: "org_1", name: "Acme Inc.", members: 12 },
  { id: "org_2", name: "Globex Corporation", members: 8 },
  { id: "org_3", name: "Initech", members: 5 },
]

// Role templates
const roleTemplates = [
  {
    id: "admin",
    name: "Admin",
    description: "Full access to all resources",
    scopes: ["user.admin", "license.admin", "session.admin"],
  },
  {
    id: "support",
    name: "Support",
    description: "Can view users and manage sessions",
    scopes: ["user.read", "session.read", "session.revoke"],
  },
  {
    id: "signin_bot",
    name: "Signin Bot",
    description: "Can only authenticate users",
    scopes: ["auth.signin"],
  },
  {
    id: "api_client",
    name: "API Client",
    description: "Can authenticate and read data",
    scopes: ["auth.signin", "data.read"],
  },
]

export function ApplicationsView() {
  const [apps, setApps] = useState(applications)
  const [open, setOpen] = useState(false)
  const [scopesDialogOpen, setScopesDialogOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0])
  const [secretVisibility, setSecretVisibility] = useState({})
  const [viewMode, setViewMode] = useState("grid")
  const { toast } = useToast()
  const [newApp, setNewApp] = useState({
    name: "",
    type: "web",
    redirectUris: "",
    scopes: [],
    organization: organizations[0].name,
    keyFormat: "guid",
    keyLength: 16,
    roleTemplate: "",
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
      roleTemplate: "",
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
      roleTemplate: "",
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
          lastUsed: "Never",
          lastIp: "-",
          lastLocation: "-",
          sessionCount: 0,
        },
      ])
    }
    setOpen(false)

    toast({
      title: selectedApp ? "Client updated" : "Client created",
      description: selectedApp
        ? `The client "${newApp.name}" has been updated successfully.`
        : `The client "${newApp.name}" has been created successfully.`,
    })
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

    toast({
      title: "Permissions updated",
      description: `The permissions for "${selectedApp.name}" have been updated successfully.`,
    })
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

  const toggleSecretVisibility = (appId) => {
    setSecretVisibility((prev) => ({
      ...prev,
      [appId]: !prev[appId],
    }))
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast({
      title: `${label} copied to clipboard`,
      description: "The value has been copied to your clipboard.",
      duration: 2000,
    })
  }

  const toggleClientStatus = (appId, currentStatus) => {
    setApps(
      apps.map((app) =>
        app.id === appId ? { ...app, status: currentStatus === "active" ? "inactive" : "active" } : app,
      ),
    )

    toast({
      title: `Client ${currentStatus === "active" ? "deactivated" : "activated"}`,
      description: "The client status has been updated successfully.",
      duration: 2000,
    })
  }

  const rotateSecret = (appId) => {
    setApps(
      apps.map((app) =>
        app.id === appId ? { ...app, clientSecret: `secret_${Math.random().toString(36).substring(2, 15)}` } : app,
      ),
    )

    toast({
      title: "Secret rotated",
      description:
        "The client secret has been rotated successfully. Make sure to update any systems using this client.",
      duration: 3000,
    })
  }

  const handleRoleTemplateChange = (templateId) => {
    const template = roleTemplates.find((t) => t.id === templateId)
    if (template) {
      setNewApp((prev) => ({
        ...prev,
        roleTemplate: templateId,
        scopes: template.scopes,
      }))
    }
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
        <h2 className="text-2xl font-bold">OAuth Clients</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Client
        </Button>
      </div>

      <Card className="shadow-sm border-border bg-card dark:bg-[#1E1E1E]">
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

          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid View
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setViewMode("table")}
              >
                Table View
              </Button>
            </div>
            <div className="flex gap-2">
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                value={selectedOrganization.id}
                onChange={(e) => {
                  const org = organizations.find((o) => o.id === e.target.value)
                  if (org) handleOrganizationChange(org)
                }}
              >
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <EmptyState
              title="No OAuth clients found"
              description="Create your first OAuth client to get started with authentication."
              icon={<Shield className="h-10 w-10 text-muted-foreground" />}
              action={
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Client
                </Button>
              }
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map((app) => (
                <Card key={app.id} className="overflow-hidden bg-card dark:bg-[#1E1E1E] border-border">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{app.name}</CardTitle>
                      <Switch
                        checked={app.status === "active"}
                        onCheckedChange={() => toggleClientStatus(app.id, app.status)}
                        className="data-[state=checked]:bg-[#8A63F9] data-[state=checked]:border-[#8A63F9]"
                      />
                    </div>
                    <Badge variant="outline" className="capitalize mt-1">
                      {app.type}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Client ID</Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(app.clientId, "Client ID")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="font-mono text-xs bg-muted p-2 rounded-md truncate">{app.clientId}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Client Secret</Label>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => toggleSecretVisibility(app.id)}
                          >
                            {secretVisibility[app.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(app.clientSecret, "Client Secret")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="font-mono text-xs bg-muted p-2 rounded-md truncate">
                        {secretVisibility[app.id] ? app.clientSecret : "••••••••••••••••••••••••"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Permissions</Label>
                      <div className="flex flex-wrap gap-1">
                        {app.scopes && app.scopes.length > 0 ? (
                          app.scopes.slice(0, 3).map((scope) => (
                            <Badge key={scope} variant="secondary" className="text-xs">
                              {scope}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">No permissions assigned</span>
                        )}
                        {app.scopes && app.scopes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{app.scopes.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <div className="font-medium">Last Used</div>
                        <div>{app.lastUsed}</div>
                      </div>
                      <div>
                        <div className="font-medium">Sessions</div>
                        <div>{app.sessionCount}</div>
                      </div>
                      <div>
                        <div className="font-medium">Last IP</div>
                        <div>{app.lastIp}</div>
                      </div>
                      <div>
                        <div className="font-medium">Location</div>
                        <div>{app.lastLocation}</div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 border-t flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleManageScopes(app)}>
                      <Shield className="mr-2 h-3.5 w-3.5" />
                      Permissions
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEdit(app)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => rotateSecret(app.id)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Rotate Secret
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client ID</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow key={app.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{app.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {app.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="truncate max-w-[140px]">{app.clientId}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(app.clientId, "Client ID")}
                        >
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
                      <Switch
                        checked={app.status === "active"}
                        onCheckedChange={() => toggleClientStatus(app.id, app.status)}
                        className="data-[state=checked]:bg-[#8A63F9] data-[state=checked]:border-[#8A63F9]"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{app.lastUsed}</TableCell>
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
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleManageScopes(app)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Manage Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => rotateSecret(app.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Rotate Secret
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Application Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedApp ? "Edit OAuth Client" : "Create New OAuth Client"}</DialogTitle>
            <DialogDescription>
              {selectedApp ? "Update your OAuth client details." : "Configure a new OAuth client application."}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Settings</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Client Name</Label>
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
                  <Label htmlFor="type">Client Type</Label>
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
                    <option value="service">Service (Bot, API, etc.)</option>
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

            <TabsContent value="permissions" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Role Template</Label>
                  <select
                    value={newApp.roleTemplate}
                    onChange={(e) => handleRoleTemplateChange(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select a role template</option>
                    {roleTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} - {template.description}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Role templates provide predefined sets of permissions for common use cases.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label>Selected Permissions</Label>
                  <div className="border rounded-md p-3 min-h-[100px] bg-muted/30">
                    {newApp.scopes && newApp.scopes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {newApp.scopes.map((scope) => (
                          <Badge key={scope} variant="secondary" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No permissions selected. Choose a role template or add permissions manually.
                      </p>
                    )}
                  </div>
                </div>

                <Button variant="outline" onClick={() => setScopesDialogOpen(true)}>
                  <Shield className="mr-2 h-4 w-4" />
                  Manage Permissions Manually
                </Button>
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
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="client_secret_basic">Client Secret Basic</option>
                    <option value="client_secret_post">Client Secret Post</option>
                    <option value="none">None (public client)</option>
                  </select>
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
