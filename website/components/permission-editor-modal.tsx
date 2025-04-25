"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Search, Info, AlertTriangle, CheckCircle2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

// Mock data for resources
const resources = [
  {
    id: "resource_1",
    name: "User Management",
    description: "Manage users and their profiles",
    permissions: [
      { id: "user.read", name: "View Users", description: "Can view user profiles" },
      { id: "user.write", name: "Edit Users", description: "Can edit user profiles" },
      { id: "user.delete", name: "Delete Users", description: "Can delete users" },
      { id: "user.admin", name: "Admin Users", description: "Full control over users" },
    ],
  },
  {
    id: "resource_2",
    name: "License Management",
    description: "Manage license keys and subscriptions",
    permissions: [
      { id: "license.read", name: "View Licenses", description: "Can view license keys" },
      { id: "license.write", name: "Create/Edit Licenses", description: "Can create and edit license keys" },
      { id: "license.delete", name: "Delete Licenses", description: "Can delete license keys" },
      { id: "license.admin", name: "Admin Licenses", description: "Full control over licenses" },
    ],
  },
  {
    id: "resource_3",
    name: "Application Management",
    description: "Manage OAuth clients and applications",
    permissions: [
      { id: "app.read", name: "View Applications", description: "Can view applications" },
      { id: "app.write", name: "Edit Applications", description: "Can edit applications" },
      { id: "app.delete", name: "Delete Applications", description: "Can delete applications" },
      { id: "app.admin", name: "Admin Applications", description: "Full control over applications" },
    ],
  },
  {
    id: "resource_4",
    name: "Team Management",
    description: "Manage team members and roles",
    permissions: [
      { id: "team.read", name: "View Team", description: "Can view team members" },
      { id: "team.write", name: "Edit Team", description: "Can edit team members" },
      { id: "team.delete", name: "Remove Team Members", description: "Can remove team members" },
      { id: "team.admin", name: "Admin Team", description: "Full control over team" },
    ],
  },
  {
    id: "resource_5",
    name: "Analytics",
    description: "Access to analytics and reporting",
    permissions: [
      { id: "analytics.read", name: "View Analytics", description: "Can view analytics data" },
      { id: "analytics.export", name: "Export Analytics", description: "Can export analytics data" },
      { id: "analytics.admin", name: "Admin Analytics", description: "Full control over analytics" },
    ],
  },
]

// Role templates
const roleTemplates = [
  {
    id: "role_admin",
    name: "Admin",
    description: "Full access to all resources",
    permissions: ["user.admin", "license.admin", "app.admin", "team.admin", "analytics.admin"],
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    id: "role_editor",
    name: "Editor",
    description: "Can view and edit resources",
    permissions: [
      "user.read",
      "user.write",
      "license.read",
      "license.write",
      "app.read",
      "app.write",
      "team.read",
      "team.write",
      "analytics.read",
      "analytics.export",
    ],
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  },
  {
    id: "role_viewer",
    name: "Viewer",
    description: "Read-only access to resources",
    permissions: ["user.read", "license.read", "app.read", "team.read", "analytics.read"],
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  },
]

interface PermissionEditorModalProps {
  isOpen: boolean
  onClose: () => void
  member?: any
  client?: any
  type: "team" | "oauth"
}

