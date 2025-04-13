"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RolesPermissionsView } from "./roles-permissions-view"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Edit, Plus, Search, Shield, Trash } from "lucide-react"
import { OrganizationSelector } from "./organization-selector"

// Mock data for team members with roles and organizations
const teamMembers = [
  {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    role: "Administrator",
    organization: "Acme Inc.",
    status: "active",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user_2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Developer",
    organization: "Acme Inc.",
    status: "active",
    lastActive: "1 day ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user_3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Analyst",
    organization: "Globex Corporation",
    status: "inactive",
    lastActive: "3 days ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user_4",
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Developer",
    organization: "Acme Inc.",
    status: "active",
    lastActive: "Just now",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "user_5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "Support",
    organization: "Initech",
    status: "active",
    lastActive: "5 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock data for organizations
const organizations = [
  { id: "org_1", name: "Acme Inc.", members: 12 },
  { id: "org_2", name: "Globex Corporation", members: 8 },
  { id: "org_3", name: "Initech", members: 5 },
]

// Mock data for roles
const roles = [
  { id: "role_1", name: "Administrator", description: "Full system access with all permissions", members: 3 },
  { id: "role_2", name: "Developer", description: "Access to development resources and API keys", members: 12 },
  { id: "role_3", name: "Analyst", description: "Read-only access to analytics and reports", members: 8 },
  { id: "role_4", name: "Support", description: "Access to user management and support tools", members: 5 },
]

export function TeamAccessView({ initialTab = "members" }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0])
  const [roleFilter, setRoleFilter] = useState("all")
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [newInvite, setNewInvite] = useState({
    email: "",
    role: "role_2", // Default to Developer
    organization: selectedOrganization.id,
  })
  const [editMember, setEditMember] = useState({
    name: "",
    email: "",
    role: "",
    status: "",
  })

  // Set active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  // Filter team members based on search, selected organization, and role filter
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      searchQuery === "" ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesOrg = member.organization === selectedOrganization.name
    const matchesRole = roleFilter === "all" || member.role === roleFilter

    return matchesSearch && matchesOrg && matchesRole
  })

  const handleInvite = () => {
    // In a real app, this would send an invitation
    console.log("Inviting:", newInvite)
    setInviteDialogOpen(false)
    setNewInvite({
      email: "",
      role: "role_2",
      organization: selectedOrganization.id,
    })
  }

  const handleEditMember = (member) => {
    setSelectedMember(member)
    setEditMember({
      name: member.name,
      email: member.email,
      role: roles.find((r) => r.name === member.role)?.id || "role_2",
      status: member.status,
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    // In a real app, this would update the member
    console.log("Saving edits for:", selectedMember?.id, editMember)
    setEditDialogOpen(false)
  }

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org)
    // Reset role filter when changing organization
    setRoleFilter("all")
    // Update invite form with new organization
    setNewInvite({
      ...newInvite,
      organization: org.id,
    })
  }

  return (
    <div className="space-y-6">
      {/* Organization Selector */}
      <OrganizationSelector
        organizations={organizations}
        selectedOrganization={selectedOrganization}
        onOrganizationChange={handleOrganizationChange}
      />

      {/* Main Content */}
      <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full md:w-auto grid grid-cols-2 bg-white border">
            <TabsTrigger value="members" className="px-2 md:px-4 text-xs sm:text-sm">
              Team Members
            </TabsTrigger>
            <TabsTrigger value="roles" className="px-2 md:px-4 text-xs sm:text-sm">
              Roles & Permissions
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="members" className="mt-6 space-y-6">
          <Card className="shadow-sm border-border bg-white">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between border-b gap-4">
              <div className="space-y-1.5">
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage users in the <span className="font-medium">{selectedOrganization.name}</span> organization
                </CardDescription>
              </div>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join {selectedOrganization.name} with a specific role.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={newInvite.email}
                        onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newInvite.role}
                        onValueChange={(value) => setNewInvite({ ...newInvite, role: value })}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        This determines what permissions the user will have.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleInvite} disabled={!newInvite.email}>
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Member Dialog */}
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Team Member</DialogTitle>
                    <DialogDescription>Update details for {selectedMember?.name}</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-name">Name</Label>
                      <Input
                        id="edit-name"
                        value={editMember.name}
                        onChange={(e) => setEditMember({ ...editMember, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-email">Email</Label>
                      <Input
                        id="edit-email"
                        type="email"
                        value={editMember.email}
                        onChange={(e) => setEditMember({ ...editMember, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-role">Role</Label>
                      <Select
                        value={editMember.role}
                        onValueChange={(value) => setEditMember({ ...editMember, role: value })}
                      >
                        <SelectTrigger id="edit-role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select
                        value={editMember.status}
                        onValueChange={(value) => setEditMember({ ...editMember, status: value })}
                      >
                        <SelectTrigger id="edit-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter className="flex justify-between items-center">
                    <Button variant="destructive" size="sm" className="mr-auto">
                      <Trash className="h-4 w-4 mr-1" />
                      Remove User
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveEdit}>Save Changes</Button>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mb-6 mt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search team members..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Role</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mobile card view */}
              <div className="grid grid-cols-1 gap-4 sm:hidden">
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No team members found in this organization.
                  </div>
                ) : (
                  filteredMembers.map((member) => (
                    <Card key={member.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium">{member.name}</h3>
                            <Badge
                              variant={member.status === "active" ? "default" : "secondary"}
                              className={
                                member.status === "active"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-gray-500 hover:bg-gray-600"
                              }
                            >
                              {member.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="flex items-center gap-1 font-normal bg-secondary">
                              <Shield className="h-3 w-3" />
                              {member.role}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-muted-foreground">Last active: {member.lastActive}</span>
                            <Button variant="outline" size="sm" onClick={() => handleEditMember(member)}>
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              {/* Desktop table view */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Last Active</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No team members found in this organization.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMembers.map((member) => (
                        <TableRow key={member.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium">{member.name}</span>
                                <span className="text-xs text-muted-foreground">{member.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 font-normal bg-secondary">
                              <Shield className="h-3 w-3" />
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              variant={member.status === "active" ? "default" : "secondary"}
                              className={
                                member.status === "active"
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-gray-500 hover:bg-gray-600"
                              }
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">{member.lastActive}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditMember(member)}>
                                <Edit className="h-3.5 w-3.5 mr-1" />
                                Edit
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RolesPermissionsView selectedOrganization={selectedOrganization} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
