"use client"

import {useEffect, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group"
import {Loader2, Plus, RefreshCw, Shield} from 'lucide-react'
import {useToast} from "@/hooks/use-toast"
import {useTeam} from "@/contexts/team-context"
import {EmptyState} from "./empty-state"
import {appsApi} from "@/lib/api-service"

// Define types
type ScopeImpactLevel = "Low Impact" | "Medium Impact" | "High Impact"

interface Scope {
    id: string
    name: string
    description: string
    category: string
    impact: ScopeImpactLevel
    permissions: string[]
}

// Mock scope categories - replace with actual data
const scopeCategories = [
    {id: "user", name: "User Management"},
    {id: "license", name: "License Management"},
    {id: "app", name: "Application Management"},
    {id: "system", name: "System"}
]

export function PermissionsTab({appId}: { appId: string }) {
    const [scopes, setScopes] = useState<Scope[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [scopesDialogOpen, setScopesDialogOpen] = useState(false)
    const [selectedScopes, setSelectedScopes] = useState<Scope[]>([])
    const [isCreatingScope, setIsCreatingScope] = useState(false)
    const [newScopeDialogOpen, setNewScopeDialogOpen] = useState(false)
    const {toast} = useToast()
    const {selectedTeam} = useTeam()

    // New scope state
    const [newScope, setNewScope] = useState<Partial<Scope>>({
        id: "",
        name: "",
        description: "",
        category: scopeCategories[0].id,
        impact: "Low Impact" as ScopeImpactLevel,
        permissions: [],
    })

    useEffect(() => {
        fetchScopes()
    }, [appId, selectedTeam])

    const fetchScopes = async () => {
        if (!selectedTeam || !appId) return

        try {
            setLoading(true)

            const data = await appsApi.getAppPermissions(selectedTeam.id, appId)

            setScopes(data)
            setSelectedScopes(data)
            setError(null)
        } catch (err) {
            console.error("Failed to fetch scopes:", err)
            setError("Failed to load scopes")
        } finally {
            setLoading(false)
        }
    }

    const handleCreateScope = async () => {
        if (!newScope.id || !newScope.name) {
            toast({
                title: "Missing required fields",
                description: "Please provide an ID and name for the scope",
                variant: "destructive",
            })
            return
        }

        try {
            setIsCreatingScope(true)

            // API call to create scope
            await appsApi.createAppPermission(selectedTeam.id, appId, newScope as Scope)

            // Refresh scopes
            await fetchScopes()

            // Reset form and close dialog
            setNewScope({
                id: "",
                name: "",
                description: "",
                category: scopeCategories[0].id,
                impact: "low",
                permissions: [],
            })
            setNewScopeDialogOpen(false)

            toast({
                title: "Scope created",
                description: "The new scope has been created successfully",
            })
        } catch (err) {
            console.error("Failed to create scope:", err)
            toast({
                title: "Failed to create scope",
                description: "An error occurred while creating the scope",
                variant: "destructive",
            })
        } finally {
            setIsCreatingScope(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target
        setNewScope((prev) => ({...prev, [name]: value}))
    }

    const handleSelectChange = (name: string, value: string) => {
        setNewScope((prev) => ({...prev, [name]: value}))
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Application Permissions</CardTitle>
                        <CardDescription>Manage the permissions for this application</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchScopes}>
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Refresh
                        </Button>
                        <Button size="sm" onClick={() => setNewScopeDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4"/>
                            Add Scope
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            <span className="ml-2">Loading permissions...</span>
                        </div>
                    ) : error ? (
                        <div
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
                            <Shield className="h-5 w-5 mr-2"/>
                            <span>{error}</span>
                        </div>
                    ) : scopes.length === 0 ? (
                        <EmptyState
                            title="No permissions assigned"
                            description="This application doesn't have any permissions assigned yet."
                            icon={<Shield className="h-10 w-10 text-muted-foreground"/>}
                            action={
                                <Button onClick={() => setNewScopeDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4"/>
                                    Add Permissions
                                </Button>
                            }
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {scopes.map((scope) => (
                                    <Badge key={scope.id} variant="secondary">
                                        {scope.id}
                                    </Badge>
                                ))}
                            </div>

                            <div className="bg-muted/50 p-4 rounded-md">
                                <div className="flex items-center mb-2">
                                    <Shield className="h-5 w-5 mr-2 text-primary"/>
                                    <h3 className="font-medium">Permission Details</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    These permissions define what actions this application can perform on behalf of
                                    users. Each permission
                                    grants access to specific API endpoints and functionality.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create New Scope Dialog */}
            <Dialog open={newScopeDialogOpen} onOpenChange={setNewScopeDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Create New Scope</DialogTitle>
                        <DialogDescription>
                            Add a new permission scope to this application. Scopes define what actions the application
                            can perform.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="id">Scope ID</Label>
                                <Input
                                    id="id"
                                    name="id"
                                    placeholder="read:users"
                                    value={newScope.id}
                                    onChange={handleInputChange}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Unique identifier for this scope (e.g., read:users)
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Read User Data"
                                    value={newScope.name}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Allows reading user profile information"
                                value={newScope.description}
                                onChange={handleInputChange}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={newScope.category}
                                    onValueChange={(value) => handleSelectChange("category", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category"/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {scopeCategories.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Impact Level</Label>
                                <RadioGroup
                                    value={newScope.impact}
                                    onValueChange={(value) => handleSelectChange("impact", value)}
                                    className="flex space-x-2"
                                >
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="low" id="impact-low"/>
                                        <Label htmlFor="impact-low" className="text-sm font-normal">
                                            Low
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="medium" id="impact-medium"/>
                                        <Label htmlFor="impact-medium" className="text-sm font-normal">
                                            Medium
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <RadioGroupItem value="high" id="impact-high"/>
                                        <Label htmlFor="impact-high" className="text-sm font-normal">
                                            High
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewScopeDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateScope} disabled={isCreatingScope}>
                            {isCreatingScope ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Creating...
                                </>
                            ) : (
                                "Create Scope"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}