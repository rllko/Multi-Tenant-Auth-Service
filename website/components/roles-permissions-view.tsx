"use client"

import {useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Button} from "@/components/ui/button"
import {RefreshCw} from "lucide-react"
import {cn} from "@/lib/utils"
import {useToast} from "@/hooks/use-toast"
import {RolesTable} from "./roles-table"
import {CreateRoleModal} from "./create-role-modal"
import {PermissionsManagement} from "./permissions-management"
import {CONSTANTS} from "@/app/const";
import {rolesApi} from "@/lib/api-service";
import {Role} from "@/models/role";


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
    const {toast} = useToast()
    const [showCreateRoleModal, setShowCreateRoleModal] = useState(false)
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [activeTab, setActiveTab] = useState("roles")

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role)
        toast({
            title: "Role selected",
            description: `Selected role: ${role.role_name}`,
        })
    }

    const handleRoleCreate = async (role: Role) => {
        setIsSubmitting(true)
        try {
            await rolesApi.createRole(selectedOrganization.id, role);

            toast({
                title: "Role created",
                description: `Role "${role.role_name}" has been created successfully.`,
            })

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

    const handleRoleUpdate = async (id: string, role: Role) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedOrganization.id}/roles/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                },
                body: JSON.stringify(role),
            })

            if (!response.ok) {
                throw new Error(`Failed to update role: ${response.statusText}`)
            }

            toast({
                title: "Role updated",
                description: `Role "${role.role_name}" has been updated successfully.`,
            })

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

    const handleRoleDelete = async (id: string) => {
        setIsSubmitting(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedOrganization.id}/roles/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to delete role: ${response.statusText}`)
            }

            toast({
                title: "Role deleted",
                description: "The role has been deleted successfully.",
            })

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
        <Tabs defaultValue="roles" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    {onRefresh && (
                        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
                            <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")}/>
                            {isRefreshing ? "Refreshing..." : "Refresh"}
                        </Button>
                    )}
                    <Button onClick={() => setShowCreateRoleModal(true)}
                            className={activeTab === "permissions" ? "hidden" : ""}>
                        Create Role
                    </Button>
                </div>
            </div>

            <TabsContent value="roles" className="space-y-4">
                <RolesTable
                    roles={roles}
                    onRoleSelect={handleRoleSelect}
                    onRoleCreate={handleRoleCreate}
                    onRoleUpdate={handleRoleUpdate}
                    onRoleDelete={handleRoleDelete}
                    loading={isSubmitting || isRefreshing}
                    teamId={selectedOrganization.id}
                    onRefresh={onRefresh || (() => {
                    })}
                />
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Permissions</CardTitle>
                        <CardDescription>Manage permissions that can be assigned to roles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PermissionsManagement teamId={selectedOrganization.id} onRefresh={onRefresh}
                                               isRefreshing={isRefreshing}/>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Create Role Modal */}
            <CreateRoleModal
                isOpen={showCreateRoleModal}
                onClose={() => setShowCreateRoleModal(false)}
                teamId={selectedOrganization.id}
                onRoleCreated={onRefresh || (() => {
                })}
            />
        </Tabs>
    )
}