export function PermissionEditorModal({ isOpen, onClose, member, client, type }: PermissionEditorModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [selectedTab, setSelectedTab] = useState("resources")
  const [permissionConflicts, setPermissionConflicts] = useState<string[]>([])
  const { toast } = useToast()

  // Set initial permissions based on member or client
  useEffect(() => {
    if (member) {
      // In a real app, you would fetch the member's permissions
      // For now, we'll use the role templates
      const roleTemplate = roleTemplates.find((template) => template.id === `role_${member.role}`)
      setSelectedPermissions(roleTemplate?.permissions || [])
    } else if (client) {
      setSelectedPermissions(client.scopes || [])
    } else {
      setSelectedPermissions([])
    }

    // Reset conflicts
    setPermissionConflicts([])
  }, [member, client, isOpen])

  // Filter resources based on search query
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      searchQuery === "" ||
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.permissions.some(
        (permission) =>
          permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          permission.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )

    return matchesSearch
  })

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        // Check for conflicts when removing permissions
        const newPermissions = prev.filter((id) => id !== permissionId)
        checkForConflicts(newPermissions)
        return newPermissions
      } else {
        // Check for conflicts when adding permissions
        const newPermissions = [...prev, permissionId]
        checkForConflicts(newPermissions)
        return newPermissions
      }
    })
  }

  // Check for permission conflicts
  const checkForConflicts = (permissions: string[]) => {
    const conflicts: string[] = []

    // Example conflict: Having delete permission without read permission
    resources.forEach((resource) => {
      const resourcePermissions = resource.permissions.map((p) => p.id)
      const selectedResourcePermissions = permissions.filter((p) => resourcePermissions.includes(p))

      // Check if has delete but not read
      if (
        selectedResourcePermissions.some((p) => p.includes(".delete")) &&
        !selectedResourcePermissions.some((p) => p.includes(".read"))
      ) {
        conflicts.push(`${resource.name}: Delete permission requires Read permission`)
      }

      // Check if has write but not read
      if (
        selectedResourcePermissions.some((p) => p.includes(".write")) &&
        !selectedResourcePermissions.some((p) => p.includes(".read"))
      ) {
        conflicts.push(`${resource.name}: Write permission requires Read permission`)
      }
    })

    setPermissionConflicts(conflicts)
  }

  // Apply role template
  const applyRoleTemplate = (templateId: string) => {
    const template = roleTemplates.find((t) => t.id === templateId)
    if (template) {
      setSelectedPermissions(template.permissions)
      checkForConflicts(template.permissions)
    }
  }

  // Handle save
  const handleSave = () => {
    // In a real app, you would save the permissions to the server
    console.log("Saving permissions:", selectedPermissions)

    // Show toast notification
    toast({
      title: `Permissions updated for ${member ? member.name : client.name}`,
      description: "The changes have been saved successfully.",
      duration: 3000,
    })

    onClose()
  }

  // Get entity name and details
  const entityName = member ? member.name : client ? client.name : ""
  const entityDescription = member
    ? `${member.email} • ${member.role.charAt(0).toUpperCase() + member.role.slice(1)}`
    : client
      ? `${client.description} • ${client.type.charAt(0).toUpperCase() + client.type.slice(1)}`
      : ""

  // Get entity avatar
  const entityAvatar = member
    ? member.avatar
    : client
      ? null // Clients don't have avatars, we'll use the icon
      : null

  // Get entity icon (for clients)
  const entityIcon = client ? client.icon : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className={type === "team" ? "text-blue-600" : "text-purple-600"}>
            {type === "team" ? "Edit Team Member Permissions" : "Edit OAuth Client Permissions"}
          </DialogTitle>
          <DialogDescription>
            {type === "team"
              ? "Manage what this team member can access and modify"
              : "Configure what this OAuth client can access and modify"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3 py-2">
          {type === "team" ? (
            <Avatar className="h-10 w-10">
              <AvatarImage src={entityAvatar || "/placeholder.svg"} alt={entityName} />
              <AvatarFallback>{entityName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="text-3xl">{entityIcon}</div>
          )}
          <div>
            <h3 className="font-medium">{entityName}</h3>
            <p className="text-sm text-muted-foreground">{entityDescription}</p>
          </div>
        </div>

        <Separator />

        <Tabs
          defaultValue="resources"
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="flex-1 flex flex-col"
        >
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <div className="relative w-[250px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search permissions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Resources Tab */}
          <TabsContent value="resources" className="flex-1 mt-4">
            <ScrollArea className="flex-1 h-[50vh]">
              <div className="space-y-6 pr-4">
                {filteredResources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No resources found matching your search.</div>
                ) : (
                  filteredResources.map((resource) => (
                    <div key={resource.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{resource.name}</h3>
                        <p className="text-sm text-muted-foreground">{resource.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {resource.permissions.map((permission) => (
                          <div
                            key={permission.id}
                            className={`flex items-start space-x-2 p-2 rounded-md ${
                              selectedPermissions.includes(permission.id)
                                ? type === "team"
                                  ? "bg-blue-50 dark:bg-blue-950"
                                  : "bg-purple-50 dark:bg-purple-950"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            <Checkbox
                              id={permission.id}
                              checked={selectedPermissions.includes(permission.id)}
                              onCheckedChange={() => handlePermissionToggle(permission.id)}
                              className={type === "team" ? "text-blue-600" : "text-purple-600"}
                            />
                            <div className="grid gap-1 leading-none">
                              <div className="flex items-center gap-1">
                                <Label
                                  htmlFor={permission.id}
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  {permission.name}
                                </Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">{permission.description}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="flex-1 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roleTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-md border cursor-pointer hover:shadow-sm transition-shadow ${
                    template.permissions.every((p) => selectedPermissions.includes(p)) &&
                    selectedPermissions.every((p) => template.permissions.includes(p))
                      ? "border-2 " + (type === "team" ? "border-blue-500" : "border-purple-500")
                      : ""
                  }`}
                  onClick={() => applyRoleTemplate(template.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={template.color}>{template.name}</Badge>
                    <Checkbox
                      checked={
                        template.permissions.every((p) => selectedPermissions.includes(p)) &&
                        selectedPermissions.every((p) => template.permissions.includes(p))
                      }
                      className={type === "team" ? "text-blue-600" : "text-purple-600"}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="text-xs text-muted-foreground">{template.permissions.length} permissions</div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Template Details</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Templates provide a quick way to assign common permission sets. Select a template above to see its
                permissions.
              </p>

              <div className="border rounded-md p-4">
                <h4 className="font-medium mb-2">Current Permissions</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedPermissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No permissions selected</p>
                  ) : (
                    selectedPermissions.map((permissionId) => {
                      // Find the permission details
                      let permissionName = permissionId
                      resources.forEach((resource) => {
                        const permission = resource.permissions.find((p) => p.id === permissionId)
                        if (permission) {
                          permissionName = permission.name
                        }
                      })

                      return (
                        <Badge key={permissionId} variant="outline" className="text-xs">
                          {permissionName}
                        </Badge>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="flex-1 mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Raw Permissions</h3>
                <p className="text-sm text-muted-foreground mb-2">View and edit the raw permission identifiers.</p>
                <div className="border rounded-md p-2">
                  <Input
                    value={selectedPermissions.join(", ")}
                    onChange={(e) => {
                      const newPermissions = e.target.value
                        .split(",")
                        .map((p) => p.trim())
                        .filter(Boolean)
                      setSelectedPermissions(newPermissions)
                      checkForConflicts(newPermissions)
                    }}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Permission Conflicts</h3>
                {permissionConflicts.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-500">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>No permission conflicts detected</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {permissionConflicts.map((conflict, index) => (
                      <div key={index} className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{conflict}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Effective Access</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This shows what the entity will be able to access with the selected permissions.
                </p>
                <div className="border rounded-md p-4 space-y-4">
                  {resources.map((resource) => {
                    const resourcePermissions = resource.permissions.map((p) => p.id)
                    const selectedResourcePermissions = selectedPermissions.filter((p) =>
                      resourcePermissions.includes(p),
                    )

                    // Determine access level
                    let accessLevel = "No Access"
                    let accessColor = "text-muted-foreground"

                    if (selectedResourcePermissions.some((p) => p.includes(".admin"))) {
                      accessLevel = "Full Access"
                      accessColor = "text-green-600 dark:text-green-500"
                    } else if (selectedResourcePermissions.some((p) => p.includes(".delete"))) {
                      accessLevel = "Delete Access"
                      accessColor = "text-amber-600 dark:text-amber-500"
                    } else if (selectedResourcePermissions.some((p) => p.includes(".write"))) {
                      accessLevel = "Write Access"
                      accessColor = "text-blue-600 dark:text-blue-500"
                    } else if (selectedResourcePermissions.some((p) => p.includes(".read"))) {
                      accessLevel = "Read Access"
                      accessColor = "text-purple-600 dark:text-purple-500"
                    }

                    return (
                      <div key={resource.id} className="flex items-center justify-between">
                        <span className="font-medium">{resource.name}</span>
                        <span className={accessColor}>{accessLevel}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {permissionConflicts.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Permission Conflicts Detected</span>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
              There are potential issues with your permission configuration. See the Advanced tab for details.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="text-sm text-muted-foreground">{selectedPermissions.length} permissions selected</div>
          <div>
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className={type === "team" ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700"}
            >
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
