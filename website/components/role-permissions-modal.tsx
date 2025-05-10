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
import {Checkbox} from "@/components/ui/checkbox"
import {Label} from "@/components/ui/label"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Separator} from "@/components/ui/separator"
import {AlertTriangle, Info, Loader2, RefreshCw, Search} from "lucide-react"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {ScrollArea} from "@/components/ui/scroll-area"
import {useToast} from "@/hooks/use-toast"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {permissionsApi, rolesApi} from "@/lib/api-service";

interface RolePermissionsModalProps {
    isOpen: boolean
    onClose: () => void
    role: any | null
    teamId: string
    onPermissionsUpdated: () => void
}

const DEFAULT_PERMISSIONS = [
    {
        id: "user.read",
        name: "View Users",
        description: "Can view user profiles",
        resource: "user",
        action: "read",
        impact: "low",
    },
    {
        id: "user.write",
        name: "Edit Users",
        description: "Can edit user profiles",
        resource: "user",
        action: "write",
        impact: "medium",
    },
    {
        id: "license.read",
        name: "View Licenses",
        description: "Can view license details",
        resource: "license",
        action: "read",
        impact: "low",
    },
    {
        id: "license.write",
        name: "Manage Licenses",
        description: "Can create and modify licenses",
        resource: "license",
        action: "write",
        impact: "medium",
    },
    {
        id: "app.read",
        name: "View Applications",
        description: "Can view application details",
        resource: "app",
        action: "read",
        impact: "low",
    },
    {
        id: "app.write",
        name: "Manage Applications",
        description: "Can create and modify applications",
        resource: "app",
        action: "write",
        impact: "medium",
    },
    {
        id: "team.read",
        name: "View Team",
        description: "Can view team details",
        resource: "team",
        action: "read",
        impact: "low",
    },
    {
        id: "team.write",
        name: "Manage Team",
        description: "Can modify team settings",
        resource: "team",
        action: "write",
        impact: "medium",
    },
    {
        id: "analytics.read",
        name: "View Analytics",
        description: "Can view analytics data",
        resource: "analytics",
        action: "read",
        impact: "low",
    },
    {
        id: "analytics.export",
        name: "Export Analytics",
        description: "Can export analytics data",
        resource: "analytics",
        action: "export",
        impact: "medium",
    },
]

