"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, AlertTriangle, CheckCircle2, Shield, Layers, BarChart3, Key, CreditCard, Users } from "lucide-react"

interface PermissionSystemProps {
  type: "team" | "oauth"
  entityName: string
  entityDescription?: string
  onSave: (permissions: Record<string, string>) => void
}

export function PermissionSystem({ type, entityName, entityDescription, onSave }: PermissionSystemProps) {
  // Mock data for resources and permissions
  const resources = [
    {
      id: "app_1",
      name: "Customer Portal",
      icon: <Layers className="h-5 w-5 text-blue-500" />,
      permissions: [
        { id: "view", name: "Can view", description: "Can view app data" },
        { id: "edit", name: "Can edit", description: "Can edit app data" },
        { id: "admin", name: "Full access", description: "Full administrative access" },
      ],
    },
    {
      id: "app_2",
      name: "Analytics Dashboard",
      icon: <BarChart3 className="h-5 w-5 text-green-500" />,
      permissions: [
        { id: "view", name: "Can view", description: "Can view analytics data" },
        { id: "edit", name: "Can edit", description: "Can edit analytics settings" },
        { id: "admin", name: "Full access", description: "Full administrative access" },
      ],
    },
    {
      id: "app_3",
      name: "License Manager",
      icon: <Key className="h-5 w-5 text-amber-500" />,
      permissions: [
        { id: "view", name: "Can view", description: "Can view license data" },
        { id: "edit", name: "Can edit", description: "Can create and edit licenses" },
        { id: "admin", name: "Full access", description: "Full administrative access" },
      ],
    },
    {
      id: "billing",
      name: "Billing",
      icon: <CreditCard className="h-5 w-5 text-purple-500" />,
      permissions: [
        { id: "view", name: "Read-only", description: "Can view billing information" },
        { id: "edit", name: "Can edit", description: "Can update payment methods" },
        { id: "admin", name: "Full", description: "Full access to billing and invoices" },
      ],
    },
    {
      id: "team",
      name: "Team Management",
      icon: <Users className="h-5 w-5 text-indigo-500" />,
      permissions: [
        { id: "view", name: "Can view", description: "Can view team members" },
        { id: "invite", name: "Can invite", description: "Can invite new members" },
        { id: "admin", name: "Full access", description: "Can manage all team members" },
      ],
    },
  ]

  // Initial permission state
  const [permissions, setPermissions] = useState<Record<string, string>>({
    app_1: "none",
    app_2: "none",
    app_3: "none",
    billing: "none",
    team: "none",
  })

  // Permission templates
  const templates = [
    {
      id: "admin",
      name: "Admin",
      description: "Full access to all resources",
      permissions: {
        app_1: "admin",
        app_2: "admin",
        app_3: "admin",
        billing: "admin",
        team: "admin",
      },
    },
    {
      id: "editor",
      name: "Editor",
      description: "Can view and edit most resources",
      permissions: {
        app_1: "edit",
        app_2: "edit",
        app_3: "edit",
        billing: "view",
        team: "view",
      },
    },
    {
      id: "viewer",
      name: "Viewer",
      description: "Read-only access to resources",
      permissions: {
        app_1: "view",
        app_2: "view",
        app_3: "view",
        billing: "view",
        team: "view",
      },
    },
    {
      id: "custom",
      name: "Custom",
      description: "Custom permission set",
      permissions: {},
    },
  ]

  // Check for permission conflicts
  const [conflicts, setConflicts] = useState<string[]>([])

  const checkForConflicts = (newPermissions: Record<string, string>) => {
    const newConflicts: string[] = []

    // Example conflict rule: If user has edit access to an app but no view access to billing
    if (
      (newPermissions.app_1 === "edit" || newPermissions.app_2 === "edit" || newPermissions.app_3 === "edit") &&
      newPermissions.billing === "none"
    ) {
      newConflicts.push("Users with edit access to apps should have at least view access to billing")
    }

    // Example conflict rule: If user has admin access to team but not to any app
    if (
      newPermissions.team === "admin" &&
      newPermissions.app_1 !== "admin" &&
      newPermissions.app_2 !== "admin" &&
      newPermissions.app_3 !== "admin"
    ) {
      newConflicts.push("Team admins typically need admin access to at least one app")
    }

    setConflicts(newConflicts)
  }

  // Handle permission change
  const handlePermissionChange = (resourceId: string, value: string) => {
    const newPermissions = { ...permissions, [resourceId]: value }
    setPermissions(newPermissions)
    checkForConflicts(newPermissions)
  }

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId)
    if (template && template.id !== "custom") {
      setPermissions(template.permissions)
      checkForConflicts(template.permissions)
    }
  }

  // Handle save
  const handleSave = () => {
    onSave(permissions)
  }

  // Get current template
  const getCurrentTemplate = () => {
    for (const template of templates) {
      if (template.id === "custom") continue

      let matches = true
      for (const [resourceId, permissionValue] of Object.entries(template.permissions)) {
        if (permissions[resourceId] !== permissionValue) {
          matches = false
          break
        }
      }

      if (matches) return template.id
    }

    return "custom"
  }

  const currentTemplate = getCurrentTemplate()

  return (
    <Card className="w-full">
      <CardHeader className={type === "team" ? "border-b-blue-200" : "border-b-purple-200"}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={type === "team" ? "text-blue-600" : "text-purple-600"}>
              {type === "team" ? "Team Member Permissions" : "OAuth Client Permissions"}
            </CardTitle>
            <CardDescription>
              Configure what {type === "team" ? "this team member" : "this OAuth client"} can access
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={type === "team" ? "border-blue-200 bg-blue-50" : "border-purple-200 bg-purple-50"}
          >
            {entityName}
          </Badge>
        </div>
        {entityDescription && <p className="text-sm text-muted-foreground mt-1">{entityDescription}</p>}
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="visual" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="visual">Visual Builder</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-6">
            <div className="space-y-4">
              {resources.map((resource) => (
                <div key={resource.id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-1 bg-muted/50 rounded-md">{resource.icon}</div>
                    <div>
                      <h3 className="font-medium">{resource.name}</h3>
                      <div className="flex gap-1 mt-1">
                        {permissions[resource.id] === "none" ? (
                          <Badge variant="outline" className="bg-gray-50">
                            No access
                          </Badge>
                        ) : (
                          resource.permissions
                            .filter((p) => p.id === permissions[resource.id])
                            .map((p) => (
                              <Badge
                                key={p.id}
                                className={
                                  type === "team"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                                }
                              >
                                {p.name}
                              </Badge>
                            ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`${resource.id}-none`}
                        checked={permissions[resource.id] === "none"}
                        onCheckedChange={() => handlePermissionChange(resource.id, "none")}
                        className="data-[state=checked]:bg-gray-400"
                      />
                      <Label htmlFor={`${resource.id}-none`} className="flex items-center gap-1">
                        No access
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>No access to this resource</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                    </div>

                    {resource.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Switch
                          id={`${resource.id}-${permission.id}`}
                          checked={permissions[resource.id] === permission.id}
                          onCheckedChange={() => handlePermissionChange(resource.id, permission.id)}
                          className={
                            type === "team" ? "data-[state=checked]:bg-blue-600" : "data-[state=checked]:bg-purple-600"
                          }
                        />
                        <Label htmlFor={`${resource.id}-${permission.id}`} className="flex items-center gap-1">
                          {permission.name}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{permission.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {conflicts.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-400">Permission Conflicts Detected</h4>
                    <ul className="mt-1 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                      {conflicts.map((conflict, index) => (
                        <li key={index}>{conflict}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors ${
                    currentTemplate === template.id
                      ? type === "team"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-purple-500 bg-purple-50 dark:bg-purple-950"
                      : ""
                  }`}
                  onClick={() => applyTemplate(template.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    {currentTemplate === template.id && (
                      <Badge
                        className={
                          type === "team"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        }
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
              ))}
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Template Details</h3>
              <p className="text-sm text-muted-foreground">
                This shows the permissions that will be applied with the selected template.
              </p>

              <div className="rounded-lg border p-4 space-y-4">
                {resources.map((resource) => {
                  const templatePermission =
                    templates.find((t) => t.id === currentTemplate)?.permissions[resource.id] || "none"
                  const permissionName =
                    templatePermission === "none"
                      ? "No access"
                      : resource.permissions.find((p) => p.id === templatePermission)?.name || templatePermission

                  return (
                    <div key={resource.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-muted/50 rounded-md">{resource.icon}</div>
                        <span>{resource.name}</span>
                      </div>
                      <Badge
                        variant={templatePermission === "none" ? "outline" : "default"}
                        className={
                          templatePermission === "none"
                            ? "bg-gray-50"
                            : type === "team"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        }
                      >
                        {permissionName}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Technical Scopes</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {type === "team"
                    ? "These are the underlying permission scopes that will be assigned to this team member."
                    : "These are the OAuth scopes that will be assigned to this client."}
                </p>

                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="space-y-2">
                    {Object.entries(permissions).map(([resourceId, permissionValue]) => {
                      if (permissionValue === "none") return null

                      const resource = resources.find((r) => r.id === resourceId)
                      if (!resource) return null

                      return (
                        <div key={`${resourceId}-${permissionValue}`} className="flex items-center gap-2">
                          <Shield className={`h-4 w-4 ${type === "team" ? "text-blue-500" : "text-purple-500"}`} />
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {resourceId}.{permissionValue}
                          </code>
                          <span className="text-xs text-muted-foreground">
                            {resource.permissions.find((p) => p.id === permissionValue)?.description}
                          </span>
                        </div>
                      )
                    })}

                    {Object.values(permissions).every((p) => p === "none") && (
                      <p className="text-sm text-muted-foreground">No permissions assigned</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <h3 className="font-medium mb-2">Permission Conflicts</h3>
                {conflicts.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>No permission conflicts detected</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conflicts.map((conflict, index) => (
                      <div key={index} className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{conflict}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSave}
            className={type === "team" ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700"}
          >
            Save Permissions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
