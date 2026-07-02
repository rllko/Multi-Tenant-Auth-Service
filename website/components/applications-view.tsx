"use client"

import type React from "react"
import {useEffect, useState} from "react"
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
import {Textarea} from "@/components/ui/textarea"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {
    Building,
    Code,
    Copy,
    Edit,
    ExternalLink,
    Eye,
    EyeOff,
    Globe,
    Layers,
    Loader2,
    Lock,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    Settings,
    Shield,
    Trash,
    Users,
    Zap,
} from "lucide-react"
import {Switch} from "@/components/ui/switch"
import {useToast} from "@/hooks/use-toast"
import {EmptyState} from "./empty-state"
import {useTeam} from "@/contexts/team-context"
import {RequireTeam} from "./require-team"
import {Label} from "@/components/ui/label"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Checkbox} from "@/components/ui/checkbox"
import {apiService} from "@/lib/api-service"

// Define application types
type AppType = "web" | "mobile" | "desktop" | "api" | "service" | "other"

// Define application interface
interface Application {
    id: string
    name: string
    description?: string
    type: AppType
    status: "active" | "inactive" | "development" | "archived"
    icon?: string
    url?: string
    clientId?: string
    clientSecret?: string
    redirectUris?: string[]
    createdAt: string
    updatedAt: string
    lastUsed?: string
    teamId: string
    usageStats?: {
        activeUsers?: number
        totalSessions?: number
        apiCalls?: number
    }
    features?: {
        oauth?: boolean
        apiAccess?: boolean
        webhooks?: boolean
        sso?: boolean
    }
    environments?: {
        production?: boolean
        staging?: boolean
        development?: boolean
    }
}

