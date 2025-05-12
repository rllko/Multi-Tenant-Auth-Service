"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {AlertTriangle, Info, Loader2, MoreHorizontal, Plus, RefreshCw, Search} from 'lucide-react'
import {Badge} from "@/components/ui/badge"

import {DropdownMenu, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {useToast} from "@/hooks/use-toast"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {permissionsApi} from "@/lib/api-service";

const DEFAULT_PERMISSIONS = [
    {
        id: "user.read",
        name: "View Users",
        description: "Can view user profiles",
        resource: "user",
        action: "read",
        impact: "low",
        createdBy: null,
    },
    {
        id: "user.write",
        name: "Edit Users",
        description: "Can edit user profiles",
        resource: "user",
        action: "write",
        impact: "medium",
        createdBy: null,
    },
    {
        id: "license.read",
        name: "View Licenses",
        description: "Can view license details",
        resource: "license",
        action: "read",
        impact: "low",
        createdBy: null,
    },
    {
        id: "license.write",
        name: "Manage Licenses",
        description: "Can create and modify licenses",
        resource: "license",
        action: "write",
        impact: "medium",
        createdBy: null,
    },
    {
        id: "app.read",
        name: "View Applications",
        description: "Can view application details",
        resource: "app",
        action: "read",
        impact: "low",
        createdBy: null,
    },
    {
        id: "app.write",
        name: "Manage Applications",
        description: "Can create and modify applications",
        resource: "app",
        action: "write",
        impact: "medium",
        createdBy: null,
    },
    {
        id: "team.read",
        name: "View Team",
        description: "Can view team details",
        resource: "team",
        action: "read",
        impact: "low",
        createdBy: null,
    },
    {
        id: "team.write",
        name: "Manage Team",
        description: "Can modify team settings",
        resource: "team",
        action: "write",
        impact: "medium",
        createdBy: null,
    },
    {
        id: "analytics.read",
        name: "View Analytics",
        description: "Can view analytics data",
        resource: "analytics",
        action: "read",
        impact: "low",
        createdBy: null,
    },
    {
        id: "analytics.export",
        name: "Export Analytics",
        description: "Can export analytics data",
        resource: "analytics",
        action: "export",
        impact: "medium",
        createdBy: null,
    },
]


interface PermissionsManagementProps {
    teamId: string
    onRefresh?: () => void
    isRefreshing?: boolean
}

export function PermissionsManagement({teamId, onRefresh, isRefreshing = false}: PermissionsManagementProps) {
    const [permissions, setPermissions] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTab, setSelectedTab] = useState("categories")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const {toast} = useToast()

    const fetchPermissionsAndCategories = async () => {
        if (!teamId) return

        try {
            setIsLoading(true)
            setError(null)

            const data = await permissionsApi.getPermissions(teamId);

            if (Array.isArray(data) && data.length === 0) {
                setPermissions(DEFAULT_PERMISSIONS)

                const uniqueResources = [...new Set(DEFAULT_PERMISSIONS.map((p) => p.resource || "other"))]
                const categoriesData = uniqueResources.map((resource) => ({
                    id: resource,
                    name: resource.charAt(0).toUpperCase() + resource.slice(1),
                    description: `${resource.charAt(0).toUpperCase() + resource.slice(1)} related permissions`,
                    count: DEFAULT_PERMISSIONS.filter((p) => p.resource === resource).length,
                }))

                setCategories(categoriesData)

                if (!selectedCategory && categoriesData.length > 0) {
                    setSelectedCategory(categoriesData[0].id)
                }
            } else {
                setPermissions(data)

                const uniqueResources = [...new Set(data.map((p) => p.resource || "other"))]
                const categoriesData = uniqueResources.map((resource) => ({
                    id: resource,
                    name: resource.charAt(0).toUpperCase() + resource.slice(1),
                    description: `${resource.charAt(0).toUpperCase() + resource.slice(1)} related permissions`,
                    count: data.filter((p) => p.resource === resource).length,
                }))

                setCategories(categoriesData)

                if (!selectedCategory && categoriesData.length > 0) {
                    setSelectedCategory(categoriesData[0].id)
                }
            }
        } catch (err) {
            console.error("Error fetching permissions:", err)
            setPermissions(DEFAULT_PERMISSIONS)

            const uniqueResources = [...new Set(DEFAULT_PERMISSIONS.map((p) => p.resource || "other"))]
            const categoriesData = uniqueResources.map((resource) => ({
                id: resource,
                name: resource.charAt(0).toUpperCase() + resource.slice(1),
                description: `${resource.charAt(0).toUpperCase() + resource.slice(1)} related permissions`,
                count: DEFAULT_PERMISSIONS.filter((p) => p.resource === resource).length,
            }))

            setCategories(categoriesData)

            if (!selectedCategory && categoriesData.length > 0) {
                setSelectedCategory(categoriesData[0].id)
            }

            setError("Failed to load permissions. Using default values.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPermissionsAndCategories()
    }, [teamId])

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


    const getImpactColor = (impact: string) => {
        const colors = {
            critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
            high: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
            medium: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        }
        return colors[impact?.toLowerCase()] || colors.medium
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col space-y-4 md:flex-row md:items-end md:justify-between md:space-y-0">
                <div className="flex-1 space-y-2 md:max-w-md">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input
                            type="search"
                            placeholder="Search permissions..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4"/>
                    Create Permission
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-2"/>
                    <span>Loading permissions...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center p-8 text-destructive">
                    <AlertTriangle className="h-8 w-8 mb-2"/>
                    <p>{error}</p>
                    <Button variant="outline" onClick={fetchPermissionsAndCategories} className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2"/>
                        Retry
                    </Button>
                </div>
            ) : (
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="categories">By Category</TabsTrigger>
                        <TabsTrigger value="all">All Permissions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="categories" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                    <CardContent>
                                        <Badge variant="secondary">{category.count} permissions</Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {selectedCategory && (
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium">
                                        {categories.find((c) => c.id === selectedCategory)?.name} Permissions
                                    </h3>
                                </div>

                                <ScrollArea className="h-[400px] rounded-md border">
                                    <div className="p-4 space-y-4">
                                        {filteredPermissions.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                {searchQuery ? "No permissions found matching your search." : "No permissions available."}
                                            </div>
                                        ) : (
                                            filteredPermissions.map((permission) => (
                                                <div
                                                    key={permission.id}
                                                    className={`flex items-start justify-between p-3 rounded-lg border hover:bg-muted/50 ${
                                                        permission.createdBy === null ? "border-blue-200 bg-blue-50/30 dark:bg-blue-950/30" : ""
                                                    }`}
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium">{permission.name}</h4>
                                                            {permission.createdBy === null && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200"
                                                                >
                                                                    System
                                                                </Badge>
                                                            )}
                                                            <Badge className={getImpactColor(permission.impact)}>
                                                                {permission.impact?.charAt(0).toUpperCase() + permission.impact?.slice(1)}
                                                            </Badge>
                                                            <TooltipProvider>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Info
                                                                            className="h-4 w-4 text-muted-foreground"/>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p className="max-w-xs">{permission.description}</p>
                                                                        {permission.createdBy === null && (
                                                                            <p className="max-w-xs mt-2 text-blue-600">
                                                                                This is a system-defined permission and
                                                                                cannot be modified.
                                                                            </p>
                                                                        )}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </TooltipProvider>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline">{permission.resource}</Badge>
                                                            <Badge variant="secondary">{permission.action}</Badge>
                                                        </div>
                                                    </div>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4"/>
                                                                <span className="sr-only">Open menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                    </DropdownMenu>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="all">
                        <div className="border rounded-md">
                            <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                                <div className="col-span-3">Permission</div>
                                <div className="col-span-4">Description</div>
                                <div className="col-span-2">Resource</div>
                                <div className="col-span-1">Action</div>
                                <div className="col-span-1">Impact</div>
                                <div className="col-span-1"></div>
                            </div>

                            {filteredPermissions.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    {searchQuery ? "No permissions found matching your search." : "No permissions available."}
                                </div>
                            ) : (
                                filteredPermissions.map((permission) => (
                                    <div
                                        key={permission.id}
                                        className={`grid grid-cols-12 gap-4 p-4 border-b last:border-0 items-center ${
                                            permission.createdBy === null ? "bg-blue-50/30 dark:bg-blue-950/30" : ""
                                        }`}
                                    >
                                        <div className="col-span-3 font-medium">
                                            <div className="flex items-center gap-2">
                                                {permission.name}
                                                {permission.createdBy === null && (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200"
                                                    >
                                                        System
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div
                                            className="col-span-4 text-sm text-muted-foreground">{permission.description}</div>
                                        <div className="col-span-2">
                                            <Badge variant="outline">{permission.resource}</Badge>
                                        </div>
                                        <div className="col-span-1">
                                            <Badge variant="secondary">{permission.action}</Badge>
                                        </div>
                                        <div className="col-span-1">
                                            <Badge className={getImpactColor(permission.impact)}>
                                                {permission.impact?.charAt(0).toUpperCase() + permission.impact?.slice(1)}
                                            </Badge>
                                        </div>
                                        <div className="col-span-1 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4"/>
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    )
}
