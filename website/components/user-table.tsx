"use client"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

import { useState, useEffect } from "react"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Key, MoreHorizontal, Plus, Shield, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api-service"
import type { User } from "@/lib/schemas"

export function UserTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState("")
  const { toast } = useToast()

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await getUsers()
        if (response.success && response.data) {
          setUsers(response.data)
        } else {
          setError("Failed to fetch users")
        }
      } catch (err) {
        setError("An error occurred while fetching users")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setOpen(true)
  }

  const handleRoleChange = (user: User) => {
    setSelectedUser(user)
    setSelectedRole(user.role)
    setRoleDialogOpen(true)
  }

  const handleClose = () => {
    setSelectedUser(null)
    setOpen(false)
  }

  const handleRoleDialogClose = () => {
    setSelectedUser(null)
    setSelectedRole("")
    setRoleDialogOpen(false)
  }

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (selectedUser) {
        // Update existing user
        const response = await updateUser(selectedUser.id, userData)
        if (response.success && response.data) {
          setUsers(users.map((user) => (user.id === selectedUser.id ? response.data : user)))
          toast({
            title: "User updated",
            description: "User has been updated successfully",
          })
        }
      } else {
        // Create new user
        const response = await createUser(userData as Omit<User, "id">)
        if (response.success && response.data) {
          setUsers([...users, response.data])
          toast({
            title: "User created",
            description: "User has been created successfully",
          })
        }
      }
      handleClose()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save user",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await deleteUser(userId)
      if (response.success) {
        setUsers(users.filter((user) => user.id !== userId))
        toast({
          title: "User deleted",
          description: "User has been deleted successfully",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  if (loading) {
    return <div>Loading users...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  // Rest of the component remains the same...
  // Just replace the mock data with the users state

  return (
    <Card className="shadow-sm border-border">
      <CardHeader className="flex flex-row items-center bg-secondary/50 rounded-t-lg">
        <div className="space-y-1.5">
          <CardTitle>Users</CardTitle>
          <CardDescription>Manage user access and permissions.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="ml-auto" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
              <DialogDescription>
                {selectedUser ? "Update the user details below." : "Fill in the details to add a new user."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={selectedUser?.name || ""} placeholder="e.g. John Doe" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={selectedUser?.email || ""}
                  placeholder="e.g. john@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select defaultValue={selectedUser?.role || "viewer"}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={selectedUser?.status || "active"}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={() => {
                  // Get form values and save
                  const name = (document.getElementById("name") as HTMLInputElement).value
                  const email = (document.getElementById("email") as HTMLInputElement).value
                  const role = (document.querySelector("[data-value]") as HTMLElement)?.dataset.value || "viewer"
                  const status = (document.querySelector("[data-value]") as HTMLElement)?.dataset.value || "active"

                  handleSaveUser({ name, email, role, status } as Partial<User>)
                }}
              >
                {selectedUser ? "Update User" : "Add User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>Update the role for {selectedUser?.name}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user-role">Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger id="user-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleRoleDialogClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={() => {
                  if (selectedUser) {
                    handleSaveUser({ ...selectedUser, role: selectedRole })
                  }
                  handleRoleDialogClose()
                }}
              >
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-accent">
                      <AvatarImage src={user.avatar || `/placeholder.svg?height=32&width=32`} alt={user.name} />
                      <AvatarFallback className="bg-accent text-accent-foreground">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="flex items-center gap-1 font-normal bg-secondary">
                    <Shield className="h-3 w-3" />
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.status === "active" ? "default" : "secondary"}
                    className={
                      user.status === "active" ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.lastActive || "Never"}</TableCell>
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
                      <DropdownMenuItem onClick={() => handleEdit(user)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRoleChange(user)}>
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Key className="mr-2 h-4 w-4" />
                        Manage API Keys
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
