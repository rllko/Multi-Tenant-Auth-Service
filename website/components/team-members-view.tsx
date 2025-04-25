"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserTable } from "@/components/user-table"
import { RolesTable } from "@/components/roles-table"
import { fetchTeamMembers } from "@/lib/api-service"
import type { TeamMemberSchema } from "@/lib/schemas"
import type { z } from "zod"
import { AlertCircle, UserPlus } from "lucide-react"
import { PermissionEditorModal } from "./permission-editor-modal"

// Mock data for team members
// const teamMembers = [
//   {
//     id: "user_1",
//     name: "John Doe",
//     email: "john@example.com",
//     status: "active",
//     lastActive: "2 hours ago",
//     avatar: "/placeholder.svg?height=40&width=40",
//     role: "admin",
//     tenants: [
//       { id: "tenant_1", name: "Acme Inc.", color: "#4f46e5" },
//       { id: "tenant_2", name: "Globex Corporation", color: "#0ea5e9" },
//     ],
//   },
//   {
//     id: "user_2",
//     name: "Jane Smith",
//     email: "jane@example.com",
//     status: "active",
//     lastActive: "1 day ago",
//     avatar: "/placeholder.svg?height=40&width=40",
//     role: "editor",
//     tenants: [
//       { id: "tenant_1", name: "Acme Inc.", color: "#4f46e5" },
//       { id: "tenant_3", name: "Initech", color: "#10b981" },
//     ],
//   },
//   {
//     id: "user_3",
//     name: "Bob Johnson",
//     email: "bob@example.com",
//     status: "inactive",
//     lastActive: "3 days ago",
//     avatar: "/placeholder.svg?height=40&width=40",
//     role: "admin",
//     tenants: [{ id: "tenant_2", name: "Globex Corporation", color: "#0ea5e9" }],
//   },
//   {
//     id: "user_4",
//     name: "Alice Brown",
//     email: "alice@example.com",
//     status: "active",
//     lastActive: "Just now",
//     avatar: "/placeholder.svg?height=40&width=40",
//     role: "viewer",
//     tenants: [
//       { id: "tenant_1", name: "Acme Inc.", color: "#4f46e5" },
//       { id: "tenant_4", name: "Umbrella Corp", color: "#f59e0b" },
//     ],
//   },
//   {
//     id: "user_5",
//     name: "Charlie Wilson",
//     email: "charlie@example.com",
//     status: "pending",
//     lastActive: "Never",
//     avatar: "/placeholder.svg?height=40&width=40",
//     role: "editor",
//     tenants: [{ id: "tenant_1", name: "Acme Inc.", color: "#4f46e5" }],
//   },
//   {
//     id: "user_6",
//     name: "Diana Prince",
//     email: "diana@example.com",
//     status: "active",
//     lastActive: "5 hours ago",
//     avatar: "/placeholder.svg?height=40&width=40",
//     role: "viewer",
//     tenants: [
//       { id: "tenant_1", name: "Acme Inc.", color: "#4f46e5" },
//       { id: "tenant_5", name: "Stark Industries", color: "#ef4444" },
//     ],
//   },
// ]

// Role badge colors
const roleBadgeColors = {
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  editor: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  viewer: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

export function TeamMembersView() {
  const [teamMembers, setTeamMembers] = useState<z.infer<typeof TeamMemberSchema>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [tenantFilter, setTenantFilter] = useState("all")
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [permissionModalOpen, setPermissionModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [viewMode, setViewMode] = useState("grid")

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsLoading(true)
        const members = await fetchTeamMembers()
        setTeamMembers(members)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch team members:", err)
        setError("Failed to load team members. Please try again.")
        // Set fallback data
        setTeamMembers([
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            role: "Admin",
            status: "active",
            joinedAt: "2023-01-15T00:00:00Z",
            lastActive: "2023-04-28T14:30:00Z",
          },
          {
            id: "2",
            name: "Jane Smith",
            email: "jane@example.com",
            role: "Developer",
            status: "active",
            joinedAt: "2023-02-10T00:00:00Z",
            lastActive: "2023-04-27T09:15:00Z",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamMembers()
  }, [])

  // Filter team members
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      searchQuery === "" ||
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || member.status === statusFilter

    const matchesRole = roleFilter === "all" || member.role === roleFilter

    const matchesTenant = tenantFilter === "all" || member.tenants.some((tenant) => tenant.id === tenantFilter)

    return matchesSearch && matchesStatus && matchesRole && matchesTenant
  })

  const handleEditRole = (member) => {
    setSelectedMember(member)
    setPermissionModalOpen(true)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Team Members</h2>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members and their access levels.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[400px] bg-muted rounded-lg animate-pulse"></div>
              ) : (
                <UserTable users={teamMembers} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>Manage roles and their associated permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <RolesTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Manage pending team invitations.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">No pending invitations</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Permission Editor Modal */}
      <PermissionEditorModal
        isOpen={permissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
        member={selectedMember}
        type="team"
      />
    </div>
  )
}
