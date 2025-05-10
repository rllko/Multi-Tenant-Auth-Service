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
import {AlertCircle, Check, Search, Shield} from "lucide-react"
import {permissionGroups} from "./permissions-manager"

const roles = [
    {id: "role_1", name: "Administrator", organization: "Acme Inc."},
    {id: "role_2", name: "Developer", organization: "Acme Inc."},
    {id: "role_3", name: "Analyst", organization: "Globex Corporation"},
    {id: "role_4", name: "Support", organization: "Initech"},
]

const rolePermissions = {
    role_1: [
        "user.retrieve_all",
        "user.create",
        "user.delete",
        "user.ban",
        "license.retrieve_all",
        "license.create",
        "license.delete",
        "session.retrieve_all",
        "session.end_all",
        "subscription.retrieve_all",
        "subscription.create",
        "log.retrieve_all",
        "global.check_blacklist",
    ],
    role_2: ["user.retrieve_all", "license.retrieve_all", "session.retrieve_all", "log.retrieve_all"],
    role_3: ["user.retrieve_all", "license.retrieve_all"],
    role_4: ["user.retrieve_all", "user.retrieve_data", "license.retrieve_all", "session.check"],
}

export function RolePermissionsManager({selectedOrganization}) {
    const [selectedRole, setSelectedRole] = useState(null)
    const [selectedPermissions, setSelectedPermissions] = useState([])
    const [filteredRoles, setFilteredRoles] = useState([])
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("user")

    useEffect(() => {
        const orgRoles = roles.filter((role) => role.organization === selectedOrganization.name)
        setFilteredRoles(orgRoles)

        if (orgRoles.length > 0) {
            setSelectedRole(orgRoles[0].id)
            setSelectedPermissions(rolePermissions[orgRoles[0].id] || [])
        } else {
            setSelectedRole(null)
            setSelectedPermissions([])
        }
    }, [selectedOrganization])

    const handleRoleChange = (roleId) => {
        setSelectedRole(roleId)
        setSelectedPermissions(rolePermissions[roleId] || [])
    }

    const handlePermissionToggle = (permissionId) => {
        setSelectedPermissions((current) => {
            if (current.includes(permissionId)) {
                return current.filter((id) => id !== permissionId)
            } else {
                return [...current, permissionId]
            }
        })
    }

    const filterPermissions = (permissions) => {
        if (!searchQuery) return permissions
        return permissions.filter(
            (permission) =>
                permission.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                permission.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
    }

    const handleSelectAllInCategory = (categoryId, isSelected) => {
        const category = permissionGroups.find((g) => g.id === categoryId)
        if (!category) return

        if (isSelected) {
            y
            const permissionIds = category.permissions.map((p) => p.id)
            setSelectedPermissions((prev) => [...new Set([...prev, ...permissionIds])])
        } else {
            setSelectedPermissions((prev) => prev.filter((id) => !category.permissions.some((p) => p.id === id)))
        }
    }

    const isCategorySelected = (categoryId) => {
        const category = permissionGroups.find((g) => g.id === categoryId)
        if (!category) return false
        return category.permissions.every((p) => selectedPermissions.includes(p.id))
    }

    const isCategoryIndeterminate = (categoryId) => {
        const category = permissionGroups.find((g) => g.id === categoryId)
        if (!category) return false
        const selectedCount = category.permissions.filter((p) => selectedPermissions.includes(p.id)).length
        return selectedCount > 0 && selectedCount < category.permissions.length
    }

    const getPermissionCount = (categoryId) => {
        const category = permissionGroups.find((g) => g.id === categoryId)
        if (!category) return 0

        const totalPerms = category.permissions.length
        const selectedPerms = category.permissions.filter((p) => selectedPermissions.includes(p.id)).length

        return `${selectedPerms}/${totalPerms}`
    }

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
                <div className="space-y-2">
                    <Label htmlFor="role-select" className="text-gray-300">
                        Select Role
                    </Label>
                    {filteredRoles.length === 0 ? (
                        <div className="text-sm text-gray-400">No roles available in this organization.</div>
                    ) : (
                        <Select value={selectedRole} onValueChange={handleRoleChange}>
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
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
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
                                    const allPermissions = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id))
                                    setSelectedPermissions(allPermissions)
                                }}
                            >
                                Select All Permissions
                            </Button>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="mb-2">
                                <h3 className="text-sm font-medium mb-2 text-gray-300">Permission Categories</h3>
                                <TabsList className="flex flex-wrap h-auto bg-[#0f1117] border border-[#2a2f38] p-1">
                                    {permissionGroups.map((group) => (
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

                            {permissionGroups.map((group) => (
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
                                                    className={`${isCategoryIndeterminate(group.id) ? "opacity-70" : ""} border-[#2a2f38] text-[#1a73e8]`}
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
                                        <span
                                            className="text-sm text-gray-400">{getPermissionCount(group.id)} permissions selected</span>
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
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <AlertCircle className="h-8 w-8 text-gray-400 mb-2"/>
                                            <p className="text-gray-400">No permissions found matching your search.</p>
                                        </div>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>

                        <Separator className="my-4 bg-[#2a2f38]"/>

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:space-x-2">
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto border-[#2a2f38] text-gray-300 hover:bg-[#2a2f38] hover:text-white"
                            >
                                Cancel
                            </Button>
                            <Button className="w-full sm:w-auto bg-[#1a73e8] hover:bg-[#1565c0] text-white">
                                <Check className="mr-2 h-4 w-4"/>
                                Save Permissions
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
