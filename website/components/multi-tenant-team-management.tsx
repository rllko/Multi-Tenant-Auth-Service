"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  Filter,
  Globe,
  Info,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash,
  User,
  X,
} from "lucide-react"

// Mock data for tenants
const tenants = [
  { id: "tenant_1", name: "Acme Inc.", members: 12, color: "#4f46e5" },
  { id: "tenant_2", name: "Globex Corporation", members: 8, color: "#0ea5e9" },
  { id: "tenant_3", name: "Initech", members: 5, color: "#10b981" },
  { id: "tenant_4", name: "Umbrella Corp", members: 7, color: "#f59e0b" },
  { id: "tenant_5", name: "Stark Industries", members: 15, color: "#ef4444" },
]

// Mock data for role templates
const roleTemplates = [
  {
    id: "role_viewer",
    name: "Viewer",
    description: "Can view resources but not modify them",
    permissions: ["view"],
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "role_editor",
    name: "Editor",
    description: "Can view and edit resources",
    permissions: ["view", "edit"],
    color: "bg-green-100 text-green-800 border-green-200",
  },
  {
    id: "role_admin",
    name: "Admin",
    description: "Full control over tenant resources",
    permissions: ["view", "edit", "delete", "manage_users", "manage_licenses"],
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "role_system_admin",
    name: "System Admin",
    description: "Full control over all tenants and system settings",
    permissions: ["view", "edit", "delete", "manage_users", "manage_licenses", "manage_tenants", "manage_system"],
    color: "bg-red-100 text-red-800 border-red-200",
    isSystemRole: true,
  },
]

// Available permissions with categories
const permissionCategories = [
  {
    id: "general",
    name: "General",
    permissions: [
      { id: "view", name: "View", description: "Can view resources in this tenant" },
      { id: "edit", name: "Edit", description: "Can edit resources in this tenant" },
      { id: "delete", name: "Delete", description: "Can delete resources in this tenant" },
    ],
  },
  {
    id: "users",
    name: "User Management",
    permissions: [
      { id: "manage_users", name: "Manage Users", description: "Can add, edit, and remove users" },
      { id: "invite_users", name: "Invite Users", description: "Can invite new users to the tenant" },
    ],
  },
  {
    id: "licenses",
    name: "License Management",
    permissions: [
      { id: "manage_licenses", name: "Manage Licenses", description: "Can create and manage license keys" },
      { id: "view_licenses", name: "View Licenses", description: "Can view license keys and status" },
    ],
  },
  {
    id: "applications",
    name: "Application Management",
    permissions: [
      { id: "manage_applications", name: "Manage Applications", description: "Can create and configure applications" },
      { id: "view_applications", name: "View Applications", description: "Can view application details" },
    ],
  },
  {
    id: "system",
    name: "System",
    permissions: [
      {
        id: "manage_tenants",
        name: "Manage Tenants",
        description: "Can create and manage tenants",
        isSystemOnly: true,
      },
      { id: "manage_system", name: "Manage System", description: "Can configure system settings", isSystemOnly: true },
    ],
  },
]

