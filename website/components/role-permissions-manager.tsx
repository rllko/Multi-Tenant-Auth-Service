"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import {Separator} from "@/components/ui/separator"
import {Input} from "@/components/ui/input"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {AlertCircle, Check, Loader2, Search, Shield} from "lucide-react"
import {permissionGroups} from "./permissions-manager"
import {useToast} from "@/hooks/use-toast"
import apiService from "@/lib/api-service"

// Define the Role and Permission types
interface Role {
    id: string
    name: string
    description?: string
    organization: string
    permissions: string[]
}

interface Permission {
    id: string
    name: string
    description?: string
}

interface PermissionGroup {
    id: string
    name: string
    permissions: Permission[]
}

export function RolePermissionsManager({selectedOrganization}) {
    const {toast} = useToast()
    const [roles, setRoles] = useState<Role[]>([])
    const [selectedRole, setSelectedRole] = useState<string | null>(null)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [filteredRoles, setFilteredRoles] = useState<Role[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("user")
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [allPermissions, setAllPermissions] = useState<PermissionGroup[]>([])

    // Fetch roles and permissions when the component mounts or organization changes
    useEffect(() => {
        const fetchRolesAndPermissions = async () => {
            if (!selectedOrganization?.id) return

            setIsLoading(true)
            try {
                // Fetch roles for the selected organization
                const rolesData = await apiService.roles.getRoles(selectedOrganization.id)
                console.log("Fetched roles:", rolesData)
                setRoles(rolesData)
                setFilteredRoles(rolesData)

                // Fetch all available permissions
                const permissionsData = await apiService.permissions.getPermissions(selectedOrganization.id)
                console.log("Fetched permissions:", permissionsData)
                setAllPermissions(permissionsData.groups || permissionGroups) // Fallback to mock data if needed

                // Set initial selected role if available
                if (rolesData.length > 0) {
                    setSelectedRole(rolesData[0].id)
                    setSelectedPermissions(rolesData[0].permissions || [])
                }
            } catch (error) {
                console.error("Error fetching roles and permissions:", error)
                toast({
                    title: "Error",
                    description: "Failed to load roles and permissions. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchRolesAndPermissions()
    }, [selectedOrganization?.id, toast])

    // Handle role change
    const handleRoleChange = (roleId: string) => {
        const role = roles.find((r) => r.id === roleId)
        if (role) {
            setSelectedRole(roleId)
            setSelectedPermissions(role.permissions || [])
        }
    }

    // Handle permission toggle
    const handlePermissionToggle = (permissionId: string) => {
        console.log(permissionId)
        setSelectedPermissions((current) => {

            if (current.includes(permissionId)) {
                return current.filter((id) => id !== permissionId)
            } else {
                return [...current, permissionId]
            }
        })
    }

    // Filter permissions based on search query
    const filterPermissions = (permissions: Permission[]) => {
        if (!searchQuery) return permissions
        return permissions.filter(
            (permission) =>
                permission.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                permission.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
    }

    // Handle select all in category
    const handleSelectAllInCategory = (categoryId: string, isSelected: boolean) => {
        const category = allPermissions.find((g) => g.id === categoryId)
        if (!category) return

        if (isSelected) {
            // Add all permissions from this category
            const permissionIds = category.permissions.map((p) => p.id)
            setSelectedPermissions((prev) => [...new Set([...prev, ...permissionIds])])
        } else {
            // Remove all permissions from this category
            setSelectedPermissions((prev) => prev.filter((id) => !category.permissions.some((p) => p.id === id)))
        }
    }

    // Check if all permissions in a category are selected
    const isCategorySelected = (categoryId: string) => {
        const category = allPermissions.find((g) => g.id === categoryId)
        if (!category) return false
        return category.permissions.every((p) => selectedPermissions.includes(p.id))
    }

    // Check if some permissions in a category are selected
    const isCategoryIndeterminate = (categoryId: string) => {
        const category = allPermissions.find((g) => g.id === categoryId)
        if (!category) return false
        const selectedCount = category.permissions.filter((p) => selectedPermissions.includes(p.id)).length
        return selectedCount > 0 && selectedCount < category.permissions.length
    }

    // Get the count of selected permissions in a category
    const getPermissionCount = (categoryId: string) => {
        const category = allPermissions.find((g) => g.id === categoryId)
        if (!category) return "0/0"

        const totalPerms = category.permissions.length
        const selectedPerms = category.permissions.filter((p) => selectedPermissions.includes(p.id)).length

        return `${selectedPerms}/${totalPerms}`
    }

    // Save role permissions
    const handleSavePermissions = async () => {
        if (!selectedRole) return
        console.log("Saving permissions for role:", selectedRole)
        console.log("Selected permissions:", selectedPermissions)
        setIsSaving(true)
        try {


            //  the role with the selected permissions
            await apiService.roles.updateRole(selectedOrganization.id, selectedRole, {
                permissions: selectedPermissions, // Make sure we're using the correct property name
            })

            // Update the local roles data
            setRoles(roles.map((role) => (role.id === selectedRole ? {
                ...role,
                permissions: selectedPermissions
            } : role)))

            toast({
                title: "Success",
                description: "Role permissions updated successfully.",
            })
        } catch (error) {
            console.error("Error saving role permissions:", error)
            toast({
                title: "Error",
                description: "Failed to update role permissions. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    // Check for permission conflicts
    const [conflicts, setConflicts] = useState<string[]>([])

    const checkForConflicts = () => {
        const newConflicts: string[] = []

        // Example conflict rule: If user has edit access to an app but no view access to billing
        if (
            selectedPermissions.some((p) => p.includes(".edit") || p.includes(".write")) &&
            !selectedPermissions.some((p) => p.includes("billing.view") || p.includes("billing.read"))
        ) {
            newConflicts.push("Roles with edit permissions should typically have view access to billing")
        }

        // Example conflict rule: If user has admin access to team but not to any app
        if (selectedPermissions.includes("team.admin") && !selectedPermissions.some((p) => p.includes("app.admin"))) {
            newConflicts.push("Team admins typically need admin access to at least one app")
        }

        setConflicts(newConflicts)
    }

    // Check for conflicts when permissions change
    useEffect(() => {
        checkForConflicts()
    }, [selectedPermissions])

    return (
        <Card className="bg-[#1a1d24] border-[#2a2f38] shadow-lg">
            <CardHeader className="border-b border-[#2a2f38]">
                <CardTitle className="text-white flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-[#1a73e8]"/>
                    Role Permissions
                </CardTitle>
                <CardDescription className="text-gray-400">
                    Assign permissions to roles in {selectedOrganization.name}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6 pt-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 text-[#1a73e8] animate-spin mb-2"/>
                        <p className="text-gray-400">Loading roles and permissions...</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="role-select" className="text-gray-300">
                                Select Role
                            </Label>
                            {filteredRoles.length === 0 ? (
                                <div className="text-sm text-gray-400">No roles available in this organization.</div>
                            ) : (
                                <Select value={selectedRole || undefined} onValueChange={handleRoleChange}>
                                    <SelectTrigger
                                        id="role-select"
                                        className="w-full sm:w-[250px] bg-[#0f1117] border-[#2a2f38] text-white focus:border-[#1a73e8] focus:ring-[#1a73e8]"
                                    >
                                        <SelectValue placeholder="Select a role"/>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1d24] border-[#2a2f38] text-white">
                                        {filteredRoles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.id}
                                                className="hover:bg-[#2a2f38] focus:bg-[#2a2f38] text-gray-300"
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {selectedRole && (
                            <>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div className="relative w-full sm:w-[250px]">
                                        <Search
                                            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
                                        <Input
                                            type="search"
                                            placeholder="Search permissions..."
                                            className="pl-8 bg-[#0f1117] border-[#2a2f38] text-white focus:border-[#1a73e8] focus:ring-[#1a73e8]"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-[#2a2f38] text-gray-300 hover:bg-[#2a2f38] hover:text-white"
                                        onClick={() => {
                                            const allPermissionIds = allPermissions.flatMap((g) => g.permissions.map((p) => p.id))
                                            setSelectedPermissions(allPermissionIds)
                                            console.log(allPermissionIds)
                                        }}
                                    >
                                        Select All Permissions
                                    </Button>
                                </div>

                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <div className="mb-2">
                                        <h3 className="text-sm font-medium mb-2 text-gray-300">Permission
                                            Categories</h3>
                                        <TabsList
                                            className="flex flex-wrap h-auto bg-[#0f1117] border border-[#2a2f38] p-1">
                                            {allPermissions.map((group) => (
                                                <TabsTrigger
                                                    key={group.id}
                                                    value={group.id}
                                                    className="text-xs relative flex-grow sm:flex-grow-0 py-1.5 px-3 data-[state=active]:bg-[#1a73e8]/10 data-[state=active]:text-[#1a73e8] text-gray-400"
                                                >
                                                    {group.name}
                                                    <span
                                                        className="ml-1.5 text-[10px] font-medium rounded-full bg-[#2a2f38] px-1.5 py-0.5 text-gray-300">
                            {getPermissionCount(group.id)}
                          </span>
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                    </div>

                                    {allPermissions.map((group) => (
                                        <TabsContent key={group.id} value={group.id} className="space-y-4 mt-4">
                                            <div
                                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <Checkbox
                                                            id={`select-all-${group.id}`}
                                                            checked={isCategorySelected(group.id)}
                                                            onCheckedChange={(checked) => handleSelectAllInCategory(group.id, !!checked)}
                                                            data-state={isCategoryIndeterminate(group.id) ? "indeterminate" : ""}
                                                            className={`${
                                                                isCategoryIndeterminate(group.id) ? "opacity-70" : ""
                                                            } border-[#2a2f38] text-[#1a73e8]`}
                                                        />
                                                        {isCategoryIndeterminate(group.id) && (
                                                            <div
                                                                className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                                <div className="h-[2px] w-[8px] bg-current"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Label htmlFor={`select-all-${group.id}`}
                                                           className="font-medium text-gray-300">
                                                        Select All {group.name}
                                                    </Label>
                                                </div>
                                                <span className="text-sm text-gray-400">
                          {getPermissionCount(group.id)} permissions selected
                        </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {filterPermissions(group.permissions).map((permission) => (
                                                    <div
                                                        key={permission.id}
                                                        className={`flex items-start space-x-2 p-2 rounded-md ${
                                                            selectedPermissions.includes(permission.id)
                                                                ? "bg-[#1a73e8]/10 border border-[#1a73e8]/20"
                                                                : "hover:bg-[#0f1117] border border-transparent"
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            id={permission.id}
                                                            checked={selectedPermissions.includes(permission.id)}
                                                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                            className="border-[#2a2f38] text-[#1a73e8]"
                                                        />
                                                        <div className="min-w-0 flex-1">
                                                            <Label
                                                                htmlFor={permission.id}
                                                                className="font-medium cursor-pointer text-sm block truncate text-gray-300"
                                                            >
                                                                {permission.name}
                                                            </Label>
                                                            <p className="text-xs text-gray-400 font-mono truncate">{permission.id}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {filterPermissions(group.permissions).length === 0 && (
                                                <div
                                                    className="flex flex-col items-center justify-center py-8 text-center">
                                                    <AlertCircle className="h-8 w-8 text-gray-400 mb-2"/>
                                                    <p className="text-gray-400">No permissions found matching your
                                                        search.</p>
                                                </div>
                                            )}
                                        </TabsContent>
                                    ))}
                                </Tabs>

                                {conflicts.length > 0 && (
                                    <div
                                        className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4">
                                        <div className="flex items-start gap-2">
                                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5"/>
                                            <div>
                                                <h4 className="font-medium text-amber-800 dark:text-amber-400">
                                                    Permission Conflicts Detected
                                                </h4>
                                                <ul className="mt-1 space-y-1 text-sm text-amber-700 dark:text-amber-300">
                                                    {conflicts.map((conflict, index) => (
                                                        <li key={index}>{conflict}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Separator className="my-4 bg-[#2a2f38]"/>

                                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-2">
                                    <Button
                                        variant="outline"
                                        className="w-full sm:w-auto border-[#2a2f38] text-gray-300 hover:bg-[#2a2f38] hover:text-white"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="w-full sm:w-auto bg-[#1a73e8] hover:bg-[#1565c0] text-white"
                                        onClick={handleSavePermissions}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-4 w-4"/>
                                                Save Permissions
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
