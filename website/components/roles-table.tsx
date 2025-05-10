"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
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
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
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
import {Edit, KeyRound, Loader2, MoreHorizontal, Plus, Shield, Trash, Users} from "lucide-react"
import {CreateRoleModal} from "./create-role-modal"
import {RolePermissionsModal} from "./role-permissions-modal"

interface RolesTableProps {
    roles: any[]
    onRoleSelect: (role: any) => void
    onRoleCreate: (role: any) => void
    onRoleUpdate: (id: string, role: any) => void
    onRoleDelete: (id: string) => void
    loading: boolean
    teamId: string
    onRefresh: () => void
}

export function RolesTable({
                               roles,
                               onRoleSelect,
                               onRoleCreate,
                               onRoleUpdate,
                               onRoleDelete,
                               loading,
                               teamId,
                               onRefresh,
                           }: RolesTableProps) {
    const [open, setOpen] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const [selectedRole, setSelectedRole] = useState<any | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showPermissionsModal, setShowPermissionsModal] = useState(false)

    const filteredRoles = roles.filter(
        (role) =>
            (role.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (role.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
    )

    const handleEdit = (role: any) => {
        setSelectedRole(role)
        setOpen(true)
    }

    const handleCreate = () => {
        setShowCreateModal(true)
    }

    const handleSave = (formData: FormData) => {
        const roleData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            scopes: selectedRole?.scopes || [],
            isDefault: formData.get("isDefault") === "on",
            isCustom: true,
        }

        if (selectedRole) {
            onRoleUpdate(selectedRole.id, roleData)
        } else {
            onRoleCreate(roleData)
        }
        setOpen(false)
    }

    const handleDelete = () => {
        if (selectedRole) {
            onRoleDelete(selectedRole.id)
            setConfirmDelete(false)
            setSelectedRole(null)
        }
    }

    const handleManagePermissions = (role: any) => {
        setSelectedRole(role)
        setShowPermissionsModal(true)
    }

    return (
        <>
            <Card className="shadow-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between bg-secondary/50 rounded-t-lg">
                    <div className="space-y-1.5">
                        <CardTitle>Roles</CardTitle>
                        <CardDescription>Manage user roles and their permissions.</CardDescription>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4"/>
                        Add Role
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="relative flex items-center mb-4">
                        <Input
                            type="search"
                            placeholder="Search roles..."
                            className="max-w-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        {loading && (
                            <div
                                className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
                                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            </div>
                        )}

                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow>
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRoles.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No roles found. Create a new role to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRoles.map((role) => (
                                        <TableRow
                                            key={role.id}
                                            className="hover:bg-muted/50 cursor-pointer"
                                            onClick={() => onRoleSelect(role)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="h-4 w-4 text-muted-foreground"/>
                                                    <span className="font-medium">{role.name}</span>
                                                    {role.isDefault && (
                                                        <Badge variant="outline" className="ml-2">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{role.description}</TableCell>
                                            <TableCell>
                                                <Badge variant={role.isSystemRole ? "secondary" : "outline"}>
                                                    {role.isSystemRole ? "System" : "Custom"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-secondary">
                                                    <Users className="mr-1 h-3 w-3"/>
                                                    {role.scopes?.length || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4"/>
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEdit(role)}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit Role
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleManagePermissions(role)}>
                                                            <KeyRound className="mr-2 h-4 w-4"/>
                                                            Manage Permissions
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator/>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => {
                                                                setSelectedRole(role)
                                                                setConfirmDelete(true)
                                                            }}
                                                            disabled={role.isSystemRole}
                                                        >
                                                            <Trash className="mr-2 h-4 w-4"/>
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
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Role Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>{selectedRole ? "Edit Role" : "Create Role"}</DialogTitle>
                        <DialogDescription>{selectedRole ? "Update role details." : "Configure a new role."}</DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSave(new FormData(e.currentTarget))
                        }}
                    >
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={selectedRole?.name || ""}
                                    placeholder="e.g. Admin, Editor, Viewer"
                                    required
                                    disabled={selectedRole?.isSystemRole}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={selectedRole?.description || ""}
                                    placeholder="Describe the purpose of this role"
                                    required
                                    disabled={selectedRole?.isSystemRole}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isDefault"
                                    name="isDefault"
                                    defaultChecked={selectedRole?.isDefault || false}
                                    className="rounded border-gray-300"
                                    disabled={selectedRole?.isSystemRole}
                                />
                                <Label htmlFor="isDefault" className="font-normal">
                                    Set as default role for new users
                                </Label>
                            </div>

                            {selectedRole?.isSystemRole && (
                                <div
                                    className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 text-sm">
                                    This is a system role and cannot be modified. You can only view its details.
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={loading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading || selectedRole?.isSystemRole}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                        {selectedRole ? "Updating..." : "Creating..."}
                                    </>
                                ) : selectedRole ? (
                                    "Update Role"
                                ) : (
                                    "Create Role"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Role Dialog */}
            <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Role</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the role "{selectedRole?.name}"? This action cannot be
                            undone and will
                            remove this role from all users who have it assigned.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}
                                           className="bg-destructive text-destructive-foreground">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Deleting...
                                </>
                            ) : (
                                "Delete Role"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Create Role Modal */}
            <CreateRoleModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                teamId={teamId}
                onRoleCreated={onRefresh}
            />

            {/* Role Permissions Modal */}
            <RolePermissionsModal
                isOpen={showPermissionsModal}
                onClose={() => setShowPermissionsModal(false)}
                role={selectedRole}
                teamId={teamId}
                onPermissionsUpdated={onRefresh}
            />
        </>
    )
}