export function ApplicationsView() {
    const [apps, setApps] = useState<Application[]>([])
    const [open, setOpen] = useState(false)
    const [selectedApp, setSelectedApp] = useState<Application | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [secretVisibility, setSecretVisibility] = useState<Record<string, boolean>>({})
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [typeFilter, setTypeFilter] = useState<AppType | "all">("all")
    const [statusFilter, setStatusFilter] = useState<Application["status"] | "all">("all")
    const {toast} = useToast()
    const {selectedTeam} = useTeam()

    // New application form state
    const [newApp, setNewApp] = useState({
        name: "",
        description: "",
        type: "web" as AppType,
        url: "",
        redirectUris: "",
        features: {
            oauth: false,
            apiAccess: false,
            webhooks: false,
            sso: false,
        },
        environments: {
            production: false,
            staging: false,
            development: true,
        },
    })

    // Fetch applications when component mounts or team changes
    useEffect(() => {
        const fetchApps = async () => {
            if (!selectedTeam) return

            try {
                setLoading(true)
                const response = await apiService.apps.getApps(selectedTeam.id)

                if (!Array.isArray(response)) {
                    throw new Error("Invalid response format")
                }

                setApps(response)
                setError(null)
            } catch (err) {
                console.error("Failed to fetch applications:", err)
                setError("Failed to load applications")
            } finally {
                setLoading(false)
            }
        }

        fetchApps()
    }, [selectedTeam])

    const handleEdit = (app: Application) => {
        setSelectedApp(app)
        setNewApp({
            name: app.name,
            description: app.description || "",
            type: app.type,
            url: app.url || "",
            redirectUris: app.redirectUris?.join("\n") || "",
            features: {
                oauth: app.features?.oauth || false,
                apiAccess: app.features?.apiAccess || false,
                webhooks: app.features?.webhooks || false,
                sso: app.features?.sso || false,
            },
            environments: {
                production: app.environments?.production || false,
                staging: app.environments?.staging || false,
                development: app.environments?.development || true,
            },
        })
        setOpen(true)
    }

    const handleCreate = () => {
        setSelectedApp(null)
        setNewApp({
            name: "",
            description: "",
            type: "web",
            url: "",
            redirectUris: "",
            features: {
                oauth: false,
                apiAccess: false,
                webhooks: false,
                sso: false,
            },
            environments: {
                production: false,
                staging: false,
                development: true,
            },
        })
        setOpen(true)
    }

    const handleSave = async () => {
        if (!selectedTeam) return

        try {
            setLoading(true)

            const redirectUrisArray = newApp.redirectUris ? newApp.redirectUris.split("\n").filter((uri) => uri.trim()) : []

            const appData = {
                name: newApp.name,
                description: newApp.description,
                type: newApp.type,
                url: newApp.url,
                redirectUris: redirectUrisArray,
                features: newApp.features,
                environments: newApp.environments,
            }

            if (selectedApp) {
                // Update existing app
                const updatedApp = await apiService.apps.updateApp(selectedTeam.id, selectedApp.id, appData)
                setApps(apps.map((app) => (app.id === selectedApp.id ? updatedApp : app)))

                toast({
                    title: "Application updated",
                    description: `The application "${newApp.name}" has been updated successfully.`,
                })
            } else {
                // Create new app
                const newAppData = await apiService.apps.createApp(selectedTeam.id, appData)
                setApps([newAppData, ...apps])

                toast({
                    title: "Application created",
                    description: `The application "${newApp.name}" has been created successfully.`,
                })
            }
        } catch (err) {
            toast({
                title: "Error",
                description: `Failed to ${selectedApp ? "update" : "create"} application: ${err instanceof Error ? err.message : "Unknown error"}`,
                variant: "destructive",
            })
            console.error(err)
        } finally {
            setLoading(false)
            setOpen(false)
        }
    }

    const handleDelete = async (appId: string) => {
        if (!selectedTeam) return

        if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
            return
        }

        try {
            setLoading(true)
            await apiService.apps.deleteApp(selectedTeam.id, appId)
            setApps(apps.filter((app) => app.id !== appId))

            toast({
                title: "Application deleted",
                description: "The application has been deleted successfully.",
            })
        } catch (err) {
            toast({
                title: "Error",
                description: `Failed to delete application: ${err instanceof Error ? err.message : "Unknown error"}`,
                variant: "destructive",
            })
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (appId: string, currentStatus: Application["status"]) => {
        if (!selectedTeam) return

        try {
            setLoading(true)
            const newStatus = currentStatus === "active" ? "inactive" : "active"

            const updatedApp = await apiService.apps.updateApp(selectedTeam.id, appId, {
                status: newStatus,
            })

            setApps(apps.map((app) => (app.id === appId ? updatedApp : app)))

            toast({
                title: `Application ${newStatus}`,
                description: `The application is now ${newStatus}.`,
            })
        } catch (err) {
            toast({
                title: "Error",
                description: `Failed to update application status: ${err instanceof Error ? err.message : "Unknown error"}`,
                variant: "destructive",
            })
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const regenerateCredentials = async (appId: string) => {
        if (!selectedTeam) return

        if (
            !confirm(
                "Are you sure you want to regenerate credentials? This will invalidate existing credentials and may break integrations.",
            )
        ) {
            return
        }

        try {
            setLoading(true)

            const updatedApp = await apiService.apps.updateApp(selectedTeam.id, appId, {
                regenerateCredentials: true,
            })

            setApps(apps.map((app) => (app.id === appId ? updatedApp : app)))

            toast({
                title: "Credentials regenerated",
                description: "The application credentials have been regenerated successfully.",
            })
        } catch (err) {
            toast({
                title: "Error",
                description: `Failed to regenerate credentials: ${err instanceof Error ? err.message : "Unknown error"}`,
                variant: "destructive",
            })
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const toggleSecretVisibility = (appId: string) => {
        setSecretVisibility((prev) => ({
            ...prev,
            [appId]: !prev[appId],
        }))
    }

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: `${label} copied to clipboard`,
            description: "The value has been copied to your clipboard.",
            duration: 2000,
        })
    }

    // Filter applications based on search query, type, and status
    const filteredApps = apps.filter((app) => {
        const matchesSearch =
            searchQuery === "" ||
            app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (app.clientId && app.clientId.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesType = typeFilter === "all" || app.type === typeFilter
        const matchesStatus = statusFilter === "all" || app.status === statusFilter

        return matchesSearch && matchesType && matchesStatus
    })

    // Get app type icon
    const getAppTypeIcon = (type: AppType) => {
        switch (type) {
            case "web":
                return <Globe className="h-4 w-4"/>
            case "mobile":
                return <Smartphone className="h-4 w-4"/>
            case "desktop":
                return <Monitor className="h-4 w-4"/>
            case "api":
                return <Code className="h-4 w-4"/>
            case "service":
                return <Zap className="h-4 w-4"/>
            default:
                return <Layers className="h-4 w-4"/>
        }
    }

    // Get app status badge
    const getStatusBadge = (status: Application["status"]) => {
        switch (status) {
            case "active":
                return (
                    <Badge variant="outline"
                           className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Active
                    </Badge>
                )
            case "inactive":
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        Inactive
                    </Badge>
                )
            case "development":
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Development
                    </Badge>
                )
            case "archived":
                return (
                    <Badge variant="outline"
                           className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                        Archived
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status || "Unknown"}</Badge>
        }
    }

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return "Never"
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString() + " " + date.toLocaleTimeString()
        } catch (e) {
            return "Invalid date"
        }
    }

    return (
        <RequireTeam>
            <div className="space-y-6">
                {/* Organization Context Banner */}
                {selectedTeam && (
                    <Card className="bg-primary/5 border-primary/10">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <Building className="h-5 w-5 text-primary"/>
                                <div>
                                    <h3 className="font-medium">Team Context</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Managing applications for <span
                                        className="font-medium">{selectedTeam.name}</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Applications</h2>
                    <Button onClick={handleCreate}>
                        <Plus className="mr-2 h-4 w-4"/>
                        New Application
                    </Button>
                </div>

                <Card className="shadow-sm border-border bg-card dark:bg-[#1E1E1E]">
                    <CardHeader className="flex flex-row items-center border-b">
                        <div className="space-y-1.5">
                            <CardTitle>Applications</CardTitle>
                            <CardDescription>Manage your applications and their settings.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 my-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input
                                        type="search"
                                        placeholder="Search applications..."
                                        className="pl-8"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <Select value={typeFilter}
                                            onValueChange={(value) => setTypeFilter(value as AppType | "all")}>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter by type"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="web">Web App</SelectItem>
                                            <SelectItem value="mobile">Mobile App</SelectItem>
                                            <SelectItem value="desktop">Desktop App</SelectItem>
                                            <SelectItem value="api">API</SelectItem>
                                            <SelectItem value="service">Service</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={statusFilter}
                                        onValueChange={(value) => setStatusFilter(value as Application["status"] | "all")}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Filter by status"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="development">Development</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    {filteredApps.length} {filteredApps.length === 1 ? "application" : "applications"} found
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === "grid" ? "secondary" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode("grid")}
                                    >
                                        Grid View
                                    </Button>
                                    <Button
                                        variant={viewMode === "table" ? "secondary" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode("table")}
                                    >
                                        Table View
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {loading && apps.length === 0 ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                <span className="ml-2">Loading applications...</span>
                            </div>
                        ) : error ? (
                            <div
                                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
                                <Shield className="h-5 w-5 mr-2"/>
                                <span>{error}</span>
                            </div>
                        ) : filteredApps.length === 0 ? (
                            <EmptyState
                                title="No applications found"
                                description="Create your first application to get started."
                                icon={<Layers className="h-10 w-10 text-muted-foreground"/>}
                                action={
                                    <Button onClick={handleCreate}>
                                        <Plus className="mr-2 h-4 w-4"/>
                                        New Application
                                    </Button>
                                }
                            />
                        ) : viewMode === "grid" ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredApps.map((app) => (
                                    <Card
                                        key={app.id}
                                        className="overflow-hidden bg-card dark:bg-[#1E1E1E] border-border hover:border-primary/50 transition-colors"
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="p-2 rounded-md bg-primary/10">{getAppTypeIcon(app.type)}</div>
                                                    <CardTitle className="text-lg">{app.name}</CardTitle>
                                                </div>
                                                <Switch
                                                    checked={app.status === "active"}
                                                    onCheckedChange={() => handleToggleStatus(app.id, app.status)}
                                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                {getStatusBadge(app.status)}
                                                <Badge variant="outline" className="capitalize">
                                                    {app.type}
                                                </Badge>
                                            </div>
                                            {app.description &&
                                                <CardDescription className="mt-2">{app.description}</CardDescription>}
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {app.clientId && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs text-muted-foreground">Client
                                                            ID</Label>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => copyToClipboard(app.clientId!, "Client ID")}
                                                        >
                                                            <Copy className="h-3 w-3"/>
                                                        </Button>
                                                    </div>
                                                    <div
                                                        className="font-mono text-xs bg-muted p-2 rounded-md truncate">{app.clientId}</div>
                                                </div>
                                            )}

                                            {app.clientSecret && (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Label className="text-xs text-muted-foreground">Client
                                                            Secret</Label>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => toggleSecretVisibility(app.id)}
                                                            >
                                                                {secretVisibility[app.id] ? (
                                                                    <EyeOff className="h-3 w-3"/>
                                                                ) : (
                                                                    <Eye className="h-3 w-3"/>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6"
                                                                onClick={() => copyToClipboard(app.clientSecret!, "Client Secret")}
                                                            >
                                                                <Copy className="h-3 w-3"/>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <div className="font-mono text-xs bg-muted p-2 rounded-md truncate">
                                                        {secretVisibility[app.id] ? app.clientSecret : "••••••••••••••••••••••••"}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-xs text-muted-foreground">Features</Label>
                                                    <div className="flex flex-wrap gap-1">
                                                        {app.features?.oauth && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <Lock className="h-3 w-3 mr-1"/>
                                                                OAuth
                                                            </Badge>
                                                        )}
                                                        {app.features?.apiAccess && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <Code className="h-3 w-3 mr-1"/>
                                                                API
                                                            </Badge>
                                                        )}
                                                        {app.features?.webhooks && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <Zap className="h-3 w-3 mr-1"/>
                                                                Webhooks
                                                            </Badge>
                                                        )}
                                                        {app.features?.sso && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <Users className="h-3 w-3 mr-1"/>
                                                                SSO
                                                            </Badge>
                                                        )}
                                                        {!app.features?.oauth &&
                                                            !app.features?.apiAccess &&
                                                            !app.features?.webhooks &&
                                                            !app.features?.sso &&
                                                            <span className="text-xs text-muted-foreground">None</span>}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label
                                                        className="text-xs text-muted-foreground">Environments</Label>
                                                    <div className="flex flex-wrap gap-1">
                                                        {app.environments?.production && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                            >
                                                                Production
                                                            </Badge>
                                                        )}
                                                        {app.environments?.staging && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                                            >
                                                                Staging
                                                            </Badge>
                                                        )}
                                                        {app.environments?.development && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                                                            >
                                                                Development
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                                <div>
                                                    <div className="font-medium">Created</div>
                                                    <div>{formatDate(app.createdAt)}</div>
                                                </div>
                                                <div>
                                                    <div className="font-medium">Last Used</div>
                                                    <div>{formatDate(app.lastUsed)}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <div className="p-4 border-t flex justify-between">
                                            {app.url && (
                                                <Button variant="outline" size="sm" asChild>
                                                    <a href={app.url} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="mr-2 h-3.5 w-3.5"/>
                                                        Visit
                                                    </a>
                                                </Button>
                                            )}
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(app)}>
                                                    <Settings className="mr-2 h-3.5 w-3.5"/>
                                                    Settings
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4"/>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEdit(app)}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit Application
                                                        </DropdownMenuItem>
                                                        {app.clientId && app.clientSecret && (
                                                            <DropdownMenuItem
                                                                onClick={() => regenerateCredentials(app.id)}>
                                                                <RefreshCw className="mr-2 h-4 w-4"/>
                                                                Regenerate Credentials
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator/>
                                                        <DropdownMenuItem className="text-red-600"
                                                                          onClick={() => handleDelete(app.id)}>
                                                            <Trash className="mr-2 h-4 w-4"/>
                                                            Delete Application
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Features</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Last Used</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApps.map((app) => (
                                        <TableRow key={app.id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="p-1.5 rounded-md bg-primary/10">{getAppTypeIcon(app.type)}</div>
                                                    <div>
                                                        <div className="font-medium">{app.name}</div>
                                                        {app.description && (
                                                            <div
                                                                className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                                {app.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {app.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {app.features?.oauth && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            OAuth
                                                        </Badge>
                                                    )}
                                                    {app.features?.apiAccess && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            API
                                                        </Badge>
                                                    )}
                                                    {app.features?.webhooks && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Webhooks
                                                        </Badge>
                                                    )}
                                                    {app.features?.sso && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            SSO
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className="text-sm text-muted-foreground">{formatDate(app.createdAt)}</TableCell>
                                            <TableCell
                                                className="text-sm text-muted-foreground">{formatDate(app.lastUsed)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end items-center gap-2">
                                                    <Switch
                                                        checked={app.status === "active"}
                                                        onCheckedChange={() => handleToggleStatus(app.id, app.status)}
                                                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                    />
                                                    <Button variant="outline" size="sm" onClick={() => handleEdit(app)}>
                                                        <Settings className="mr-2 h-3.5 w-3.5"/>
                                                        Settings
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4"/>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleEdit(app)}>
                                                                <Edit className="mr-2 h-4 w-4"/>
                                                                Edit Application
                                                            </DropdownMenuItem>
                                                            {app.clientId && app.clientSecret && (
                                                                <DropdownMenuItem
                                                                    onClick={() => regenerateCredentials(app.id)}>
                                                                    <RefreshCw className="mr-2 h-4 w-4"/>
                                                                    Regenerate Credentials
                                                                </DropdownMenuItem>
                                                            )}
                                                            {app.url && (
                                                                <DropdownMenuItem asChild>
                                                                    <a href={app.url} target="_blank"
                                                                       rel="noopener noreferrer">
                                                                        <ExternalLink className="mr-2 h-4 w-4"/>
                                                                        Visit Application
                                                                    </a>
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuSeparator/>
                                                            <DropdownMenuItem className="text-red-600"
                                                                              onClick={() => handleDelete(app.id)}>
                                                                <Trash className="mr-2 h-4 w-4"/>
                                                                Delete Application
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Create/Edit Application Dialog */}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{selectedApp ? "Edit Application" : "Create New Application"}</DialogTitle>
                            <DialogDescription>
                                {selectedApp ? "Update your application details." : "Configure a new application for your team."}
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="features">Features</TabsTrigger>
                                <TabsTrigger value="environments">Environments</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4 py-4">
                                <div className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Application Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={newApp.name}
                                            onChange={(e) => setNewApp({...newApp, name: e.target.value})}
                                            placeholder="My Application"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            value={newApp.description}
                                            onChange={(e) => setNewApp({...newApp, description: e.target.value})}
                                            placeholder="A brief description of your application"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="type">Application Type</Label>
                                        <Select
                                            value={newApp.type}
                                            onValueChange={(value) => setNewApp({...newApp, type: value as AppType})}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select application type"/>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="web">Web Application</SelectItem>
                                                <SelectItem value="mobile">Mobile Application</SelectItem>
                                                <SelectItem value="desktop">Desktop Application</SelectItem>
                                                <SelectItem value="api">API</SelectItem>
                                                <SelectItem value="service">Service</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="url">Application URL</Label>
                                        <Input
                                            id="url"
                                            name="url"
                                            value={newApp.url}
                                            onChange={(e) => setNewApp({...newApp, url: e.target.value})}
                                            placeholder="https://example.com"
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            The main URL where your application is hosted (optional)
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="redirectUris">Redirect URIs (one per line)</Label>
                                        <Textarea
                                            id="redirectUris"
                                            name="redirectUris"
                                            value={newApp.redirectUris}
                                            onChange={(e) => setNewApp({...newApp, redirectUris: e.target.value})}
                                            placeholder="https://example.com/callback"
                                            rows={3}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Where to redirect users after authorization (required for OAuth
                                            applications)
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="features" className="space-y-4 py-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Application Features</Label>
                                        <p className="text-sm text-muted-foreground">Select the features your
                                            application will use</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="oauth"
                                                checked={newApp.features.oauth}
                                                onCheckedChange={(checked) =>
                                                    setNewApp({
                                                        ...newApp,
                                                        features: {...newApp.features, oauth: checked === true},
                                                    })
                                                }
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label htmlFor="oauth" className="text-sm font-medium leading-none">
                                                    OAuth Authentication
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable OAuth 2.0 authentication for your application
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="apiAccess"
                                                checked={newApp.features.apiAccess}
                                                onCheckedChange={(checked) =>
                                                    setNewApp({
                                                        ...newApp,
                                                        features: {...newApp.features, apiAccess: checked === true},
                                                    })
                                                }
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label htmlFor="apiAccess" className="text-sm font-medium leading-none">
                                                    API Access
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Allow this application to access your team's APIs
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="webhooks"
                                                checked={newApp.features.webhooks}
                                                onCheckedChange={(checked) =>
                                                    setNewApp({
                                                        ...newApp,
                                                        features: {...newApp.features, webhooks: checked === true},
                                                    })
                                                }
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label htmlFor="webhooks" className="text-sm font-medium leading-none">
                                                    Webhooks
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Enable webhook notifications for this application
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="sso"
                                                checked={newApp.features.sso}
                                                onCheckedChange={(checked) =>
                                                    setNewApp({
                                                        ...newApp,
                                                        features: {...newApp.features, sso: checked === true},
                                                    })
                                                }
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label htmlFor="sso" className="text-sm font-medium leading-none">
                                                    Single Sign-On (SSO)
                                                </Label>
                                                <p className="text-sm text-muted-foreground">Enable SSO capabilities for
                                                    this application</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="environments" className="space-y-4 py-4">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label>Application Environments</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Select the environments where this application will be deployed
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="production"
                                                checked={newApp.environments.production}
                                                onCheckedChange={(checked) =>
                                                    setNewApp({
                                                        ...newApp,
                                                        environments: {
                                                            ...newApp.environments,
                                                            production: checked === true
                                                        },
                                                    })
                                                }
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label htmlFor="production"
                                                       className="text-sm font-medium leading-none">
                                                    Production
                                                </Label>
                                                <p className="text-sm text-muted-foreground">This application is used in
                                                    production</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="staging"
                                                checked={newApp.environments.staging}
                                                onCheckedChange={(checked) =>
                                                    setNewApp({
                                                        ...newApp,
                                                        environments: {
                                                            ...newApp.environments,
                                                            staging: checked === true
                                                        },
                                                    })
                                                }
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label htmlFor="staging" className="text-sm font-medium leading-none">
                                                    Staging
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    This application is used in staging/testing environments
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="development"
                                                checked={newApp.environments.development}
                                                onCheckedChange={(checked) =>
                                                    setNewApp({
                                                        ...newApp,
                                                        environments: {
                                                            ...newApp.environments,
                                                            development: checked === true
                                                        },
                                                    })
                                                }
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label htmlFor="development"
                                                       className="text-sm font-medium leading-none">
                                                    Development
                                                </Label>
                                                <p className="text-sm text-muted-foreground">This application is used
                                                    for development</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={!newApp.name}>
                                {selectedApp ? "Update Application" : "Create Application"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </RequireTeam>
    )
}

// Import missing icons
function Smartphone(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
            <path d="M12 18h.01"/>
        </svg>
    )
}

function Monitor(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="3" rx="2"/>
            <line x1="8" x2="16" y1="21" y2="21"/>
            <line x1="12" x2="12" y1="17" y2="21"/>
        </svg>
    )
}
