"use client"

import {useEffect, useState} from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Separator} from "@/components/ui/separator"
import {AlertTriangle, Loader2, RefreshCw} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {permissionsApi, rolesApi, teamsApi} from "@/lib/api-service";

interface PermissionEditorModalProps {
    isOpen: boolean
    onClose: () => void
    member: any | null
    teamId: string
    type: "team" | "app"
}

const DEFAULT_ROLES = [
    {
        id: "admin",
        name: "Admin",
        description: "Full access to all resources",
    },
    {
        id: "editor",
        name: "Editor",
        description: "Can view and edit resources",
    },
    {
        id: "viewer",
        name: "Viewer",
        description: "Read-only access to resources",
    },
]

export function PermissionEditorModal({isOpen, onClose, member, teamId, type}: PermissionEditorModalProps) {
    const [roles, setRoles] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedRole, setSelectedRole] = useState("")
    const [isSaving, setIsSaving] = useState(false)

    const {toast} = useToast()

    useEffect(() => {
        if (!isOpen) return

        setIsLoading(true)
        setError(null)

        if (member?.role) {
            setSelectedRole(member.role)
        }

        if (!teamId) {
            console.error("No teamId available, using default data")
            setRoles(DEFAULT_ROLES)
            setIsLoading(false)
            return
        }

        try {
            const data = rolesApi.getRoles(teamId)

            setRoles(data)

        } catch (err) {
            console.error("Error fetching roles:", err)

            setRoles(DEFAULT_ROLES)
            setError("Failed to load roles. Using default values.")
        }

        setIsLoading(false)

    }, [isOpen, member, teamId])

    const handleRoleChange = (roleId: string) => {
        setSelectedRole(roleId)
    }

    const handleSave = async () => {
        if (!member?.id || !teamId || !selectedRole) {
            onClose()
            return
        }

        try {
            setIsSaving(true)

            await teamsApi.updateTeamMember(teamId, member.id, selectedRole);

            toast({
                title: "Success",
                description: "Member role updated successfully.",
            })

            onClose()
        } catch (error) {
            console.error("Error saving member role:", error)
            toast({
                title: "Error",
                description: "Failed to update member role.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const handleRefresh = async () => {
        if (!teamId) return

        setIsLoading(true)
        setError(null)

        try {
            const data = await permissionsApi.getPermissions(teamId)

            setRoles(data);
        } catch (err) {
            console.error("Error refreshing roles:", err);
            setError("Failed to refresh roles.");
        }

        setIsLoading(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className={type === "team" ? "text-blue-600" : "text-purple-600"}>
                        Change Member Role
                    </DialogTitle>
                    <DialogDescription>Update the role for this team member to change their
                        permissions.</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin mr-2"/>
                        <span>Loading roles...</span>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-8 text-destructive">
                        <AlertTriangle className="h-8 w-8 mb-2"/>
                        <p>{error}</p>
                        <Button variant="outline" onClick={handleRefresh} className="mt-4">
                            <RefreshCw className="h-4 w-4 mr-2"/>
                            Retry
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 py-2">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={member?.avatar || "/placeholder.svg"} alt={member?.name}/>
                                <AvatarFallback>{member?.name ? member.name.charAt(0) : "U"}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-medium">{member?.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {member?.email} • {member?.role ? member.role.charAt(0).toUpperCase() + member.role.slice(1) : "User"}
                                </p>
                            </div>
                        </div>

                        <Separator/>

                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <h4 className="font-medium">Select Role</h4>
                                <p className="text-sm text-muted-foreground">
                                    Choose a role to assign to this team member. Each role has different permissions.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <Select value={selectedRole} onValueChange={handleRoleChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a role"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.length === 0 ? (
                                            <div className="p-2 text-muted-foreground text-sm">No roles available.</div>
                                        ) : (
                                            roles.map((role) => (
                                                <SelectItem key={role.id} value={role.id}>
                                                    {role.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh roles">
                                    <RefreshCw className="h-4 w-4"/>
                                </Button>
                            </div>

                            {selectedRole && (
                                <div className="p-3 bg-muted/50 rounded-md">
                                    <h5 className="font-medium text-sm">
                                        {roles.find((r) => r.id === selectedRole)?.name ||
                                            selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                                    </h5>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {roles.find((r) => r.id === selectedRole)?.description || "No description available."}
                                    </p>
                                </div>
                            )}
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={onClose} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !selectedRole || selectedRole === member?.role}
                                className={type === "team" ? "bg-blue-600 hover:bg-blue-700" : "bg-purple-600 hover:bg-purple-700"}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
