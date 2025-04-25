"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
import { Edit, MoreHorizontal, Plus, Search, Shield, Trash, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for roles
const roles = [
  {
    id: "role_1",
    name: "Administrator",
    description: "Full access to all resources",
    permissions: [
      "user.read",
      "user.write",
      "user.delete",
      "license.read",
      "license.write",
      "license.delete",
      "session.read",
      "session.revoke",
    ],
    color: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800",
  },
  {
    id: "role_2",
    name: "Support",
    description: "Can view users and manage sessions",
    permissions: ["user.read", "session.read", "session.revoke"],
    color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800",
  },
  {
    id: "role_3",
    name: "Developer",
    description: "Can manage licenses and view users",
    permissions: ["user.read", "license.read", "license.write"],
    color: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800",
  },
  {
    id: "role_4",
    name: "Signin Bot",
    description: "Can only authenticate users",
    permissions: ["auth.signin"],
    color:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800",
  },
]

// Mock data for permissions
const permissions = [
  { id: "user.read", name: "Read Users", description: "Can view user information" },
  { id: "user.write", name: "Write Users", description: "Can create and update users" },
  { id: "user.delete", name: "Delete Users", description: "Can delete users" },
  { id: "license.read", name: "Read Licenses", description: "Can view license information" },
  { id: "license.write", name: "Write Licenses", description: "Can create and update licenses" },
  { id: "license.delete", name: "Delete Licenses", description: "Can delete licenses" },
  { id: "session.read", name: "Read Sessions", description: "Can view active sessions" },
  { id: "session.revoke", name: "Revoke Sessions", description: "Can revoke active sessions" },
  { id: "auth.signin", name: "Authenticate", description: "Can authenticate users" },
]

// Mock data for OAuth clients with roles
const clientRoles = [
  { clientId: "client_1", name: "Web Dashboard", roleIds: ["role_2"] },
  { clientId: "client_2", name: "Mobile App", roleIds: ["role_3"] },
  { clientId: "client_3", name: "Admin Dashboard", roleIds: ["role_1"] },
]

export function PermissionsTab({ appId }: { appId: string }) {
  const [activeTab, setActiveTab] = useState("roles")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false)
  const [isEditPermissionsDialogOpen, setIsEditPermissionsDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const { toast } = useToast()

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [],
    color: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800",
  })

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewRole((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateRole = () => {
    // In a real app, this would create a new role
    setIsCreateRoleDialogOpen(false)
    toast({
      title: "Role Created",
      description: `${newRole.name} has been created successfully.`,
    })
  }

  const handleEditPermissions = (role) => {
    setSelectedRole(role)
    setSelectedPermissions(role.permissions)
    setIsEditPermissionsDialogOpen(true)
  }

  const handleSavePermissions = () => {
    // In a real app, this would update the role's permissions
    setIsEditPermissionsDialogOpen(false)
    toast({
      title: "Permissions Updated",
      description: `Permissions for ${selectedRole.name} have been updated.`,
    })
  }

  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setSelectedPermissions((prev) => [...prev, permissionId])
    } else {
      setSelectedPermissions((prev) => prev.filter((id) => id !== permissionId))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">OAuth Client Permissions</h2>
          <p className="text-muted-foreground">Configure what this OAuth client can access</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full md:w-auto">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="matrix">Permission Matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6 space-y-6">
          <Card className="bg-card dark:bg-[#1E1E1E]">
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Role Management</CardTitle>
                  <CardDescription>Create and manage roles with predefined permissions</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search roles..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Role</DialogTitle>
                        <DialogDescription>Create a new role with predefined permissions.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="role-name">Role Name</Label>
                          <Input
                            id="role-name"
                            name="name"
                            value={newRole.name}
                            onChange={handleInputChange}
                            placeholder="Administrator"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role-description">Description</Label>
                          <Input
                            id="role-description"
                            name="description"
                            value={newRole.description}
                            onChange={handleInputChange}
                            placeholder="Full access to all resources"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="role-color">Color</Label>
                          <select
                            id="role-color"
                            name="color"
                            value={newRole.color}
                            onChange={handleInputChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option value="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800">
                              Gray
                            </option>
                            <option value="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800">
                              Red
                            </option>
                            <option value="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">
                              Blue
                            </option>
                            <option value="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
                              Green
                            </option>
                            <option value="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-300 dark:border-purple-800">
                              Purple
                            </option>
                          </select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateRole}>Create Role</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoles.map((role) => (
                  <Card key={role.id} className={`overflow-hidden border ${role.color}`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditPermissions(role)}>
                              <Shield className="mr-2 h-4 w-4" />
                              Edit Permissions
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Permissions</Label>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permId) => {
                            const perm = permissions.find((p) => p.id === permId)
                            return (
                              <Badge key={permId} variant="secondary" className="text-xs">
                                {perm ? perm.name : permId}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Assigned Clients</Label>
                        <div>
                          {clientRoles.filter((cr) => cr.roleIds.includes(role.id)).length > 0 ? (
                            <div className="space-y-1">
                              {clientRoles
                                .filter((cr) => cr.roleIds.includes(role.id))
                                .map((client) => (
                                  <div key={client.clientId} className="text-sm flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                    {client.name}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">No clients assigned</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="mt-6">
          <Card className="bg-card dark:bg-[#1E1E1E]">
            <CardHeader>
              <CardTitle>Permission Matrix</CardTitle>
              <CardDescription>Visual representation of roles and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border-b">Permission</th>
                      {roles.map((role) => (
                        <th key={role.id} className="text-center p-2 border-b">
                          <div className="flex flex-col items-center">
                            <span>{role.name}</span>
                            <Badge variant="outline" className={role.color.split(" ").slice(0, 2).join(" ")}>
                              {role.permissions.length} perms
                            </Badge>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((permission) => (
                      <tr key={permission.id} className="hover:bg-muted/30">
                        <td className="p-2 border-b">
                          <div>
                            <div className="font-medium">{permission.name}</div>
                            <div className="text-xs text-muted-foreground">{permission.description}</div>
                          </div>
                        </td>
                        {roles.map((role) => (
                          <td key={`${role.id}-${permission.id}`} className="text-center p-2 border-b">
                            {role.permissions.includes(permission.id) ? (
                              <div className="flex justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-5 w-5 text-primary"
                                >
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              </div>
                            ) : (
                              <div className="flex justify-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="h-5 w-5 text-muted-foreground/30"
                                >
                                  <path d="M18 6 6 18" />
                                  <path d="m6 6 12 12" />
                                </svg>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Permissions Dialog */}
      <Dialog open={isEditPermissionsDialogOpen} onOpenChange={setIsEditPermissionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>{selectedRole && `Update permissions for ${selectedRole.name}`}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`permission-${permission.id}`}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={`permission-${permission.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
