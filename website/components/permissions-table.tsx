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
import { Edit, MoreHorizontal, Plus, Trash, Shield } from "lucide-react"

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
    <Card className="bg-[#1a1d24] border-[#2a2f38] shadow-lg">
      <CardHeader className="flex flex-row items-center border-b border-[#2a2f38]">
        <div className="space-y-1.5">
          <CardTitle className="text-white flex items-center">
            <Shield className="mr-2 h-5 w-5 text-[#1a73e8]" />
            Permissions
          </CardTitle>
          <CardDescription className="text-gray-400">
            Manage system permissions for {selectedOrganization.name}.
          </CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto bg-[#1a73e8] hover:bg-[#1565c0] text-white" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Create Permission
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-[#1a1d24] border-[#2a2f38] text-white">
            <DialogHeader>
              <DialogTitle className="text-[#1a73e8]">
                {editPermission ? "Edit Permission" : "Create New Permission"}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {editPermission
                  ? "Update the permission details below."
                  : "Fill in the details to create a new permission."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-gray-300">
                  Permission Name
                </Label>
                <Input
                  id="name"
                  defaultValue={editPermission?.name || ""}
                  placeholder="e.g. users:read"
                  className="bg-[#0f1117] border-[#2a2f38] text-white focus:border-[#1a73e8] focus:ring-[#1a73e8]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  defaultValue={editPermission?.description || ""}
                  placeholder="Describe what this permission allows"
                  className="bg-[#0f1117] border-[#2a2f38] text-white focus:border-[#1a73e8] focus:ring-[#1a73e8]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category" className="text-gray-300">
                  Category
                </Label>
                <Select defaultValue={editPermission?.category || categories[0]}>
                  <SelectTrigger
                    id="category"
                    className="bg-[#0f1117] border-[#2a2f38] text-white focus:border-[#1a73e8] focus:ring-[#1a73e8]"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1d24] border-[#2a2f38] text-white">
                    {categories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        className="hover:bg-[#2a2f38] focus:bg-[#2a2f38] text-gray-300"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                className="border-[#2a2f38] text-gray-300 hover:bg-[#2a2f38] hover:text-white"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1a73e8] hover:bg-[#1565c0] text-white">
                {editPermission ? "Update Permission" : "Create Permission"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-[#0f1117]">
            <TableRow className="border-b-[#2a2f38] hover:bg-transparent">
              <TableHead className="text-gray-400">Name</TableHead>
              <TableHead className="text-gray-400">Description</TableHead>
              <TableHead className="text-gray-400">Category</TableHead>
              <TableHead className="text-gray-400">Created</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPermissions.length === 0 ? (
              <TableRow className="hover:bg-[#0f1117]/50">
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                  No permissions found in this organization.
                </TableCell>
              </TableRow>
            ) : (
              filteredPermissions.map((permission) => (
                <TableRow key={permission.id} className="border-b-[#2a2f38] hover:bg-[#0f1117]/50">
                  <TableCell className="font-medium font-mono text-sm text-[#1a73e8]">{permission.name}</TableCell>
                  <TableCell className="text-gray-300">{permission.description}</TableCell>
                  <TableCell className="text-gray-300">{permission.category}</TableCell>
                  <TableCell className="text-gray-300">{permission.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white hover:bg-[#2a2f38]"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[#1a1d24] border-[#2a2f38] text-gray-300">
                        <DropdownMenuLabel className="text-gray-400">Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleEdit(permission)}
                          className="hover:bg-[#2a2f38] hover:text-white cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Permission
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#2a2f38]" />
                        <DropdownMenuItem className="text-[#ea4335] hover:bg-[#ea4335]/10 hover:text-[#ea4335] cursor-pointer">
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
