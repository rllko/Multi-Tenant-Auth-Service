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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react"

const permissions = [
  {
    id: "perm_1",
    name: "users:read",
    description: "View user information",
    category: "Users",
    createdAt: "2023-01-15",
    organization: "Acme Inc.",
  },
  {
    id: "perm_2",
    name: "users:write",
    description: "Create and update users",
    category: "Users",
    createdAt: "2023-01-15",
    organization: "Acme Inc.",
  },
  {
    id: "perm_3",
    name: "users:delete",
    description: "Delete users from the system",
    category: "Users",
    createdAt: "2023-01-15",
    organization: "Acme Inc.",
  },
  {
    id: "perm_4",
    name: "keys:read",
    description: "View API keys",
    category: "API Keys",
    createdAt: "2023-01-16",
    organization: "Acme Inc.",
  },
  {
    id: "perm_5",
    name: "keys:write",
    description: "Create and update API keys",
    category: "API Keys",
    createdAt: "2023-01-16",
    organization: "Globex Corporation",
  },
  {
    id: "perm_6",
    name: "keys:delete",
    description: "Revoke and delete API keys",
    category: "API Keys",
    createdAt: "2023-01-16",
    organization: "Globex Corporation",
  },
  {
    id: "perm_7",
    name: "roles:manage",
    description: "Manage roles and permissions",
    category: "Administration",
    createdAt: "2023-01-17",
    organization: "Initech",
  },
  {
    id: "perm_8",
    name: "analytics:view",
    description: "View analytics and reports",
    category: "Analytics",
    createdAt: "2023-01-18",
    organization: "Initech",
  },
]

const categories = ["Users", "API Keys", "Administration", "Analytics", "Settings"]

export function PermissionsTable({ selectedOrganization }) {
  const [open, setOpen] = useState(false)
  const [editPermission, setEditPermission] = useState(null)

  const handleEdit = (permission) => {
    setEditPermission(permission)
    setOpen(true)
  }

  const handleClose = () => {
    setEditPermission(null)
    setOpen(false)
  }

  // Filter permissions by selected organization
  const filteredPermissions = permissions.filter((permission) => permission.organization === selectedOrganization.name)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="space-y-1.5">
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Manage system permissions for {selectedOrganization.name}.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Permission
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editPermission ? "Edit Permission" : "Create New Permission"}</DialogTitle>
              <DialogDescription>
                {editPermission
                  ? "Update the permission details below."
                  : "Fill in the details to create a new permission."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Permission Name</Label>
                <Input id="name" defaultValue={editPermission?.name || ""} placeholder="e.g. users:read" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={editPermission?.description || ""}
                  placeholder="Describe what this permission allows"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={editPermission?.category || categories[0]}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">{editPermission ? "Update Permission" : "Create Permission"}</Button>
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
              <TableHead>Category</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No permissions found in this organization.
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium font-mono text-sm">{permission.name}</TableCell>
                  <TableCell>{permission.description}</TableCell>
                  <TableCell>{permission.category}</TableCell>
                  <TableCell>{permission.createdAt}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleEdit(permission)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Permission
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Permission
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