export function RolePermissionsModal({
                                         isOpen,
                                         onClose,
                                         role,
                                         teamId,
                                         onPermissionsUpdated,
                                     }: RolePermissionsModalProps) {
    const [permissions, setPermissions] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTab, setSelectedTab] = useState("categories")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const {toast} = useToast()

    useEffect(() => {
        if (!isOpen || !role) return

        setIsLoading(true)
        setError(null)

        if (role.scopes) {
            setSelectedPermissions(role.scopes)
        } else {
            setSelectedPermissions([])
        }

        if (!teamId) {
            console.error("No teamId available, using default data")
            setPermissions(DEFAULT_PERMISSIONS)

            const uniqueResources = [...new Set(DEFAULT_PERMISSIONS.map((p) => p.resource || "other"))]
            const categoriesData = uniqueResources.map((resource) => ({
                id: resource,
                name: resource.charAt(0).toUpperCase() + resource.slice(1),
                description: `${resource.charAt(0).toUpperCase() + resource.slice(1)} related permissions`,
                count: DEFAULT_PERMISSIONS.filter((p) => p.resource === resource).length,
            }))

            setCategories(categoriesData)

            if (categoriesData.length > 0) {
                setSelectedCategory(categoriesData[0].id)
            }

            setIsLoading(false)
            return
        }

        try {
            const data = permissionsApi.getPermissions(teamId)

            // If API returns empty array, use default permissions
            if (Array.isArray(data) && data.length === 0) {
                setPermissions(DEFAULT_PERMISSIONS)

                // Extract categories from default permissions
                const uniqueResources = [...new Set(DEFAULT_PERMISSIONS.map((p) => p.resource || "other"))]
                const categoriesData = uniqueResources.map((resource) => ({
                    id: resource,
                    name: resource.charAt(0).toUpperCase() + resource.slice(1),
                    description: `${resource.charAt(0).toUpperCase() + resource.slice(1)} related permissions`,
                    count: DEFAULT_PERMISSIONS.filter((p) => p.resource === resource).length,
                }))

                setCategories(categoriesData)

                if (categoriesData.length > 0) {
                    setSelectedCategory(categoriesData[0].id)
                }
            } else {
                setPermissions(data)

                // Extract categories
                const uniqueResources = [...new Set(data.map((p) => p.resource || "other"))]
                const categoriesData = uniqueResources.map((resource) => ({
                    id: resource,
                    name: resource.charAt(0).toUpperCase() + resource.slice(1),
                    description: `${resource.charAt(0).toUpperCase() + resource.slice(1)} related permissions`,
                    count: data.filter((p) => p.resource === resource).length,
                }))

                setCategories(categoriesData)

                if (categoriesData.length > 0) {
                    setSelectedCategory(categoriesData[0].id)
                }
            }
        } catch (err) {
            console.error("Error fetching permissions:", err)
            // Use default permissions as fallback
            setPermissions(DEFAULT_PERMISSIONS)

            // Extract categories from default permissions
            const uniqueResources = [...new Set(DEFAULT_PERMISSIONS.map((p) => p.resource || "other"))]
            const categoriesData = uniqueResources.map((resource) => ({
                id: resource,
                name: resource.charAt(0).toUpperCase() + resource.slice(1),
                description: `${resource.charAt(0).toUpperCase() + resource.slice(1)} related permissions`,
                count: DEFAULT_PERMISSIONS.filter((p) => p.resource === resource).length,
            }))

            setCategories(categoriesData)

            if (categoriesData.length > 0) {
                setSelectedCategory(categoriesData[0].id)
            }

            setError("Failed to load permissions. Using default values.")
        } finally {
            setIsLoading(false)
        }
    }, [isOpen, role, teamId])

    const fetchPermissionDetails = async (permissionId: string) => {
        if (!teamId) return null

        try {
            return await permissionsApi.getPermission(teamId, permissionId)

        } catch (error) {
            console.error(`Error fetching details for permission ${permissionId}:`, error)
            return null
        }
    }

    const filteredPermissions = permissions.filter((p) => {
        const matchesSearch = searchQuery
            ? (p.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (p.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (p.resource?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
            (p.action?.toLowerCase() || "").includes(searchQuery.toLowerCase())
            : true

        const matchesCategory =
            selectedTab === "categories" ? selectedCategory === null || p.resource === selectedCategory : true

        return matchesSearch && matchesCategory
    })


    const handlePermissionToggle = async (permissionId: string) => {
        if (!selectedPermissions.includes(permissionId) && !permissions.some((p) => p.id === permissionId)) {
            const permissionDetails = await fetchPermissionDetails(permissionId)

            if (permissionDetails) {
                setPermissions((prev) => [...prev, permissionDetails])

                if (!categories.some((c) => c.id === permissionDetails.resource)) {
                    setCategories((prev) => [
                        ...prev,
                        {
                            id: permissionDetails.resource,
                            name: permissionDetails.resource.charAt(0).toUpperCase() + permissionDetails.resource.slice(1),
                            description: `${permissionDetails.resource.charAt(0).toUpperCase() + permissionDetails.resource.slice(1)} related permissions`,
                            count: 1,
                        },
                    ])
                } else {
                    setCategories((prev) =>
                        prev.map((c) => (c.id === permissionDetails.resource ? {...c, count: c.count + 1} : c)),
                    )
                }
            }
        }

        setSelectedPermissions((prev) => {
            if (prev.includes(permissionId)) {
                return prev.filter((id) => id !== permissionId)
            } else {
                return [...prev, permissionId]
            }
        })
    }


    const handleSave = async () => {
        if (!role?.id || !teamId) {
            onClose()
            return
        }

        try {
            setIsSaving(true)

            await rolesApi.updateRole(teamId, role.id, role);

            toast({
                title: "Success",
                description: "Role permissions updated successfully.",
            })

            onPermissionsUpdated()
            onClose()
        } catch (error) {
            console.error("Error saving permissions:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to save permissions. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const getImpactColor = (impact: string) => {
        const colors = {
            critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            high: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
            medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        }
        return colors[impact?.toLowerCase()] || colors.medium
    }

    const handleRefresh = async () => {
        if (!teamId) return

        setIsLoading(true)
        setError(null)

        try {

            const data = await permissionsApi.getPermissions(teamId);

            if (Array.isArray(data) && data.length === 0) {
                setPermissions(DEFAULT_PERMISSIONS)

                // Extract categories from default permissions
                const uniqueResources = [...new Set(DEFAULT_PERMISSIONS.map((p) => p.resource || "other"))]
                const categoriesData = uniqueResources.map((resource) => ({
                    id: resource,
                    name: resource.charAt(0).toUpperCase() + resource.slice(1),
                    description: `${resource.charAt(0).toUpperCase() + resource.slice(1)} related permissions`,
                    count: DEFAULT_PERMISSIONS.filter((p) => p.resource === resource).length,
                }))

                setCategories(categoriesData)
            } else {
                setPermissions(data)

                // Extract categories
                const uniqueResources = [...new Set(data.map((p) => p.resource || "other"))]
                const categoriesData = uniqueResources.map((resource) => ({
                    id: resource,
                    name: resource.charAt(0).toUpperCase() + resource.slice(1),
                    description: `${resource.charAt(0).toUpperCase() + resource.slice(1)} related permissions`,
                    count: data.filter((p) => p.resource === resource).length,
                }))

                setCategories(categoriesData)
            }

        } catch (err) {
            console.error("Error refreshing permissions:", err)
            setError("Failed to refresh permissions.")
        } finally {
            setIsLoading(false)
        }
    }

    const selectAllInCategory = (categoryId: string) => {
        const categoryPermissionIds = permissions.filter((p) => p.resource === categoryId).map((p) => p.id)

        setSelectedPermissions((prev) => {
            const withoutCategory = prev.filter((id) => !categoryPermissionIds.includes(id))
            return [...withoutCategory, ...categoryPermissionIds]
        })
    }

    const deselectAllInCategory = (categoryId: string) => {
        const categoryPermissionIds = permissions.filter((p) => p.resource === categoryId).map((p) => p.id)

        setSelectedPermissions((prev) => prev.filter((id) => !categoryPermissionIds.includes(id)))
    }

    const isAllCategorySelected = (categoryId: string) => {
        const categoryPermissionIds = permissions.filter((p) => p.resource === categoryId).map((p) => p.id)

        return categoryPermissionIds.every((id) => selectedPermissions.includes(id))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-blue-600">Edit Role Permissions</DialogTitle>
                    <DialogDescription>Manage the permissions for the "{role?.name}" role</DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin mr-2"/>
                        <span>Loading permissions data...</span>
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
                            <div>
                                <h3 className="font-medium">{role?.name}</h3>
                                <p className="text-sm text-muted-foreground">{role?.description || "No description available"}</p>
                            </div>
                        </div>

                        <Separator/>

                        <div className="flex justify-between items-center mt-4">
                            <Tabs defaultValue="categories" value={selectedTab} onValueChange={setSelectedTab}
                                  className="w-full">
                                <div className="flex justify-between items-center">
                                    <TabsList>
                                        <TabsTrigger value="categories">By Category</TabsTrigger>
                                        <TabsTrigger value="all">All Permissions</TabsTrigger>
                                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                                    </TabsList>

                                    <div className="relative w-[250px]">
                                        <Search
                                            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                        <Input
                                            type="search"
                                            placeholder="Search permissions..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Categories Tab */}
                                <TabsContent value="categories" className="mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        {categories.map((category) => (
                                            <Card
                                                key={category.id}
                                                className={`cursor-pointer hover:border-blue-200 transition-colors ${
                                                    selectedCategory === category.id ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : ""
                                                }`}
                                                onClick={() => setSelectedCategory(category.id)}
                                            >
                                                <CardHeader className="pb-2">
                                                    <CardTitle>{category.name}</CardTitle>
                                                    <CardDescription>{category.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent className="flex justify-between items-center">
                                                    <Badge variant="secondary">{category.count} permissions</Badge>
                                                    {selectedCategory === category.id && (
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    if (isAllCategorySelected(category.id)) {
                                                                        deselectAllInCategory(category.id)
                                                                    } else {
                                                                        selectAllInCategory(category.id)
                                                                    }
                                                                }}
                                                            >
                                                                {isAllCategorySelected(category.id) ? "Deselect All" : "Select All"}
                                                            </Button>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {selectedCategory && (
                                        <ScrollArea className="h-[300px] border rounded-md">
                                            <div className="p-4 space-y-3">
                                                {filteredPermissions.length === 0 ? (
                                                    <div className="text-center py-8 text-muted-foreground">
                                                        {searchQuery ? "No permissions found matching your search." : "No permissions available."}
                                                    </div>
                                                ) : (
                                                    filteredPermissions.map((permission) => (
                                                        <div
                                                            key={permission.id}
                                                            className={`flex items-start space-x-2 p-3 rounded-md ${
                                                                selectedPermissions.includes(permission.id)
                                                                    ? "bg-blue-50 dark:bg-blue-950"
                                                                    : "hover:bg-muted/50"
                                                            }`}
                                                        >
                                                            <Checkbox
                                                                id={permission.id}
                                                                checked={selectedPermissions.includes(permission.id)}
                                                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                                className="mt-1"
                                                            />
                                                            <div className="grid gap-1 leading-none">
                                                                <div className="flex items-center gap-1">
                                                                    <Label
                                                                        htmlFor={permission.id}
                                                                        className="text-sm font-medium leading-none cursor-pointer"
                                                                    >
                                                                        {permission.name}
                                                                    </Label>
                                                                    {permission.impact && (
                                                                        <Badge
                                                                            className={getImpactColor(permission.impact)}>
                                                                            {permission.impact.charAt(0).toUpperCase() + permission.impact.slice(1)}
                                                                        </Badge>
                                                                    )}
                                                                    <TooltipProvider>
                                                                        <Tooltip>
                                                                            <TooltipTrigger asChild>
                                                                                <Info
                                                                                    className="h-3.5 w-3.5 text-muted-foreground"/>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent>
                                                                                <p className="max-w-xs">{permission.description}</p>
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    </TooltipProvider>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                                                                <div className="flex gap-2 mt-1">
                                                                    <Badge
                                                                        variant="outline">{permission.resource}</Badge>
                                                                    <Badge
                                                                        variant="secondary">{permission.action}</Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>
                                    )}
                                </TabsContent>

                                {/* All Permissions Tab */}
                                <TabsContent value="all" className="mt-4">
                                    <ScrollArea className="h-[400px] border rounded-md">
                                        <div className="p-4 space-y-3">
                                            {filteredPermissions.length === 0 ? (
                                                <div className="text-center py-8 text-muted-foreground">
                                                    {searchQuery ? "No permissions found matching your search." : "No permissions available."}
                                                </div>
                                            ) : (
                                                filteredPermissions.map((permission) => (
                                                    <div
                                                        key={permission.id}
                                                        className={`flex items-start space-x-2 p-3 rounded-md ${
                                                            selectedPermissions.includes(permission.id)
                                                                ? "bg-blue-50 dark:bg-blue-950"
                                                                : "hover:bg-muted/50"
                                                        }`}
                                                    >
                                                        <Checkbox
                                                            id={`all-${permission.id}`}
                                                            checked={selectedPermissions.includes(permission.id)}
                                                            onCheckedChange={() => handlePermissionToggle(permission.id)}
                                                            className="mt-1"
                                                        />
                                                        <div className="grid gap-1 leading-none">
                                                            <div className="flex items-center gap-1">
                                                                <Label
                                                                    htmlFor={`all-${permission.id}`}
                                                                    className="text-sm font-medium leading-none cursor-pointer"
                                                                >
                                                                    {permission.name}
                                                                </Label>
                                                                {permission.impact && (
                                                                    <Badge
                                                                        className={getImpactColor(permission.impact)}>
                                                                        {permission.impact.charAt(0).toUpperCase() + permission.impact.slice(1)}
                                                                    </Badge>
                                                                )}
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Info
                                                                                className="h-3.5 w-3.5 text-muted-foreground"/>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p className="max-w-xs">{permission.description}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground">{permission.description}</p>
                                                            <div className="flex gap-2 mt-1">
                                                                <Badge variant="outline">{permission.resource}</Badge>
                                                                <Badge variant="secondary">{permission.action}</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                {/* Advanced Tab */}
                                <TabsContent value="advanced" className="mt-4">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-medium mb-2">Raw Permissions</h3>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                View and edit the raw permission identifiers.
                                            </p>
                                            <div className="border rounded-md p-2">
                                                <Input
                                                    value={selectedPermissions.join(", ")}
                                                    onChange={(e) => {
                                                        const newPermissions = e.target.value
                                                            .split(",")
                                                            .map((p) => p.trim())
                                                            .filter(Boolean)
                                                        setSelectedPermissions(newPermissions)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0 mt-4">
                            <div className="text-sm text-muted-foreground">{selectedPermissions.length} permissions
                                selected
                            </div>
                            <div>
                                <Button variant="outline" onClick={onClose} className="mr-2" disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700"
                                        disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
