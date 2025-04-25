"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RolesTable } from "./roles-table"
import { PermissionsTable } from "./permissions-table"
import { RolePermissionsManager } from "./role-permissions-manager"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from "@/lib/api-service"
import type { Role, Permission } from "@/lib/schemas"

export function RolesPermissionsView() {
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Fetch roles and permissions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch roles
        const rolesResponse = await getRoles()
        if (rolesResponse.success && rolesResponse.data) {
          setRoles(rolesResponse.data)
        } else {
          setError("Failed to fetch roles")
        }

        // Fetch permissions
        const permissionsResponse = await getPermissions()
        if (permissionsResponse.success && permissionsResponse.data) {
          setPermissions(permissionsResponse.data)
        } else {
          setError("Failed to fetch permissions")
        }
      } catch (err) {
        setError("An error occurred while fetching data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
  }

  const handleRoleCreate = async (roleData: Omit<Role, "id">) => {
    try {
      setLoading(true)
      const response = await createRole(roleData)
      if (response.success && response.data) {
        setRoles([...roles, response.data])
        toast({
          title: "Role created",
          description: "The role has been created successfully.",
        })
      }
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
    try {
      setLoading(true)
      const response = await updateRole(id, roleData)
      if (response.success && response.data) {
        setRoles(roles.map((role) => (role.id === id ? response.data : role)))
        if (selectedRole && selectedRole.id === id) {
          setSelectedRole(response.data)
        }
        toast({
          title: "Role updated",
          description: "The role has been updated successfully.",
        })
      }
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
    try {
      setLoading(true)
      const response = await deleteRole(id)
      if (response.success) {
        setRoles(roles.filter((role) => role.id !== id))
        if (selectedRole && selectedRole.id === id) {
          setSelectedRole(null)
        }
        toast({
          title: "Role deleted",
          description: "The role has been deleted successfully.",
        })
      }
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

  if (loading && roles.length === 0 && permissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading roles and permissions...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Roles & Permissions</h2>
      </div>

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
    </div>
  )
}
