"use client"

import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Copy,
  Edit,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Shield,
  Trash,
  Building,
  Search,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import { ApplicationScopeSelector } from "./application-scope-selector"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "./empty-state"
import { useTeam } from "@/contexts/team-context"
import { RequireTeam } from "./require-team"

export function ApplicationsView() {
  const [apps, setApps] = useState([])
  const [open, setOpen] = useState(false)
  const [scopesDialogOpen, setScopesDialogOpen] = useState(false)
  const [selectedApp, setSelectedApp] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [secretVisibility, setSecretVisibility] = useState({})
  const [viewMode, setViewMode] = useState("grid")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const { selectedTeam } = useTeam()
  const [newApp, setNewApp] = useState({
    name: "",
    type: "web",
    redirectUris: "",
    scopes: [],
    keyFormat: "guid",
    keyLength: 16,
    roleTemplate: "",
  })

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

  useEffect(() => {
    const fetchApps = async () => {
      if (!selectedTeam) return

      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps`)

        if (!response.ok) {
          throw new Error(`Failed to fetch applications: ${response.status}`)
        }

        const data = await response.json()
        setApps(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch applications:", err)
        setError("Failed to load applications")
      } finally {
        setLoading(false)
      }
    }

    fetchApps()
  }, [selectedTeam])

  const handleEdit = (app) => {
    setSelectedApp(app)
    setNewApp({
      name: app.name,
      type: app.type,
      redirectUris: app.redirectUris.join("\n"),
      scopes: app.scopes || [],
      keyFormat: "guid",
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

  const handleSave = async () => {
    if (!selectedTeam) return

    try {
      setLoading(true)

      if (selectedApp) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${selectedApp.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: newApp.name,
              type: newApp.type,
              redirectUris: newApp.redirectUris.split("\n").filter((uri) => uri.trim()),
              scopes: newApp.scopes,
            }),
          },
        )

        if (!response.ok) {
          throw new Error(`Failed to update application: ${response.status}`)
        }

        const updatedApp = await response.json()
        setApps(apps.map((app) => (app.id === selectedApp.id ? updatedApp : app)))

        toast({
          title: "Client updated",
          description: `The client "${newApp.name}" has been updated successfully.`,
        })
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newApp.name,
            type: newApp.type,
            redirectUris: newApp.redirectUris.split("\n").filter((uri) => uri.trim()),
            scopes: newApp.scopes,
            clientId: generateClientId(),
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to create application: ${response.status}`)
        }

        const newAppData = await response.json()
        setApps([newAppData, ...apps])

        toast({
          title: "Client created",
          description: `The client "${newApp.name}" has been created successfully.`,
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${selectedApp ? "update" : "create"} client: ${err.message}`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
      setOpen(false)
    }
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

  const handleSaveScopes = async () => {
    if (!selectedApp || !selectedTeam) return

    try {
      setLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${selectedApp.id}/scopes`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            scopes: newApp.scopes,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to update scopes: ${response.status}`)
      }

      const updatedApp = await response.json()
      setApps(apps.map((app) => (app.id === selectedApp.id ? updatedApp : app)))

      setScopesDialogOpen(false)

      toast({
        title: "Permissions updated",
        description: `The permissions for "${selectedApp.name}" have been updated successfully.`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to update permissions: ${err.message}`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getScopeNames = (scopeIds) => {
    if (!scopeIds || scopeIds.length === 0) return "No scopes"

    if (scopeIds.length <= 2) return scopeIds.join(", ")
    return `${scopeIds.slice(0, 2).join(", ")} +${scopeIds.length - 2} more`
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

  const toggleClientStatus = async (appId, currentStatus) => {
    if (!selectedTeam) return

    try {
      setLoading(true)

      const newStatus = currentStatus === "active" ? "inactive" : "active"

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${appId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update status: ${response.status}`)
      }

      const updatedApp = await response.json()
      setApps(apps.map((app) => (app.id === appId ? updatedApp : app)))

      toast({
        title: `Client ${newStatus}`,
        description: "The client status has been updated successfully.",
        duration: 2000,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to update status: ${err.message}`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const rotateSecret = async (appId) => {
    if (!selectedTeam) return

    try {
      setLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${appId}/rotate-secret`,
        {
          method: "POST",
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to rotate secret: ${response.status}`)
      }

      const updatedApp = await response.json()
      setApps(apps.map((app) => (app.id === appId ? updatedApp : app)))

      toast({
        title: "Secret rotated",
        description:
          "The client secret has been rotated successfully. Make sure to update any systems using this client.",
        duration: 3000,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to rotate secret: ${err.message}`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
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

  const filteredApps = apps.filter((app) => {
    return (
      searchQuery === "" ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.clientId.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <RequireTeam>
      <div className="space-y-6">
        {selectedTeam && (
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-medium">Team Context</h3>
                  <p className="text-sm text-muted-foreground">
                    Managing applications for <span className="font-medium">{selectedTeam.name}</span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
            </div>

            {loading && (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading applications...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
                <Shield className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && filteredApps.length === 0 ? (
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
            ) : !loading && !error && viewMode === "grid" ? (
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
                          <div>{app.lastUsed || "Never"}</div>
                        </div>
                        <div>
                          <div className="font-medium">Sessions</div>
                          <div>{app.sessionCount || 0}</div>
                        </div>
                        <div>
                          <div className="font-medium">Last IP</div>
                          <div>{app.lastIp || "-"}</div>
                        </div>
                        <div>
                          <div className="font-medium">Location</div>
                          <div>{app.lastLocation || "-"}</div>
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
              !loading &&
              !error && (
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
                        <TableCell className="text-sm text-muted-foreground">{app.lastUsed || "Never"}</TableCell>
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
              )
            )}
          </CardContent>
        </Card>

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
              <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                Cancel
              </Button>

              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {selectedApp ? "Updating..." : "Creating..."}
                  </>
                ) : selectedApp ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
    </RequireTeam>
  )
}
