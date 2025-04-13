"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Shield } from "lucide-react"

const roles = [
  { id: "role_1", name: "Administrator", organization: "Acme Inc." },
  { id: "role_2", name: "Developer", organization: "Acme Inc." },
  { id: "role_3", name: "Analyst", organization: "Globex Corporation" },
  { id: "role_4", name: "Support", organization: "Initech" },
]

const permissionsByCategory = {
  Users: [
    { id: "perm_1", name: "users:read", description: "View user information" },
    { id: "perm_2", name: "users:write", description: "Create and update users" },
    { id: "perm_3", name: "users:delete", description: "Delete users from the system" },
  ],
  "API Keys": [
    { id: "perm_4", name: "keys:read", description: "View API keys" },
    { id: "perm_5", name: "keys:write", description: "Create and update API keys" },
    { id: "perm_6", name: "keys:delete", description: "Revoke and delete API keys" },
  ],
  Administration: [{ id: "perm_7", name: "roles:manage", description: "Manage roles and permissions" }],
  Analytics: [{ id: "perm_8", name: "analytics:view", description: "View analytics and reports" }],
}

// Mock role permissions mapping
const rolePermissions = {
  role_1: ["perm_1", "perm_2", "perm_3", "perm_4", "perm_5", "perm_6", "perm_7", "perm_8"], // Admin has all
  role_2: ["perm_1", "perm_4", "perm_5", "perm_8"], // Developer
  role_3: ["perm_1", "perm_8"], // Analyst
  role_4: ["perm_1", "perm_2"], // Support
}

export function RolePermissionsManager({ selectedOrganization }) {
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedPermissions, setSelectedPermissions] = useState([])
  const [filteredRoles, setFilteredRoles] = useState([])

  // Filter roles by selected organization and set initial selected role
  useEffect(() => {
    const orgRoles = roles.filter((role) => role.organization === selectedOrganization.name)
    setFilteredRoles(orgRoles)

    if (orgRoles.length > 0) {
      setSelectedRole(orgRoles[0].id)
      setSelectedPermissions(rolePermissions[orgRoles[0].id] || [])
    } else {
      setSelectedRole(null)
      setSelectedPermissions([])
    }
  }, [selectedOrganization])

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId)
    setSelectedPermissions(rolePermissions[roleId] || [])
  }

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions((current) => {
      if (current.includes(permissionId)) {
        return current.filter((id) => id !== permissionId)
      } else {
        return [...current, permissionId]
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions</CardTitle>
        <CardDescription>Assign permissions to roles in {selectedOrganization.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="role-select">Select Role</Label>
          {filteredRoles.length === 0 ? (
            <div className="text-sm text-muted-foreground">No roles available in this organization.</div>
          ) : (
            <Select value={selectedRole} onValueChange={handleRoleChange}>
              <SelectTrigger id="role-select">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {filteredRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedRole && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Permissions</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedPermissions(
                    Object.values(permissionsByCategory)
                      .flat()
                      .map((p) => p.id),
                  )
                }
              >
                Select All
              </Button>
            </div>

            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <div key={category} className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  {category}
                </h4>
                <div className="grid gap-2 pl-6">
                  {permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-2">
                      <Checkbox
                        id={permission.id}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <div className="grid gap-0.5 leading-none">
                        <Label htmlFor={permission.id} className="text-sm font-medium cursor-pointer font-mono">
                          {permission.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="my-2" />
              </div>
            ))}
          </div>
        )}

        <Button className="w-full" disabled={!selectedRole}>
          Save Permissions
        </Button>
      </CardContent>
    </Card>
  )
}
