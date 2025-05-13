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
import {Info, Loader2} from "lucide-react"
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip"
import {ScrollArea} from "@/components/ui/scroll-area"
import {useToast} from "@/hooks/use-toast"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {permissionsApi, rolesApi} from "@/lib/api-service";
import {Permission} from "@/lib/schemas";

interface RolePermissionsModalProps {
    isOpen: boolean
    onClose: () => void
    role: any | null
    teamId: string
    onPermissionsUpdated: () => void
}

export function RolePermissionsModal({
                                         isOpen,
                                         onClose,
                                         role,
                                         teamId,
                                         onPermissionsUpdated,
                                     }: RolePermissionsModalProps) {
    const [permissions, setPermissions] = useState<Permission[] | null>([])
    const [categories, setCategories] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTab, setSelectedTab] = useState("categories")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const {toast} = useToast()

    useEffect(() => {
        if (!isOpen || !role) return

        setIsLoading(true)

        if (role.scopes) {
            console.log(role)
            setSelectedPermissions(role.scopes)
        } else {
            setSelectedPermissions([])
        }

        if (!teamId) {
            throw new Error("teamId must be provided")
        }

        const perms = async () => {
            try {
                const data = await permissionsApi.getPermissions(teamId)

                setPermissions(data)

                const uniqueResources = [...new Set(data.map((p) => p.resource || "other"))]
                const categoriesData = uniqueResources.map((resource) => ({
                    id: resource,
                    name: resource.charAt(0).toUpperCase() + resource.slice(1),
                    description: `${resource.charAt(0).toUpperCase() + resource.slice(1)} related permissions`,
                    count: data.filter((p) => p.resource === resource).length,
                }))
                setCategories(categoriesData)
            } catch {
            } finally {
                setIsLoading(false)
            }
        }
        perms()
    }, [isOpen, role, teamId])

    const handlePermissionToggle = async (permissionId: string) => {
        const isAlreadySelected = selectedPermissions.includes(permissionId)

        if (!isAlreadySelected && !permissions?.some((p) => p.id === permissionId)) {
            try {
                const permissionDetails: Permission = await permissionsApi.getPermission(teamId, permissionId)

                if (permissionDetails) {
                    setPermissions((prev) => [...(prev || []), permissionDetails])

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
                            prev.map((c) => (c.id === permissionDetails.resource ? {...c, count: c.count + 1} : c))
                        )
                    }
                }
            } catch {
                toast({title: "Error", description: "Failed to fetch permission details.", variant: "destructive"})
            }
        }

        setSelectedPermissions((prev) =>
            isAlreadySelected ? prev.filter((id) => id !== permissionId) : [...prev, permissionId]
        )
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            await rolesApi.updateRole(teamId, role.roleId, {scopes: selectedPermissions})
            toast({title: "Success", description: "Permissions updated successfully."})
            onPermissionsUpdated()
            onClose()
        } catch {
            toast({title: "Error", description: "Failed to update permissions.", variant: "destructive"})
        } finally {
            setIsSaving(false)
        }
    }

    const filteredPermissions = permissions?.filter(
        (p) => !selectedCategory || p.resource === selectedCategory
    ).filter(
        (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Edit Role Permissions</DialogTitle>
                    <DialogDescription>
                        Manage the permissions assigned to this role.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="categories">By Category</TabsTrigger>
                        <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    </TabsList>

                    <TabsContent value="categories" className="mt-4">
                        <div className="flex gap-4">
                            <div className="w-1/4 max-h-[400px] border rounded-md flex flex-col">
                                <Input
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="m-2"
                                />
                                <ScrollArea className="flex-1">
                                    <div className="p-2 space-y-2">
                                        {categories.map((category) => (
                                            <Card
                                                key={category.id}
                                                className={`cursor-pointer ${selectedCategory === category.id ? "border-blue-600" : ""}`}
                                                onClick={() => setSelectedCategory(category.id)}
                                            >
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-base">{category.name}</CardTitle>
                                                    <CardDescription
                                                        className="text-xs">{category.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <Badge variant="secondary">{category.count} perms</Badge>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            <ScrollArea className="flex-1 max-h-[400px] border rounded-md">
                                <div className="p-4 space-y-2">
                                    {filteredPermissions.map((permission) => (
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
                                                    <Label htmlFor={permission.id}
                                                           className="text-sm font-medium leading-none cursor-pointer">
                                                        {permission.name}
                                                    </Label>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Info className="h-3.5 w-3.5 text-muted-foreground"/>
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
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    </TabsContent>

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

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <div className="text-sm text-muted-foreground">
                        {selectedPermissions.length} permissions selected
                    </div>
                    <div>
                        <Button variant="outline" onClick={onClose} className="mr-2" disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
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
            </DialogContent>
        </Dialog>
    )
}
