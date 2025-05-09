"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, MoreHorizontal, RefreshCw, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import apiService from "@/lib/api-service"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

// Define the role schema for form validation
const roleSchema = z.object({
    name: z.string().min(2, "Role name must be at least 2 characters"),
    description: z.string().optional(),
})

type Role = {
    id: string
    name: string
    description?: string
    members?: number
    isDefault?: boolean
    permissions?: number
}

interface RolesPermissionsViewProps {
    selectedOrganization: {
        id: string
        name: string
        members: number
        role: string
    }
    roles?: Role[]
    onRefresh?: () => void
    isRefreshing?: boolean
}

export function RolesPermissionsView({
                                         selectedOrganization,
                                         roles = [],
                                         onRefresh,
                                         isRefreshing = false,
                                     }: RolesPermissionsViewProps) {
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Create role form
    const createForm = useForm<z.infer<typeof roleSchema>>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    })

    // Edit role form
    const editForm = useForm<z.infer<typeof roleSchema>>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: "",
            description: "",
        },
    })

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

    // Handle opening the edit dialog
    const handleEditRole = (role: Role) => {
        setSelectedRole(role)
        editForm.reset({
            name: role.name,
            description: role.description || "",
        })
        setShowEditDialog(true)
    }

    // Handle opening the delete dialog
    const handleDeleteRole = (role: Role) => {
        setSelectedRole(role)
        setShowDeleteDialog(true)
    }

    // Handle creating a new role
    const handleCreateSubmit = async (data: z.infer<typeof roleSchema>) => {
        setIsSubmitting(true)
        try {
            // Call API to create role
            await apiService.roles.createRole(selectedOrganization.id, data)

            toast({
                title: "Role created",
                description: `Role "${data.name}" has been created successfully.`,
            })

            setShowCreateDialog(false)
            createForm.reset()

            // Refresh roles list
            if (onRefresh) {
                onRefresh()
            }
        } catch (error) {
            console.error("Error creating role:", error)
            toast({
                title: "Error",
                description: "Failed to create role. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle updating a role
    const handleEditSubmit = async (data: z.infer<typeof roleSchema>) => {
        if (!selectedRole) return

        setIsSubmitting(true)
        try {
            // Call API to update role
            await apiService.roles.updateRole(selectedOrganization.id, selectedRole.id, data)

            toast({
                title: "Role updated",
                description: `Role "${data.name}" has been updated successfully.`,
            })

            setShowEditDialog(false)
            setSelectedRole(null)

            // Refresh roles list
            if (onRefresh) {
                onRefresh()
            }
        } catch (error) {
            console.error("Error updating role:", error)
            toast({
                title: "Error",
                description: "Failed to update role. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Handle deleting a role
    const handleDeleteSubmit = async () => {
        if (!selectedRole) return

        setIsSubmitting(true)
        try {
            // Call API to delete role
            await apiService.roles.deleteRole(selectedOrganization.id, selectedRole.id)

            toast({
                title: "Role deleted",
                description: `Role "${selectedRole.name}" has been deleted successfully.`,
            })

            setShowDeleteDialog(false)
            setSelectedRole(null)

            // Refresh roles list
            if (onRefresh) {
                onRefresh()
            }
        } catch (error) {
            console.error("Error deleting role:", error)
            toast({
                title: "Error",
                description: "Failed to delete role. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Tabs defaultValue="roles" className="space-y-4">
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    {onRefresh && (
                        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
                            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
                            {isRefreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                    )}
                    <Button onClick={() => setShowCreateDialog(true)}>
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

                            {rolesToDisplay.length === 0 ? (
                                <div className="p-4 text-center text-muted-foreground">
                                    No roles found. Create a role to get started.
                                </div>
                            ) : (
                                rolesToDisplay.map((role, index) => (
                                    <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center">
                                        <div className="col-span-3">
                                            <div className="font-medium">{role.name}</div>
                                        </div>
                                        <div className="col-span-5 text-sm text-muted-foreground">
                                            {role.description || "No description provided"}
                                        </div>
                                        <div className="col-span-2">
                                            <Badge variant="outline">{role.members || 0}</Badge>
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
                                                    <DropdownMenuItem onClick={() => handleEditRole(role)}>Edit Role</DropdownMenuItem>
                                                    <DropdownMenuItem>View Permissions ({role.permissions || 0})</DropdownMenuItem>
                                                    <DropdownMenuItem>View Members ({role.members || 0})</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteRole(role)}>
                                                        Delete Role
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))
                            )}
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

            {/* Create Role Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Role</DialogTitle>
                        <DialogDescription>Add a new role to define permissions for team members.</DialogDescription>
                    </DialogHeader>
                    <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                            <FormField
                                control={createForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Developer" {...field} />
                                        </FormControl>
                                        <FormDescription>A descriptive name for this role.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={createForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the role's responsibilities and access level" {...field} />
                                        </FormControl>
                                        <FormDescription>A brief description of what this role is for.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateDialog(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Role
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>Update the details for this role.</DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                            <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormDescription>A descriptive name for this role.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormDescription>A brief description of what this role is for.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowEditDialog(false)
                                        setSelectedRole(null)
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Delete Role Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the role "{selectedRole?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                handleDeleteSubmit()
                            }}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Tabs>
    )
}