// Mock data for team members with roles across tenants
const teamMembers = [
  {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    status: "active",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
    tenantRoles: [
      { tenantId: "tenant_1", roleId: "role_admin" },
      { tenantId: "tenant_2", roleId: "role_viewer" },
    ],
    systemRole: "role_system_admin",
  },
  {
    id: "user_2",
    name: "Jane Smith",
    email: "jane@example.com",
    status: "active",
    lastActive: "1 day ago",
    avatar: "/placeholder.svg?height=40&width=40",
    tenantRoles: [
      { tenantId: "tenant_1", roleId: "role_editor" },
      { tenantId: "tenant_3", roleId: "role_admin" },
    ],
  },
  {
    id: "user_3",
    name: "Bob Johnson",
    email: "bob@example.com",
    status: "inactive",
    lastActive: "3 days ago",
    avatar: "/placeholder.svg?height=40&width=40",
    tenantRoles: [{ tenantId: "tenant_2", roleId: "role_admin" }],
  },
  {
    id: "user_4",
    name: "Alice Brown",
    email: "alice@example.com",
    status: "active",
    lastActive: "Just now",
    avatar: "/placeholder.svg?height=40&width=40",
    tenantRoles: [
      { tenantId: "tenant_1", roleId: "role_viewer" },
      { tenantId: "tenant_4", roleId: "role_editor" },
    ],
  },
  {
    id: "user_5",
    name: "Charlie Wilson",
    email: "charlie@example.com",
    status: "pending",
    lastActive: "Never",
    avatar: "/placeholder.svg?height=40&width=40",
    tenantRoles: [{ tenantId: "tenant_1", roleId: "role_editor" }],
  },
  {
    id: "user_6",
    name: "Diana Prince",
    email: "diana@example.com",
    status: "active",
    lastActive: "5 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
    tenantRoles: [
      { tenantId: "tenant_1", roleId: "role_viewer" },
      { tenantId: "tenant_5", roleId: "role_admin" },
    ],
  },
  {
    id: "user_7",
    name: "Ethan Hunt",
    email: "ethan@example.com",
    status: "active",
    lastActive: "1 hour ago",
    avatar: "/placeholder.svg?height=40&width=40",
    tenantRoles: [
      { tenantId: "tenant_3", roleId: "role_editor" },
      { tenantId: "tenant_4", roleId: "role_editor" },
    ],
  },
]

// Mock audit log data
const auditLogEntries = [
  {
    id: "log_1",
    timestamp: "2023-06-15T14:30:00Z",
    user: "John Doe",
    action: "Added user Alice Brown to Acme Inc. with Viewer role",
    tenantId: "tenant_1",
  },
  {
    id: "log_2",
    timestamp: "2023-06-14T10:15:00Z",
    user: "Jane Smith",
    action: "Changed Bob Johnson's role from Viewer to Admin in Globex Corporation",
    tenantId: "tenant_2",
  },
  {
    id: "log_3",
    timestamp: "2023-06-13T16:45:00Z",
    user: "John Doe",
    action: "Removed Charlie Wilson from Initech",
    tenantId: "tenant_3",
  },
  {
    id: "log_4",
    timestamp: "2023-06-12T09:20:00Z",
    user: "System",
    action: "Invited Diana Prince to Acme Inc. with Editor role",
    tenantId: "tenant_1",
  },
  {
    id: "log_5",
    timestamp: "2023-06-11T11:30:00Z",
    user: "John Doe",
    action: "Changed Jane Smith's system role to System Admin",
    tenantId: null,
  },
]

// Helper function to get role by ID
const getRoleById = (roleId) => {
  return roleTemplates.find((role) => role.id === roleId)
}

// Helper function to get tenant by ID
const getTenantById = (tenantId) => {
  return tenants.find((tenant) => tenant.id === tenantId)
}

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date)
}

