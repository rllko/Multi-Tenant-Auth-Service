"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, Edit } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { PermissionEditorModal } from "./permission-editor-modal"
import apiService from "@/lib/api-service"

interface Permission {
    id: string
    name: string
    description?: string
    resource: string
    action: string
    impact?: string
}

interface PermissionsManagementProps {
    teamId: string
    onRefresh?: () => void
    isRefreshing?: boolean
}

export function PermissionsManagement({ teamId, onRefresh, isRefreshing = false }: PermissionsManagementProps) {
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null)
    const { toast } = useToast()

    // Form state for creating a new permission
    const [newPermission, setNewPermission] = useState<Omit<Permission, "id">>({
        name: "",
        description: "",
        resource: "",
        action: "read",
        impact: "low",
    })

    // Fetch permissions
    const fetchPermissions = async () => {
        if (!teamId) {
            console.error("Team ID is missing or undefined:", teamId)
            setError("Team ID is required to fetch permissions")
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            // Log the actual URL being constructed to debug the issue
            console.log(`Fetching permissions for team ID: ${teamId}`)
            console.log(`API URL: ${process.env.NEXT_PUBLIC_API_URL}/teams/${teamId}/permissions`)

            // Use the apiService to fetch permissions
            const data = await apiService.permissions.getPermissions(teamId)
            console.log("Permissions data received:", data)
            setPermissions(data)
        } catch (err) {
            console.error("Error fetching permissions:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to load permissions"
            setError(errorMessage)

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Create a new permission
    const handleCreatePermission = async () => {
        if (!teamId) {
            toast({
                title: "Error",
                description: "Team ID is required to create a permission",
                variant: "destructive",
            })
            return
        }

        try {
            setIsLoading(true)

            // Generate a unique ID for the permission
            const id = `${newPermission.resource}.${newPermission.action}`.toLowerCase().replace(/\s+/g, "-")

            // Use the apiService to create a permission
            await apiService.permissions.createPermission(teamId, {
                id,
                ...newPermission,
            })

            toast({
                title: "Permission created",
                description: `Permission "${newPermission.name}" has been created successfully.`,
            })

            // Reset form and close modal
            setNewPermission({
                name: "",
                description: "",
                resource: "",
                action: "read",
                impact: "low",
            })
            setShowCreateModal(false)

            // Refresh permissions list
            fetchPermissions()
        } catch (err) {
            console.error("Error creating permission:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to create permission"

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Delete a permission
    const handleDeletePermission = async (permissionId: string) => {
        if (!teamId) {
            toast({
                title: "Error",
                description: "Team ID is required to delete a permission",
                variant: "destructive",
            })
            return
        }

        if (!confirm("Are you sure you want to delete this permission? This action cannot be undone.")) {
            return
        }

        try {
            setIsLoading(true)

            // Use the apiService to delete a permission
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${teamId}/permissions/${permissionId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            })

            toast({
                title: "Permission deleted",
                description: "The permission has been deleted successfully.",
            })

            // Refresh permissions list
            fetchPermissions()
        } catch (err) {
            console.error("Error deleting permission:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to delete permission"

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    // Edit a permission
    const handleEditPermission = (permission: Permission) => {
        setSelectedPermission(permission)
        setShowEditModal(true)
    }

    // Effect to fetch permissions on mount and when teamId changes
    useEffect(() => {
        if (teamId) {
            fetchPermissions()
        }
    }, [teamId])

    // Effect to refresh permissions when onRefresh is called
    useEffect(() => {
        if (isRefreshing && onRefresh) {
            fetchPermissions()
        }
    }, [isRefreshing, onRefresh])

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">System Permissions</h3>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Permission
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : error ? (
                <div className="rounded-md bg-destructive/15 p-4">
                    <h2 className="text-lg font-semibold text-destructive">Error Loading Permissions</h2>
                    <p className="mt-2 text-sm">{error}</p>
                    <Button onClick={fetchPermissions} className="mt-4" variant="outline">
                        Try Again
                    </Button>
                </div>
            ) : permissions.length === 0 ? (
                <div className="text-center py-8 border rounded-md">
                    <h3 className="text-lg font-medium mb-2">No permissions found</h3>
                    <p className="text-muted-foreground mb-4">Create your first permission to get started.</p>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Permission
                    </Button>
                </div>
            ) : (
                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Resource</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Impact</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {permissions.map((permission) => (
                                <TableRow key={permission.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{permission.name}</div>
                                            {permission.description && (
                                                <div className="text-sm text-muted-foreground">{permission.description}</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{permission.resource}</TableCell>
                                    <TableCell>{permission.action}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                permission.impact === "high"
                                                    ? "destructive"
                                                    : permission.impact === "medium"
                                                        ? "default"
                                                        : "outline"
                                            }
                                        >
                                            {permission.impact || "low"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEditPermission(permission)}
                                                title="Edit permission"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeletePermission(permission.id)}
                                                title="Delete permission"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Create Permission Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Permission</DialogTitle>
                        <DialogDescription>Add a new permission to the system.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={newPermission.name}
                                onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                                placeholder="View Users"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={newPermission.description}
                                onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                                placeholder="Allows viewing the list of users"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="resource">Resource</Label>
                            <Input
                                id="resource"
                                value={newPermission.resource}
                                onChange={(e) => setNewPermission({ ...newPermission, resource: e.target.value })}
                                placeholder="users"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="action">Action</Label>
                            <Select
                                value={newPermission.action}
                                onValueChange={(value) => setNewPermission({ ...newPermission, action: value })}
                            >
                                <SelectTrigger id="action">
                                    <SelectValue placeholder="Select an action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="read">Read</SelectItem>
                                    <SelectItem value="write">Write</SelectItem>
                                    <SelectItem value="create">Create</SelectItem>
                                    <SelectItem value="update">Update</SelectItem>
                                    <SelectItem value="delete">Delete</SelectItem>
                                    <SelectItem value="manage">Manage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="impact">Impact</Label>
                            <Select
                                value={newPermission.impact}
                                onValueChange={(value) => setNewPermission({ ...newPermission, impact: value })}
                            >
                                <SelectTrigger id="impact">
                                    <SelectValue placeholder="Select impact level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreatePermission} disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Permission Modal */}
            {selectedPermission && (
                <PermissionEditorModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    permission={selectedPermission}
                    teamId={teamId}
                    onPermissionUpdated={fetchPermissions}
                />
            )}
        </div>
    )
}
