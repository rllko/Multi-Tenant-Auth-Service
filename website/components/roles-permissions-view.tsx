"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RolesTable } from "./roles-table"
import { PermissionsTable } from "./permissions-table"
import { RolePermissionsManager } from "./role-permissions-manager"
import { AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTeam } from "@/contexts/team-context"
import { ApiError } from "./api-error"
import type { Role, Permission } from "@/lib/schemas"

export function RolesPermissionsView() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const { toast } = useToast()
  const { selectedTeam, teamsLoaded, teams } = useTeam()

  // Fetch roles and permissions on component mount
  const fetchData = useCallback(async () => {
    if (!selectedTeam) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Simulate API call with a timeout to test error handling
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timed out")), 15000)
      })

      // Fetch roles
      const rolesFetchPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/roles`).then(
        (response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch roles: ${response.status}`)
          }
          return response.json()
        },
      )

      // Race between fetch and timeout
      const rolesData = (await Promise.race([rolesFetchPromise, timeoutPromise])) as Role[]
      setRoles(rolesData)

      // Fetch permissions
      const permissionsFetchPromise = fetch(`${process.env.NEXT_PUBLIC_API_URL}/permissions`).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch permissions: ${response.status}`)
        }
        return response.json()
      })

      // Race between fetch and timeout
      const permissionsData = (await Promise.race([permissionsFetchPromise, timeoutPromise])) as Permission[]
      setPermissions(permissionsData)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError("Failed to load roles and permissions. Please check your connection and try again.")
      // Clear data on error
      setRoles([])
      setPermissions([])
    } finally {
      setLoading(false)
      setIsRetrying(false)
    }
  }, [selectedTeam])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleRetry = () => {
    setIsRetrying(true)
    fetchData()
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
  }

  const handleRoleCreate = async (roleData: Omit<Role, "id">) => {
    if (!selectedTeam) return

    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create role: ${response.status}`)
      }

      const data = await response.json()
      setRoles([...roles, data])
      toast({
        title: "Role created",
        description: "The role has been created successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleUpdate = async (id: string, roleData: Partial<Role>) => {
    if (!selectedTeam) return

    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/roles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roleData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update role: ${response.status}`)
      }

      const data = await response.json()
      setRoles(roles.map((role) => (role.id === id ? data : role)))
      if (selectedRole && selectedRole.id === id) {
        setSelectedRole(data)
      }
      toast({
        title: "Role updated",
        description: "The role has been updated successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleDelete = async (id: string) => {
    if (!selectedTeam) return

    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/roles/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete role: ${response.status}`)
      }

      setRoles(roles.filter((role) => role.id !== id))
      if (selectedRole && selectedRole.id === id) {
        setSelectedRole(null)
      }
      toast({
        title: "Role deleted",
        description: "The role has been deleted successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Team context banner */}
      {selectedTeam && (
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-semibold text-primary">{selectedTeam.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-medium">Team: {selectedTeam.name}</h3>
              <p className="text-xs text-muted-foreground">Managing roles and permissions</p>
            </div>
          </div>
        </div>
      )}

      {/* No team selected message */}
      {teamsLoaded && !selectedTeam && !loading && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">No team selected</p>
            <p className="text-sm">
              {teams.length === 0
                ? "You don't have any teams yet. Create a team to get started."
                : "Please select a team to manage roles and permissions."}
            </p>
          </div>
        </div>
      )}

      {/* Always show error if present */}
      {error && <ApiError message={error} onRetry={handleRetry} isRetrying={isRetrying} />}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Roles & Permissions</h2>
      </div>

      {/* Show loading indicator only if not retrying and no error */}
      {loading && !isRetrying && !error && roles.length === 0 && permissions.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading roles and permissions...</span>
        </div>
      )}

      {teamsLoaded && selectedTeam && !error && (!loading || roles.length > 0 || permissions.length > 0) && (
        <Tabs defaultValue="roles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="matrix" disabled={!selectedRole}>
              Role-Permission Matrix
            </TabsTrigger>
          </TabsList>
          <TabsContent value="roles" className="space-y-4">
            <RolesTable
              roles={roles}
              onRoleSelect={handleRoleSelect}
              onRoleCreate={handleRoleCreate}
              onRoleUpdate={handleRoleUpdate}
              onRoleDelete={handleRoleDelete}
              loading={loading}
            />
          </TabsContent>
          <TabsContent value="permissions" className="space-y-4">
            <PermissionsTable permissions={permissions} loading={loading} />
          </TabsContent>
          <TabsContent value="matrix" className="space-y-4">
            {selectedRole ? (
              <RolePermissionsManager
                role={selectedRole}
                permissions={permissions}
                onRoleUpdate={handleRoleUpdate}
                loading={loading}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Select a role to manage permissions</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
