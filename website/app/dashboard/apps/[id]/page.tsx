"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Switch} from "@/components/ui/switch"
import {Separator} from "@/components/ui/separator"
import {AlertTriangle, CopyrightIcon as License, Edit, Key, Loader2, Save, Settings, Shield, Users,} from "lucide-react"
import {OAuthClientsTab} from "@/components/oauth-clients-tab"
import {PermissionsTab} from "@/components/permissions-tab"
import {SessionsTab} from "@/components/sessions-tab"
import {LicensesTab} from "@/components/licenses-tab"
import {useTeam} from "@/contexts/team-context"
import {apiService} from "@/lib/api-service"
import {useToast} from "@/hooks/use-toast"

export default function AppDetailPage() {
    const params = useParams()
    const router = useRouter()
    const appId = params.id as string
    const {selectedTeam} = useTeam()
    const {toast} = useToast()

    const [isEditing, setIsEditing] = useState(false)
    const [app, setApp] = useState(null)
    const [editedApp, setEditedApp] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalSessions: 0,
        activeSessions: 0,
        totalClients: 0,
        activeClients: 0,
        totalLicenses: 0,
        activeLicenses: 0,
    })

    useEffect(() => {
        const fetchAppDetails = async () => {
            if (!selectedTeam || !appId) return

            try {
                setLoading(true)
                const appData = await apiService.apps.getApp(selectedTeam.id, appId)
                setApp(appData)
                setEditedApp(appData)

                // Fetch stats if available
                try {
                    const statsData = await apiService.analytics.getStats(selectedTeam.id, appId)
                    if (statsData) {
                        setStats({
                            totalUsers: statsData.totalUsers || 0,
                            activeUsers: statsData.activeUsers || 0,
                            totalSessions: statsData.totalSessions || 0,
                            activeSessions: statsData.activeSessions || 0,
                            totalClients: statsData.clients?.total || 0,
                            activeClients: statsData.clients?.active || 0,
                            totalLicenses: statsData.totalLicenses || 0,
                            activeLicenses: statsData.activeLicenses || 0,
                        })
                    }
                } catch (statsError) {
                    console.error("Failed to fetch app stats:", statsError)
                    // Continue without stats
                }

                setError(null)
            } catch (err) {
                console.error("Failed to fetch app details:", err)
                setError("Failed to load application details")
            } finally {
                setLoading(false)
            }
        }

        fetchAppDetails()
    }, [selectedTeam, appId])

    const handleInputChange = (e) => {
        const {name, value} = e.target
        setEditedApp((prev) => ({...prev, [name]: value}))
    }

    const handleSave = async () => {
        if (!selectedTeam || !appId || !editedApp) return

        try {
            setLoading(true)
            await apiService.apps.updateApp(selectedTeam.id, appId, editedApp)
            setApp(editedApp)
            setIsEditing(false)
            toast({
                title: "Success",
                description: "Application updated successfully",
            })
        } catch (err) {
            console.error("Failed to update app:", err)
            toast({
                title: "Error",
                description: "Failed to update application",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setEditedApp(app)
        setIsEditing(false)
    }

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "active":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            case "maintenance":
                return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
            case "development":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            case "inactive":
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
        }
    }

    if (loading && !app) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <span className="ml-2">Loading application details...</span>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2"/>
                <span>{error}</span>
            </div>
        )
    }

    if (!app) {
        return (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2"/>
                <span>Application not found</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">App Details: {app.name}</h1>
                    <p className="text-muted-foreground">Manage your application settings and permissions</p>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel} disabled={loading}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={loading}>
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> :
                                    <Save className="mr-2 h-4 w-4"/>}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)} disabled={loading}>
                            <Edit className="mr-2 h-4 w-4"/>
                            Edit App
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid grid-cols-5 w-full md:w-auto">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="licenses">Licenses</TabsTrigger>
                    <TabsTrigger value="oauth-clients">M2M Clients</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="sessions">Sessions</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* App Info Card */}
                        <Card className="md:col-span-2 bg-card dark:bg-[#1E1E1E]">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">{app.icon || "🔐"}</div>
                                        <div>
                                            <CardTitle>Application Information</CardTitle>
                                            <CardDescription>Basic details about this application</CardDescription>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={getStatusColor(app.status)}>
                                        {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : "Unknown"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Application Name</Label>
                                            <Input id="name" name="name" value={editedApp.name}
                                                   onChange={handleInputChange}/>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={editedApp.description || ""}
                                                onChange={handleInputChange}
                                                rows={3}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="type">Application Type</Label>
                                            <select
                                                id="type"
                                                name="type"
                                                value={editedApp.type || "web"}
                                                onChange={handleInputChange}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="web">Web Application</option>
                                                <option value="mobile">Mobile App</option>
                                                <option value="desktop">Desktop App</option>
                                                <option value="service">Service/API</option>
                                                <option value="m2m">Machine-to-Machine</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="status"
                                                checked={editedApp.status === "active"}
                                                onCheckedChange={(checked) =>
                                                    setEditedApp((prev) => ({
                                                        ...prev,
                                                        status: checked ? "active" : "inactive",
                                                    }))
                                                }
                                                className="data-[state=checked]:bg-[#8A63F9]"
                                            />
                                            <Label htmlFor="status">Active</Label>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                                                <p className="text-base">{app.name}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                                                <p className="text-base capitalize">{app.type || "Not specified"}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground">Client ID</h3>
                                                <p className="text-base font-mono text-xs">{app.clientId || "Not available"}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                                                <p className="text-base">
                                                    {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "Unknown"}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                                            <p className="text-base">{app.description || "No description provided"}</p>
                                        </div>

                                        {app.redirectUris && app.redirectUris.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-medium text-muted-foreground">Redirect
                                                    URIs</h3>
                                                <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                                                    {app.redirectUris.map((uri, index) => (
                                                        <li key={index} className="text-base font-mono">
                                                            {uri}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Stats Card */}
                        <Card className="bg-card dark:bg-[#1E1E1E]">
                            <CardHeader>
                                <CardTitle>Application Stats</CardTitle>
                                <CardDescription>Usage statistics for this application</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Users</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold">{stats.totalUsers}</span>
                                            <span className="text-xs text-muted-foreground">Total</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold">{stats.activeUsers}</span>
                                            <span className="text-xs text-muted-foreground">Active</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator/>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Licenses</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold">{stats.totalLicenses}</span>
                                            <span className="text-xs text-muted-foreground">Total</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold">{stats.activeLicenses}</span>
                                            <span className="text-xs text-muted-foreground">Active</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator/>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">Sessions</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold">{stats.totalSessions}</span>
                                            <span className="text-xs text-muted-foreground">Total</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold">{stats.activeSessions}</span>
                                            <span className="text-xs text-muted-foreground">Active</span>
                                        </div>
                                    </div>
                                </div>

                                <Separator/>

                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-muted-foreground">M2M Clients</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold">{stats.totalClients}</span>
                                            <span className="text-xs text-muted-foreground">Total</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-2xl font-bold">{stats.activeClients}</span>
                                            <span className="text-xs text-muted-foreground">Active</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Actions */}
                    <Card className="bg-card dark:bg-[#1E1E1E]">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>Common tasks for this application</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <Button variant="outline"
                                        className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                                    <License className="h-5 w-5"/>
                                    <span>Create License</span>
                                </Button>
                                <Button variant="outline"
                                        className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                                    <Key className="h-5 w-5"/>
                                    <span>Create M2M Client</span>
                                </Button>
                                <Button variant="outline"
                                        className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                                    <Shield className="h-5 w-5"/>
                                    <span>Manage Permissions</span>
                                </Button>
                                <Button variant="outline"
                                        className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                                    <Users className="h-5 w-5"/>
                                    <span>View Active Sessions</span>
                                </Button>
                                <Button variant="outline"
                                        className="h-auto py-4 flex flex-col items-center justify-center gap-2">
                                    <Settings className="h-5 w-5"/>
                                    <span>Advanced Settings</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="licenses" className="mt-6">
                    <LicensesTab appId={appId}/>
                </TabsContent>

                <TabsContent value="oauth-clients" className="mt-6">
                    <OAuthClientsTab appId={appId}/>
                </TabsContent>

                <TabsContent value="permissions" className="mt-6">
                    <PermissionsTab appId={appId}/>
                </TabsContent>

                <TabsContent value="sessions" className="mt-6">
                    <SessionsTab appId={appId}/>
                </TabsContent>
            </Tabs>
        </div>
    )
}
