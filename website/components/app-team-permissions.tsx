"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, ArrowLeft, Globe, Shield, Users } from "lucide-react"
import { ApplicationSelector } from "./application-selector"

// Mock data for organizations
const organizations = [
  { id: "org_1", name: "Acme Inc.", members: 12 },
  { id: "org_2", name: "Globex Corporation", members: 8 },
  { id: "org_3", name: "Initech", members: 5 },
]

// Mock data for applications
const applications = [
  {
    id: "app_1",
    name: "Web Dashboard",
    type: "web",
    clientId: "client_1a2b3c4d5e6f7g8h9i",
    organization: "Acme Inc.",
  },
  {
    id: "app_2",
    name: "Discord Bot",
    type: "service",
    clientId: "client_2a3b4c5d6e7f8g9h0i",
    organization: "Acme Inc.",
  },
  {
    id: "app_3",
    name: "License Manager Bot",
    type: "service",
    clientId: "client_3a4b5c6d7e8f9g0h1i",
    organization: "Globex Corporation",
  },
  {
    id: "app_4",
    name: "Legacy System",
    type: "web",
    clientId: "client_4a5b6c7d8e9f0g1h2i",
    organization: "Initech",
  },
]

// Mock data for team members
const teamMembers = [
  {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    role: "Administrator",
    organization: "Acme Inc.",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user_2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Developer",
    organization: "Acme Inc.",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user_3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Analyst",
    organization: "Globex Corporation",
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user_4",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Developer",
    organization: "Acme Inc.",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user_5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "Support",
    organization: "Initech",
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock data for application permissions
const appPermissions = [
  {
    userId: "user_1",
    applicationId: "app_1",
    permissions: ["view", "edit", "delete", "manage_licenses", "manage_users"],
  },
  {
    userId: "user_2",
    applicationId: "app_1",
    permissions: ["view", "edit"],
  },
  {
    userId: "user_4",
    applicationId: "app_1",
    permissions: ["view"],
  },
  {
    userId: "user_1",
    applicationId: "app_2",
    permissions: ["view", "edit", "delete", "manage_licenses", "manage_users"],
  },
  {
    userId: "user_2",
    applicationId: "app_2",
    permissions: ["view", "edit", "manage_licenses"],
  },
  {
    userId: "user_3",
    applicationId: "app_3",
    permissions: ["view", "edit", "delete", "manage_licenses", "manage_users"],
  },
  {
    userId: "user_5",
    applicationId: "app_4",
    permissions: ["view", "edit", "manage_licenses"],
  },
]

// Available permissions
const availablePermissions = [
  { id: "view", name: "View Application", description: "Can view application details" },
  { id: "edit", name: "Edit Application", description: "Can edit application settings" },
  { id: "delete", name: "Delete Application", description: "Can delete the application" },
  { id: "manage_licenses", name: "Manage Licenses", description: "Can create and manage license keys" },
  { id: "manage_users", name: "Manage Users", description: "Can add and remove users from the application" },
]

export function AppTeamPermissions() {
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0])
  const [selectedApplicationId, setSelectedApplicationId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [editPermissionsDialogOpen, setEditPermissionsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedPermissions, setSelectedPermissions] = useState([])

  // Get the selected application
  const selectedApplication = applications.find((app) => app.id === selectedApplicationId)

  // Get users with permissions for the selected application
  const usersWithPermissions = selectedApplicationId
    ? appPermissions
        .filter((p) => p.applicationId === selectedApplicationId)
        .map((p) => {
          const user = teamMembers.find((u) => u.id === p.userId)
          return {
            ...user,
            permissions: p.permissions,
          }
        })
    : []

  // Filter users based on search query
  const filteredUsers = usersWithPermissions.filter((user) => {
    return (
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  // Get users that can be added (not already having permissions)
  const usersToAdd = teamMembers.filter((user) => {
    return (
      user.organization === selectedOrganization.name &&
      !appPermissions.some((p) => p.applicationId === selectedApplicationId && p.userId === user.id)
    )
  })

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org)
    setSelectedApplicationId(null)
  }

  const handleApplicationSelect = (appId) => {
    setSelectedApplicationId(appId)
  }

  const handleBackToApplications = () => {
    setSelectedApplicationId(null)
  }

  const handleAddUser = (userId) => {
    // In a real app, this would call an API to add the user
    console.log("Adding user to application:", userId, selectedApplicationId)
    setAddUserDialogOpen(false)
  }

  const handleEditPermissions = (user) => {
    setSelectedUser(user)
    setSelectedPermissions(user.permissions || [])
    setEditPermissionsDialogOpen(true)
  }

  const handleSavePermissions = () => {
    // In a real app, this would call an API to update permissions
    console.log("Saving permissions for user:", selectedUser?.id, selectedPermissions)
    setEditPermissionsDialogOpen(false)
  }

  const handlePermissionChange = (permissionId, checked) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId])
    } else {
      setSelectedPermissions(selectedPermissions.filter((id) => id !== permissionId))
    }
  }

  const handleRemoveUser = (userId) => {
    // In a real app, this would call an API to remove the user
    console.log("Removing user from application:", userId, selectedApplicationId)
  }

  // If no application is selected, show the application selector
  if (!selectedApplicationId) {
    return (
      <ApplicationSelector
        onApplicationSelect={handleApplicationSelect}
        selectedOrganization={selectedOrganization}
        onOrganizationChange={handleOrganizationChange}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Application Context Banner */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Application Context</h3>
                <p className="text-sm text-muted-foreground">
                  Managing team permissions for <span className="font-medium">{selectedApplication?.name}</span> in{" "}
                  <span className="font-medium">{selectedOrganization.name}</span>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleBackToApplications}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Applications
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Permissions</h2>
          <p className="text-muted-foreground">Manage who can access and manage this application</p>
        </div>
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Team Member</DialogTitle>
              <DialogDescription>
                Add a team member to {selectedApplication?.name} and set their permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="mb-2 block">Select Team Member</Label>
              {usersToAdd.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  All team members in this organization already have access to this application.
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {usersToAdd.map((user) => (
                    <Card
                      key={user.id}
                      className="p-3 hover:bg-muted cursor-pointer"
                      onClick={() => handleAddUser(user.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {user.role}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>People who have access to {selectedApplication?.name}</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search team members..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No team members found. Add team members to give them access to this application.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 font-normal bg-secondary">
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.map((permission) => {
                          const permInfo = availablePermissions.find((p) => p.id === permission)
                          return (
                            <Badge key={permission} variant="secondary" className="text-xs">
                              {permInfo?.name || permission}
                            </Badge>
                          )
                        })}
                      </div>
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
                          <DropdownMenuItem onClick={() => handleEditPermissions(user)}>
                            <Shield className="mr-2 h-4 w-4" />
                            Edit Permissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleRemoveUser(user.id)}>
                            <Users className="mr-2 h-4 w-4" />
                            Remove Access
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

      {/* Edit Permissions Dialog */}
      <Dialog open={editPermissionsDialogOpen} onOpenChange={setEditPermissionsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permissions</DialogTitle>
            <DialogDescription>
              Update permissions for {selectedUser?.name} on {selectedApplication?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {availablePermissions.map((permission) => (
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
            <Button variant="outline" onClick={() => setEditPermissionsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePermissions}>Save Permissions</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
