"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plus, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface RolesPermissionsViewProps {
  selectedOrganization: {
    id: string
    name: string
    members: number
    role: string
  }
  roles?: any[]
}

export function RolesPermissionsView({ selectedOrganization, roles = [] }: RolesPermissionsViewProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter roles based on search query
  const filteredRoles = roles.filter(
    (role) =>
      searchQuery === "" ||
      role.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Default roles if none provided
  const defaultRoles = [
    {
      id: "role_1",
      name: "Admin",
      description: "Full access to all resources",
      members: 3,
      isDefault: true,
      permissions: 24,
    },
    {
      id: "role_2",
      name: "Member",
      description: "Can view and edit most resources",
      members: 8,
      isDefault: true,
      permissions: 18,
    },
    {
      id: "role_3",
      name: "Viewer",
      description: "Can only view resources",
      members: 12,
      isDefault: true,
      permissions: 6,
    },
    {
      id: "role_4",
      name: "Developer",
      description: "Can access development resources",
      members: 5,
      isDefault: false,
      permissions: 15,
    },
  ]

  const rolesToDisplay = roles.length > 0 ? filteredRoles : defaultRoles

  return (
    <Tabs defaultValue="roles" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>
      </div>

      <TabsContent value="roles" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Team Roles</CardTitle>
            <CardDescription>Manage roles for {selectedOrganization.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
              <div className="flex-1 space-y-2">
                <Label htmlFor="search-roles">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search-roles"
                    type="search"
                    placeholder="Search roles..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 border rounded-md">
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                <div className="col-span-3">Role</div>
                <div className="col-span-5">Description</div>
                <div className="col-span-2">Members</div>
                <div className="col-span-1">Default</div>
                <div className="col-span-1"></div>
              </div>

              {rolesToDisplay.map((role, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center">
                  <div className="col-span-3">
                    <div className="font-medium">{role.name}</div>
                  </div>
                  <div className="col-span-5 text-sm text-muted-foreground">{role.description}</div>
                  <div className="col-span-2">
                    <Badge variant="outline">{role.members}</Badge>
                  </div>
                  <div className="col-span-1">
                    {role.isDefault ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Yes
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">No</span>
                    )}
                  </div>
                  <div className="col-span-1 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Edit Role</DropdownMenuItem>
                        <DropdownMenuItem>View Permissions ({role.permissions})</DropdownMenuItem>
                        <DropdownMenuItem>View Members ({role.members})</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete Role</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="permissions" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <CardDescription>Manage permissions that can be assigned to roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-muted-foreground">
              Permission management interface will be displayed here
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