export function MultiTenantTeamManagement() {
  const [selectedTenantId, setSelectedTenantId] = useState("all")
  const [selectedMemberId, setSelectedMemberId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [showSystemPermissions, setShowSystemPermissions] = useState(false)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [auditLogOpen, setAuditLogOpen] = useState(false)
  const [customPermissionsOpen, setCustomPermissionsOpen] = useState(false)
  const [expandedMembers, setExpandedMembers] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" })

  // New member form state
  const [newMember, setNewMember] = useState({
    email: "",
    name: "",
    tenantId: "",
    roleId: "",
  })

  // Custom permissions state
  const [customPermissions, setCustomPermissions] = useState({
    tenantId: "",
    userId: "",
    permissions: [],
  })

  // Get selected tenant
  const selectedTenant = selectedTenantId !== "all" ? getTenantById(selectedTenantId) : null

  // Get selected member
  const selectedMember = selectedMemberId ? teamMembers.find((m) => m.id === selectedMemberId) : null

  // Filter members based on search, tenant, status, and role
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())

      // Tenant filter
      const matchesTenant =
        selectedTenantId === "all" || member.tenantRoles.some((tr) => tr.tenantId === selectedTenantId)

      // Status filter
      const matchesStatus = statusFilter === "all" || member.status === statusFilter

      // Role filter
      const matchesRole =
        roleFilter === "all" ||
        (selectedTenantId === "all"
          ? member.tenantRoles.some((tr) => getRoleById(tr.roleId)?.id === roleFilter) ||
            member.systemRole === roleFilter
          : member.tenantRoles.some(
              (tr) => tr.tenantId === selectedTenantId && getRoleById(tr.roleId)?.id === roleFilter,
            ))

      return matchesSearch && matchesTenant && matchesStatus && matchesRole
    })
  }, [searchQuery, selectedTenantId, statusFilter, roleFilter, teamMembers])

  // Sort members
  const sortedMembers = useMemo(() => {
    const sortableMembers = [...filteredMembers]

    sortableMembers.sort((a, b) => {
      if (sortConfig.key === "name") {
        return sortConfig.direction === "ascending" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      }

      if (sortConfig.key === "email") {
        return sortConfig.direction === "ascending" ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email)
      }

      if (sortConfig.key === "status") {
        return sortConfig.direction === "ascending"
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status)
      }

      if (sortConfig.key === "lastActive") {
        // This is a simplistic approach - in a real app you'd parse dates
        return sortConfig.direction === "ascending"
          ? a.lastActive.localeCompare(b.lastActive)
          : b.lastActive.localeCompare(a.lastActive)
      }

      return 0
    })

    return sortableMembers
  }, [filteredMembers, sortConfig])

  // Filter audit log entries based on selected tenant
  const filteredAuditLog = useMemo(() => {
    if (selectedTenantId === "all") {
      return auditLogEntries
    }
    return auditLogEntries.filter((entry) => entry.tenantId === selectedTenantId || entry.tenantId === null)
  }, [selectedTenantId])

  // Handle sort request
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Get sort direction icon
  const getSortDirectionIcon = (key) => {
    if (sortConfig.key !== key) {
      return null
    }
    return sortConfig.direction === "ascending" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  // Toggle member expansion
  const toggleMemberExpansion = (memberId) => {
    setExpandedMembers((prev) => ({
      ...prev,
      [memberId]: !prev[memberId],
    }))
  }

  // Handle tenant selection
  const handleTenantSelect = (tenantId) => {
    setSelectedTenantId(tenantId)
    setSelectedMemberId(null)
  }

  // Handle member selection
  const handleMemberSelect = (memberId) => {
    setSelectedMemberId(memberId)

    // Initialize custom permissions if needed
    const member = teamMembers.find((m) => m.id === memberId)
    if (member && selectedTenantId !== "all") {
      const tenantRole = member.tenantRoles.find((tr) => tr.tenantId === selectedTenantId)
      const role = tenantRole ? getRoleById(tenantRole.roleId) : null

      setCustomPermissions({
        tenantId: selectedTenantId,
        userId: memberId,
        permissions: role ? [...role.permissions] : [],
      })
    }
  }

  // Handle invite submission
  const handleInvite = () => {
    console.log("Inviting new member:", newMember)
    setInviteDialogOpen(false)
    setNewMember({
      email: "",
      name: "",
      tenantId: "",
      roleId: "",
    })
  }

  // Handle custom permissions save
  const handleSaveCustomPermissions = () => {
    console.log("Saving custom permissions:", customPermissions)
    setCustomPermissionsOpen(false)
  }

  // Handle permission toggle
  const handlePermissionToggle = (permissionId, checked) => {
    setCustomPermissions((prev) => {
      if (checked) {
        return {
          ...prev,
          permissions: [...prev.permissions, permissionId],
        }
      } else {
        return {
          ...prev,
          permissions: prev.permissions.filter((id) => id !== permissionId),
        }
      }
    })
  }

  // Handle role template selection
  const handleRoleTemplateSelect = (roleId) => {
    const role = getRoleById(roleId)
    if (role) {
      setCustomPermissions((prev) => ({
        ...prev,
        permissions: [...role.permissions],
      }))
    }
  }

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "inactive":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get tenant color style
  const getTenantColorStyle = (tenantId) => {
    const tenant = getTenantById(tenantId)
    return tenant ? { backgroundColor: `${tenant.color}20`, borderColor: tenant.color } : {}
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Column 1: Tenant Selection */}
        <div className="w-full lg:w-1/4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Tenants</CardTitle>
              <CardDescription>Select a tenant to manage its members</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <button
                  onClick={() => handleTenantSelect("all")}
                  className={`w-full flex items-center px-4 py-2 hover:bg-muted text-left ${
                    selectedTenantId === "all" ? "bg-muted" : ""
                  }`}
                >
                  <Globe className="h-4 w-4 mr-2 text-primary" />
                  <div className="flex-1">
                    <div className="font-medium">All Tenants</div>
                    <div className="text-xs text-muted-foreground">{teamMembers.length} members across all tenants</div>
                  </div>
                  {selectedTenantId === "all" && <ChevronRight className="h-4 w-4 text-primary" />}
                </button>

                <Separator />

                <ScrollArea className="h-[calc(100vh-20rem)] pb-4">
                  {tenants.map((tenant) => (
                    <button
                      key={tenant.id}
                      onClick={() => handleTenantSelect(tenant.id)}
                      className={`w-full flex items-center px-4 py-2 hover:bg-muted text-left ${
                        selectedTenantId === tenant.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="h-4 w-4 mr-2 rounded-full" style={{ backgroundColor: tenant.color }} />
                      <div className="flex-1">
                        <div className="font-medium">{tenant.name}</div>
                        <div className="text-xs text-muted-foreground">{tenant.members} members</div>
                      </div>
                      {selectedTenantId === tenant.id && <ChevronRight className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </ScrollArea>
              </div>
            </CardContent>
            <CardFooter className="border-t p-3">
              <Button variant="outline" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Audit Log</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setAuditLogOpen(true)}>
                  View All
                </Button>
              </div>
              <CardDescription>Recent permission changes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 p-4">
                  {filteredAuditLog.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="text-sm">
                      <div className="flex items-start gap-2">
                        <Clock className="h-3 w-3 mt-1 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{entry.action}</p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <span>{entry.user}</span>
                            <span className="mx-1">•</span>
                            <span>{formatDate(entry.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Member List */}
        <div className="w-full lg:w-2/5 space-y-4">
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {selectedTenant ? `${selectedTenant.name} Members` : "All Members"}
                </CardTitle>
                <CardDescription>
                  {filteredMembers.length} members {selectedTenant ? `in ${selectedTenant.name}` : "across all tenants"}
                </CardDescription>
              </div>

              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Add a new member to {selectedTenant ? selectedTenant.name : "your organization"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tenant">Tenant</Label>
                      <Select
                        value={newMember.tenantId}
                        onValueChange={(value) => setNewMember({ ...newMember, tenantId: value })}
                      >
                        <SelectTrigger id="tenant">
                          <SelectValue placeholder="Select a tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={newMember.roleId}
                        onValueChange={(value) => setNewMember({ ...newMember, roleId: value })}
                      >
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleTemplates
                            .filter((role) => !role.isSystemRole)
                            .map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInvite}
                      disabled={!newMember.email || !newMember.tenantId || !newMember.roleId}
                    >
                      Send Invitation
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>

            <CardContent className="p-0">
              <div className="p-4 space-y-4">
                {/* Search and filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search members..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <div className="p-2">
                        <Label className="text-xs font-medium">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-2">
                        <Label className="text-xs font-medium">Role</Label>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {roleTemplates.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setStatusFilter("all")
                          setRoleFilter("all")
                          setSearchQuery("")
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Members table */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px] cursor-pointer" onClick={() => requestSort("name")}>
                          <div className="flex items-center">
                            <span>Name</span>
                            {getSortDirectionIcon("name")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="hidden md:table-cell cursor-pointer"
                          onClick={() => requestSort("status")}
                        >
                          <div className="flex items-center">
                            <span>Status</span>
                            {getSortDirectionIcon("status")}
                          </div>
                        </TableHead>
                        <TableHead
                          className="hidden lg:table-cell cursor-pointer"
                          onClick={() => requestSort("lastActive")}
                        >
                          <div className="flex items-center">
                            <span>Last Active</span>
                            {getSortDirectionIcon("lastActive")}
                          </div>
                        </TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedMembers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No members found matching your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedMembers.map((member) => (
                          <>
                            <TableRow
                              key={member.id}
                              className={`hover:bg-muted/50 ${selectedMemberId === member.id ? "bg-muted" : ""}`}
                              onClick={() => handleMemberSelect(member.id)}
                            >
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{member.name}</div>
                                    <div className="text-xs text-muted-foreground">{member.email}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="outline" className={`${getStatusBadgeColor(member.status)}`}>
                                  {member.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                                {member.lastActive}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleMemberExpansion(member.id)
                                    }}
                                  >
                                    {expandedMembers[member.id] ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          handleMemberSelect(member.id)
                                        }}
                                      >
                                        <User className="h-4 w-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setCustomPermissionsOpen(true)
                                          handleMemberSelect(member.id)
                                        }}
                                      >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Edit Permissions
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>
                                        <Trash className="h-4 w-4 mr-2" />
                                        Remove
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Expanded row showing tenant access */}
                            {expandedMembers[member.id] && (
                              <TableRow className="bg-muted/30">
                                <TableCell colSpan={4} className="p-0">
                                  <div className="p-4">
                                    <h4 className="text-sm font-medium mb-2">Tenant Access</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {member.tenantRoles.map((tr) => {
                                        const tenant = getTenantById(tr.tenantId)
                                        const role = getRoleById(tr.roleId)
                                        return tenant && role ? (
                                          <div
                                            key={`${member.id}-${tr.tenantId}`}
                                            className="flex items-center gap-2 p-2 rounded-md border"
                                            style={getTenantColorStyle(tr.tenantId)}
                                          >
                                            <div
                                              className="h-3 w-3 rounded-full"
                                              style={{ backgroundColor: tenant.color }}
                                            />
                                            <span className="text-sm font-medium">{tenant.name}</span>
                                            <Badge variant="outline" className={`ml-auto text-xs ${role.color}`}>
                                              {role.name}
                                            </Badge>
                                          </div>
                                        ) : null
                                      })}

                                      {member.systemRole && (
                                        <div className="flex items-center gap-2 p-2 rounded-md border bg-red-50 border-red-200">
                                          <Globe className="h-3 w-3 text-red-500" />
                                          <span className="text-sm font-medium">System-wide Access</span>
                                          <Badge
                                            variant="outline"
                                            className="ml-auto text-xs bg-red-100 text-red-800 border-red-200"
                                          >
                                            {getRoleById(member.systemRole)?.name || "System Admin"}
                                          </Badge>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Column 3: Member Details & Permissions */}
        <div className="w-full lg:w-1/3 space-y-4">
          {selectedMember ? (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedMember.avatar || "/placeholder.svg"} alt={selectedMember.name} />
                        <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg font-semibold">{selectedMember.name}</CardTitle>
                        <CardDescription>{selectedMember.email}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className={`${getStatusBadgeColor(selectedMember.status)}`}>
                      {selectedMember.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Last Activity</h4>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{selectedMember.lastActive}</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-2">Tenant Access</h4>
                      <div className="space-y-2">
                        {selectedMember.tenantRoles.map((tr) => {
                          const tenant = getTenantById(tr.tenantId)
                          const role = getRoleById(tr.roleId)
                          return tenant && role ? (
                            <div
                              key={`${selectedMember.id}-${tr.tenantId}`}
                              className="flex items-center justify-between p-2 rounded-md border"
                              style={getTenantColorStyle(tr.tenantId)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tenant.color }} />
                                <span className="text-sm font-medium">{tenant.name}</span>
                              </div>
                              <Badge variant="outline" className={`text-xs ${role.color}`}>
                                {role.name}
                              </Badge>
                            </div>
                          ) : null
                        })}
                      </div>
                    </div>

                    {selectedMember.systemRole && (
                      <>
                        <Separator />

                        <div>
                          <div className="flex items-center gap-1 mb-2">
                            <h4 className="text-sm font-medium">System Access</h4>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    System access applies across all tenants and provides administrative capabilities.
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className="p-2 rounded-md border bg-red-50 border-red-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-red-500" />
                                <span className="text-sm font-medium">System-wide Access</span>
                              </div>
                              <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-200">
                                {getRoleById(selectedMember.systemRole)?.name || "System Admin"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="border-t flex justify-between p-3">
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                  <Button size="sm" onClick={() => setCustomPermissionsOpen(true)}>
                    <Shield className="h-4 w-4 mr-2" />
                    Edit Permissions
                  </Button>
                </CardFooter>
              </Card>

              {/* Custom Permissions Dialog */}
              <Dialog open={customPermissionsOpen} onOpenChange={setCustomPermissionsOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Permissions</DialogTitle>
                    <DialogDescription>
                      Customize permissions for {selectedMember.name} in {selectedTenant?.name || "all tenants"}
                    </DialogDescription>
                  </DialogHeader>

                  {selectedTenantId !== "all" ? (
                    <div className="py-4 space-y-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Role Templates</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {roleTemplates
                            .filter((role) => !role.isSystemRole)
                            .map((role) => (
                              <button
                                key={role.id}
                                className={`p-3 rounded-md border text-left hover:bg-muted transition-colors ${
                                  customPermissions.permissions.length > 0 &&
                                  customPermissions.permissions.every((p) => role.permissions.includes(p)) &&
                                  role.permissions.every((p) => customPermissions.permissions.includes(p))
                                    ? "bg-primary/10 border-primary"
                                    : ""
                                }`}
                                onClick={() => handleRoleTemplateSelect(role.id)}
                              >
                                <div className="font-medium">{role.name}</div>
                                <div className="text-xs text-muted-foreground">{role.description}</div>
                              </button>
                            ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Custom Permissions</h4>
                          <div className="flex items-center">
                            <Switch
                              id="show-system"
                              checked={showSystemPermissions}
                              onCheckedChange={setShowSystemPermissions}
                            />
                            <Label htmlFor="show-system" className="ml-2 text-sm">
                              Show System Permissions
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {permissionCategories
                            .filter(
                              (category) => showSystemPermissions || !category.permissions.every((p) => p.isSystemOnly),
                            )
                            .map((category) => (
                              <div key={category.id} className="space-y-3">
                                <h5 className="text-sm font-medium text-muted-foreground">{category.name}</h5>
                                <div className="space-y-2">
                                  {category.permissions
                                    .filter((p) => showSystemPermissions || !p.isSystemOnly)
                                    .map((permission) => (
                                      <div key={permission.id} className="flex items-start space-x-2">
                                        <Checkbox
                                          id={`permission-${permission.id}`}
                                          checked={customPermissions.permissions.includes(permission.id)}
                                          onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked)}
                                          disabled={permission.isSystemOnly && !showSystemPermissions}
                                        />
                                        <div className="grid gap-1.5 leading-none">
                                          <div className="flex items-center gap-1">
                                            <Label
                                              htmlFor={`permission-${permission.id}`}
                                              className="text-sm font-medium leading-none"
                                            >
                                              {permission.name}
                                            </Label>
                                            {permission.isSystemOnly && (
                                              <Badge
                                                variant="outline"
                                                className="text-xs bg-red-100 text-red-800 border-red-200"
                                              >
                                                System
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center">
                      <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select a Tenant First</h3>
                      <p className="text-muted-foreground mb-4">
                        Please select a specific tenant to edit permissions for this user.
                      </p>
                      <Select
                        onValueChange={(value) => {
                          setSelectedTenantId(value)
                          setCustomPermissionsOpen(false)
                        }}
                      >
                        <SelectTrigger className="w-[250px] mx-auto">
                          <SelectValue placeholder="Select a tenant" />
                        </SelectTrigger>
                        <SelectContent>
                          {tenants.map((tenant) => (
                            <SelectItem key={tenant.id} value={tenant.id}>
                              {tenant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCustomPermissionsOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCustomPermissions} disabled={selectedTenantId === "all"}>
                      Save Permissions
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <Card className="h-[400px] flex items-center justify-center">
              <CardContent className="text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Member Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a member from the list to view and manage their permissions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Audit Log Dialog */}
      <Dialog open={auditLogOpen} onOpenChange={setAuditLogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Permission Audit Log</DialogTitle>
            <DialogDescription>
              History of permission changes {selectedTenant ? `in ${selectedTenant.name}` : "across all tenants"}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Tenant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuditLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.timestamp)}</TableCell>
                    <TableCell>{entry.user}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell>
                      {entry.tenantId ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: getTenantById(entry.tenantId)?.color }}
                          />
                          <span>{getTenantById(entry.tenantId)?.name}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                          System
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setAuditLogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
