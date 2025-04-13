"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Edit, MoreHorizontal, Plus, Shield, Trash, Users } from "lucide-react"

const roles = [
  {
    id: "role_1",
    name: "Administrator",
    description: "Full system access with all permissions",
    userCount: 3,
    createdAt: "2023-01-15",
    organization: "Acme Inc.",
  },
  {
    id: "role_2",
    name: "Developer",
    description: "Access to development resources and API keys",
    userCount: 12,
    createdAt: "2023-02-20",
    organization: "Acme Inc.",
  },
  {
    id: "role_3",
    name: "Analyst",
    description: "Read-only access to analytics and reports",
    userCount: 8,
    createdAt: "2023-03-10",
    organization: "Globex Corporation",
  },
  {
    id: "role_4",
    name: "Support",
    description: "Access to user management and support tools",
    userCount: 5,
    createdAt: "2023-04-05",
    organization: "Initech",
  },
]

export function RolesTable({ onManageApiPermissions, selectedOrganization }) {
  const [open, setOpen] = useState(false)
  const [editRole, setEditRole] = useState(null)

  const handleEdit = (role) => {
    setEditRole(role)
    setOpen(true)
  }

  const handleClose = () => {
    setEditRole(null)
    setOpen(false)
  }

  // Filter roles by selected organization
  const filteredRoles = roles.filter((role) => role.organization === selectedOrganization.name)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="space-y-1.5">
          <CardTitle>Roles</CardTitle>
          <CardDescription>Manage user roles in {selectedOrganization.name}.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editRole ? "Edit Role" : "Create New Role"}</DialogTitle>
              <DialogDescription>
                {editRole ? "Update the role details below." : "Fill in the details to create a new role."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Role Name</Label>
                <Input id="name" defaultValue={editRole?.name || ""} placeholder="e.g. Administrator" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={editRole?.description || ""}
                  placeholder="Describe the role's purpose and access level"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">{editRole ? "Update Role" : "Create Role"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRoles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No roles found in this organization.
                </TableCell>
              </TableRow>
            ) : (
              filteredRoles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{role.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{role.userCount}</span>
                    </div>
                  </TableCell>
                  <TableCell>{role.createdAt}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(role)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Role
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onManageApiPermissions(role)}>
                          <Shield className="mr-2 h-4 w-4" />
                          API Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Users className="mr-2 h-4 w-4" />
                          Manage Users
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Role
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
  )
}
