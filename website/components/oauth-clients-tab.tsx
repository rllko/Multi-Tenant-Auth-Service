"use client"

import {useEffect, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
    AlertTriangle,
    Clock,
    Copy,
    Edit,
    Globe,
    Loader2,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    UserCircle2,
} from "lucide-react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {useTeam} from "@/contexts/team-context"
import {apiService} from "@/lib/api-service"
import {useToast} from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Checkbox} from "@/components/ui/checkbox"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {RolesTable} from "@/components/roles-table"

// Define types for our component
interface OAuthClient {
    id: string
    name: string
    description?: string
    clientId: string
    clientSecret?: string
    grantType: string
    redirectUris?: string[]
    roles?: string[]
    status: string
    lastUsed?: string
    createdAt: string
    updatedAt: string
}

interface Role {
    id: string
    name: string
    description: string
    scopes: string[]
    isDefault: boolean
    isSystemRole?: boolean
    isCustom?: boolean
}

interface ClientSession {
    id: string
    clientId: string
    ipAddress: string
    userAgent?: string
    timestamp: string
    status: string
}

export function OAuthClientsTab({appId}: { appId: string }) {
    const {selectedTeam} = useTeam()
    const {toast} = useToast()
    const [clients, setClients] = useState<OAuthClient[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("clients")

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false)
    const [isViewSecretModalOpen, setIsViewSecretModalOpen] = useState(false)

    // Form states
    const [newClient, setNewClient] = useState({
        name: "",
        description: "",
        grantType: "client_credentials",
        redirectUris: "",
        roles: [] as string[],
    })

    const [editingClient, setEditingClient] = useState<OAuthClient | null>(null)
    const [selectedClientSessions, setSelectedClientSessions] = useState<ClientSession[]>([])
    const [clientSecret, setClientSecret] = useState("")
    const [clientSessions, setClientSessions] = useState<Record<string, ClientSession[]>>({})
    const [loadingSessions, setLoadingSessions] = useState(false)

    // Roles state
    const [roles, setRoles] = useState<Role[]>([])
    const [loadingRoles, setLoadingRoles] = useState(false)
    const [roleLoading, setRoleLoading] = useState(false)

    // Fetch clients on mount
    useEffect(() => {
        const fetchClients = async () => {
            if (!selectedTeam || !appId) return

            try {
                setLoading(true)
                const data = await apiService.oauth.getClients(selectedTeam.id, appId)
                setClients(data || [])
                setError(null)
            } catch (err) {
                console.error("Failed to fetch M2M clients:", err)
                setError("Failed to load machine-to-machine clients")
            } finally {
                setLoading(false)
            }
        }

        fetchClients()
    }, [selectedTeam, appId])

    // Fetch roles only when the roles tab is active
    useEffect(() => {
        const fetchRoles = async () => {
            if (!selectedTeam || activeTab !== "roles") return

            try {
                setLoadingRoles(true)
                const data = await apiService.roles.getRoles(selectedTeam.id)
                setRoles(data || [])
            } catch (err) {
                console.error("Failed to fetch roles:", err)
                toast({
                    title: "Error",
                    description: "Failed to load roles",
                    variant: "destructive",
                })
            } finally {
                setLoadingRoles(false)
            }
        }

        fetchRoles()
    }, [selectedTeam, activeTab, toast])

    // Fetch roles when creating/editing a client
    useEffect(() => {
        const fetchRolesForClient = async () => {
            if (!selectedTeam || (!isCreateModalOpen && !isEditModalOpen)) return

            try {
                setLoadingRoles(true)
                const data = await apiService.roles.getRoles(selectedTeam.id)
                setRoles(data || [])
            } catch (err) {
                console.error("Failed to fetch roles:", err)
            } finally {
                setLoadingRoles(false)
            }
        }

        fetchRolesForClient()
    }, [selectedTeam, isCreateModalOpen, isEditModalOpen])

    const fetchClientSessions = async (clientId: string) => {
        if (!selectedTeam || !appId || !clientId) return

        try {
            setLoadingSessions(true)
            const data = await apiService.oauth.getClientSessions(selectedTeam.id, appId, clientId)
            setClientSessions((prev) => ({...prev, [clientId]: data || []}))
            return data
        } catch (err) {
            console.error("Failed to fetch client sessions:", err)
            toast({
                title: "Error",
                description: "Failed to load client sessions",
                variant: "destructive",
            })
            return []
        } finally {
            setLoadingSessions(false)
        }
    }

    const filteredClients = clients.filter(
        (client) =>
            client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.clientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleCreateClient = async () => {
        if (!selectedTeam || !appId) return

        try {
            const redirectUrisArray = newClient.redirectUris
                ? newClient.redirectUris
                    .split(",")
                    .map((uri) => uri.trim())
                    .filter((uri) => uri)
                : []

            const clientData = {
                name: newClient.name,
                description: newClient.description,
                grantType: newClient.grantType,
                redirectUris: redirectUrisArray,
                roles: newClient.roles,
            }

            const createdClient = await apiService.oauth.createClient(selectedTeam.id, appId, clientData)

            setClients((prev) => [...prev, createdClient])
            setIsCreateModalOpen(false)
            setNewClient({
                name: "",
                description: "",
                grantType: "client_credentials",
                redirectUris: "",
                roles: [],
            })

            toast({
                title: "Success",
                description: "Client created successfully",
            })

            // Show the client secret in a modal
            setClientSecret(createdClient.clientSecret)
            setIsViewSecretModalOpen(true)
        } catch (err) {
            console.error("Failed to create client:", err)
            toast({
                title: "Error",
                description: "Failed to create client",
                variant: "destructive",
            })
        }
    }

    const handleUpdateClient = async () => {
        if (!selectedTeam || !appId || !editingClient) return

        try {
            const redirectUrisArray = editingClient.redirectUris || []

            const clientData = {
                name: editingClient.name,
                description: editingClient.description,
                grantType: editingClient.grantType,
                redirectUris: redirectUrisArray,
                roles: editingClient.roles || [],
            }

            const updatedClient = await apiService.oauth.updateClient(selectedTeam.id, appId, editingClient.id, clientData)

            setClients((prev) => prev.map((client) => (client.id === editingClient.id ? updatedClient : client)))

            setIsEditModalOpen(false)
            setEditingClient(null)

            toast({
                title: "Success",
                description: "Client updated successfully",
            })
        } catch (err) {
            console.error("Failed to update client:", err)
            toast({
                title: "Error",
                description: "Failed to update client",
                variant: "destructive",
            })
        }
    }

    const handleRegenerateSecret = async (clientId: string) => {
        if (!selectedTeam || !appId || !clientId) return

        if (
            !confirm(
                "Are you sure you want to regenerate the client secret? This will invalidate the current secret and may break existing integrations.",
            )
        ) {
            return
        }

        try {
            const updatedClient = await apiService.oauth.updateClient(selectedTeam.id, appId, clientId, {
                regenerateSecret: true,
            })

            setClients((prev) => prev.map((client) => (client.id === clientId ? updatedClient : client)))

            // Show the new client secret
            setClientSecret(updatedClient.clientSecret)
            setIsViewSecretModalOpen(true)

            toast({
                title: "Success",
                description: "Client secret regenerated successfully",
            })
        } catch (err) {
            console.error("Failed to regenerate client secret:", err)
            toast({
                title: "Error",
                description: "Failed to regenerate client secret",
                variant: "destructive",
            })
        }
    }

    const handleDeleteClient = async (clientId: string) => {
        if (!selectedTeam || !appId || !clientId) return

        if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
            return
        }

        try {
            await apiService.oauth.deleteClient(selectedTeam.id, appId, clientId)

            setClients((prev) => prev.filter((client) => client.id !== clientId))

            toast({
                title: "Success",
                description: "Client deleted successfully",
            })
        } catch (err) {
            console.error("Failed to delete client:", err)
            toast({
                title: "Error",
                description: "Failed to delete client",
                variant: "destructive",
            })
        }
    }

    const handleViewSessions = async (client: OAuthClient) => {
        const sessions = await fetchClientSessions(client.id)
        setSelectedClientSessions(sessions || [])
        setIsSessionsModalOpen(true)
    }

    const handleEditClient = (client: OAuthClient) => {
        setEditingClient(client)
        setIsEditModalOpen(true)
    }

    const handleRoleSelect = (role: Role) => {
        toast({
            title: "Role Selected",
            description: `You selected the ${role.name} role`,
        })
    }

    const handleRoleCreate = async (role: Omit<Role, "id">) => {
        if (!selectedTeam) return

        try {
            setRoleLoading(true)
            const createdRole = await apiService.roles.createRole(selectedTeam.id, role)

            // Update the roles list
            setRoles((prev) => [...prev, createdRole])

            toast({
                title: "Success",
                description: "Role created successfully",
            })
            return createdRole
        } catch (err) {
            console.error("Failed to create role:", err)
            toast({
                title: "Error",
                description: "Failed to create role",
                variant: "destructive",
            })
        } finally {
            setRoleLoading(false)
        }
    }

    const handleRoleUpdate = async (id: string, role: Partial<Role>) => {
        if (!selectedTeam) return

        try {
            setRoleLoading(true)
            const updatedRole = await apiService.roles.updateRole(selectedTeam.id, id, role)

            // Update the roles list
            setRoles((prev) => prev.map((r) => (r.id === id ? {...r, ...updatedRole} : r)))

            toast({
                title: "Success",
                description: "Role updated successfully",
            })
        } catch (err) {
            console.error("Failed to update role:", err)
            toast({
                title: "Error",
                description: "Failed to update role",
                variant: "destructive",
            })
        } finally {
            setRoleLoading(false)
        }
    }

    const handleRoleDelete = async (id: string) => {
        if (!selectedTeam) return

        try {
            setRoleLoading(true)
            await apiService.roles.deleteRole(selectedTeam.id, id)

            // Update the roles list
            setRoles((prev) => prev.filter((r) => r.id !== id))

            toast({
                title: "Success",
                description: "Role deleted successfully",
            })
        } catch (err) {
            console.error("Failed to delete role:", err)
            toast({
                title: "Error",
                description: "Failed to delete role",
                variant: "destructive",
            })
        } finally {
            setRoleLoading(false)
        }
    }

    const getGrantTypeBadge = (grantType: string) => {
        switch (grantType?.toLowerCase()) {
            case "client_credentials":
                return (
                    <Badge variant="outline"
                           className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        Client Credentials
                    </Badge>
                )
            case "authorization_code":
                return (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Authorization Code
                    </Badge>
                )
            case "password":
                return (
                    <Badge variant="outline"
                           className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                        Password
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        {grantType || "Unknown"}
                    </Badge>
                )
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
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
            case "revoked":
                return (
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                        Revoked
                    </Badge>
                )
            default:
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        {status || "Unknown"}
                    </Badge>
                )
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return "Never"
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString() + " " + date.toLocaleTimeString()
        } catch (e) {
            return "Invalid date"
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Copied!",
            description: "Copied to clipboard",
        })
    }

    // Find role names for a client
    const getRoleNames = (client: OAuthClient) => {
        if (!client.roles || client.roles.length === 0) return []

        return client.roles.map((roleId) => {
            const role = roles.find((r) => r.id === roleId)
            return role ? role.name : "Unknown Role"
        })
    }

    if (loading && clients.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                <span className="ml-2">Loading machine-to-machine clients...</span>
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

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full max-w-md">
                    <TabsTrigger value="clients">M2M Clients</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                </TabsList>

                <TabsContent value="clients" className="space-y-6 mt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-semibold">Machine-to-Machine Clients</h2>
                            <p className="text-muted-foreground">Manage API clients for service-to-service
                                authentication</p>
                        </div>
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input
                                    type="search"
                                    placeholder="Search clients..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                                <Plus className="mr-2 h-4 w-4"/>
                                Create M2M Client
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Machine-to-Machine Clients</CardTitle>
                            <CardDescription>
                                Manage service accounts that can access this API without user interaction
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Client ID</TableHead>
                                        <TableHead>Grant Type</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead>Last Used</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredClients.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                                                {loading ? (
                                                    <div className="flex justify-center items-center">
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                                                        Loading clients...
                                                    </div>
                                                ) : (
                                                    "No machine-to-machine clients found"
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredClients.map((client) => (
                                            <TableRow key={client.id}>
                                                <TableCell>
                                                    <div className="font-medium">{client.name}</div>
                                                    {client.description && (
                                                        <div
                                                            className="text-xs text-muted-foreground">{client.description}</div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-mono text-xs flex items-center gap-1">
                                                        {client.clientId}
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-5 w-5"
                                                            onClick={() => copyToClipboard(client.clientId)}
                                                        >
                                                            <Copy className="h-3 w-3"/>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getGrantTypeBadge(client.grantType || "client_credentials")}</TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs truncate text-xs">
                                                        {client.roles && client.roles.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {getRoleNames(client)
                                                                    .slice(0, 3)
                                                                    .map((roleName, index) => (
                                                                        <Badge key={index} variant="secondary"
                                                                               className="text-xs">
                                                                            {roleName}
                                                                        </Badge>
                                                                    ))}
                                                                {client.roles.length > 3 && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        +{client.roles.length - 3} more
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">No roles</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="text-sm flex items-center gap-1">
                                                        <Clock className="h-3 w-3 text-muted-foreground"/>
                                                        {formatDate(client.lastUsed || "")}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(client.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4"/>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleViewSessions(client)}>
                                                                <UserCircle2 className="mr-2 h-4 w-4"/>
                                                                View Sessions
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditClient(client)}>
                                                                <Edit className="mr-2 h-4 w-4"/>
                                                                Edit Client
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleRegenerateSecret(client.id)}>
                                                                <RefreshCw className="mr-2 h-4 w-4"/>
                                                                Regenerate Secret
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-red-600 dark:text-red-400"
                                                                onClick={() => handleDeleteClient(client.id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4"/>
                                                                Delete Client
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roles" className="mt-6">
                    {loadingRoles ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            <span className="ml-2">Loading roles...</span>
                        </div>
                    ) : (
                        <RolesTable
                            roles={roles}
                            onRoleSelect={handleRoleSelect}
                            onRoleCreate={handleRoleCreate}
                            onRoleUpdate={handleRoleUpdate}
                            onRoleDelete={handleRoleDelete}
                            loading={roleLoading}
                        />
                    )}
                </TabsContent>
            </Tabs>

            {/* Create Client Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Create Machine-to-Machine Client</DialogTitle>
                        <DialogDescription>Create a new client for service-to-service authentication</DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="basic" className="mt-4">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basic">Basic Info</TabsTrigger>
                            <TabsTrigger value="roles">Roles</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="My API Client"
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Used for integrating with our payment system"
                                        value={newClient.description}
                                        onChange={(e) => setNewClient({...newClient, description: e.target.value})}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="roles" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                <Label>Roles</Label>
                                <p className="text-sm text-muted-foreground">Select the roles this client will have</p>

                                <ScrollArea className="h-[300px] pr-4">
                                    {loadingRoles ? (
                                        <div className="flex items-center justify-center h-32">
                                            <Loader2 className="h-5 w-5 animate-spin mr-2"/>
                                            <span>Loading roles...</span>
                                        </div>
                                    ) : roles.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No roles available. Create roles in the Roles tab.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {roles.map((role) => (
                                                <div key={role.id} className="flex items-start space-x-2">
                                                    <Checkbox
                                                        id={`role-${role.id}`}
                                                        checked={newClient.roles.includes(role.id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setNewClient({
                                                                    ...newClient,
                                                                    roles: [...newClient.roles, role.id],
                                                                })
                                                            } else {
                                                                setNewClient({
                                                                    ...newClient,
                                                                    roles: newClient.roles.filter((id) => id !== role.id),
                                                                })
                                                            }
                                                        }}
                                                    />
                                                    <div className="grid gap-1.5 leading-none">
                                                        <Label
                                                            htmlFor={`role-${role.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                        >
                                                            {role.name}
                                                            {role.isSystemRole && (
                                                                <Badge variant="secondary" className="ml-2">
                                                                    System
                                                                </Badge>
                                                            )}
                                                            {role.isDefault && (
                                                                <Badge variant="outline" className="ml-2">
                                                                    Default
                                                                </Badge>
                                                            )}
                                                        </Label>
                                                        {role.description &&
                                                            <p className="text-xs text-muted-foreground">{role.description}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-4 mt-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="grantType">Grant Type</Label>
                                    <select
                                        id="grantType"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newClient.grantType}
                                        onChange={(e) => setNewClient({...newClient, grantType: e.target.value})}
                                    >
                                        <option value="client_credentials">Client Credentials</option>
                                        <option value="authorization_code">Authorization Code</option>
                                    </select>
                                </div>

                                {newClient.grantType === "authorization_code" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="redirectUris">Redirect URIs</Label>
                                        <Textarea
                                            id="redirectUris"
                                            placeholder="https://example.com/callback,https://localhost:3000/callback"
                                            value={newClient.redirectUris}
                                            onChange={(e) => setNewClient({...newClient, redirectUris: e.target.value})}
                                        />
                                        <p className="text-xs text-muted-foreground">Comma-separated list of allowed
                                            redirect URIs</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateClient} disabled={!newClient.name}>
                            Create Client
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Client Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Machine-to-Machine Client</DialogTitle>
                        <DialogDescription>Update client information and roles</DialogDescription>
                    </DialogHeader>

                    {editingClient && (
                        <Tabs defaultValue="basic" className="mt-4">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="roles">Roles</TabsTrigger>
                                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name">
                                            Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="edit-name"
                                            placeholder="My API Client"
                                            value={editingClient.name}
                                            onChange={(e) => setEditingClient({...editingClient, name: e.target.value})}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-description">Description</Label>
                                        <Textarea
                                            id="edit-description"
                                            placeholder="Used for integrating with our payment system"
                                            value={editingClient.description || ""}
                                            onChange={(e) =>
                                                setEditingClient({
                                                    ...editingClient,
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="roles" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                    <Label>Roles</Label>
                                    <p className="text-sm text-muted-foreground">Select the roles this client will
                                        have</p>

                                    <ScrollArea className="h-[300px] pr-4">
                                        {loadingRoles ? (
                                            <div className="flex items-center justify-center h-32">
                                                <Loader2 className="h-5 w-5 animate-spin mr-2"/>
                                                <span>Loading roles...</span>
                                            </div>
                                        ) : roles.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No roles available. Create roles in the Roles tab.
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {roles.map((role) => (
                                                    <div key={role.id} className="flex items-start space-x-2">
                                                        <Checkbox
                                                            id={`edit-role-${role.id}`}
                                                            checked={editingClient.roles?.includes(role.id) || false}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setEditingClient({
                                                                        ...editingClient,
                                                                        roles: [...(editingClient.roles || []), role.id],
                                                                    })
                                                                } else {
                                                                    setEditingClient({
                                                                        ...editingClient,
                                                                        roles: (editingClient.roles || []).filter((id) => id !== role.id),
                                                                    })
                                                                }
                                                            }}
                                                        />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <Label
                                                                htmlFor={`edit-role-${role.id}`}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                {role.name}
                                                                {role.isSystemRole && (
                                                                    <Badge variant="secondary" className="ml-2">
                                                                        System
                                                                    </Badge>
                                                                )}
                                                                {role.isDefault && (
                                                                    <Badge variant="outline" className="ml-2">
                                                                        Default
                                                                    </Badge>
                                                                )}
                                                            </Label>
                                                            {role.description &&
                                                                <p className="text-xs text-muted-foreground">{role.description}</p>}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </TabsContent>

                            <TabsContent value="advanced" className="space-y-4 mt-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-grantType">Grant Type</Label>
                                        <select
                                            id="edit-grantType"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={editingClient.grantType}
                                            onChange={(e) =>
                                                setEditingClient({
                                                    ...editingClient,
                                                    grantType: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="client_credentials">Client Credentials</option>
                                            <option value="authorization_code">Authorization Code</option>
                                        </select>
                                    </div>

                                    {editingClient.grantType === "authorization_code" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="edit-redirectUris">Redirect URIs</Label>
                                            <Textarea
                                                id="edit-redirectUris"
                                                placeholder="https://example.com/callback,https://localhost:3000/callback"
                                                value={editingClient.redirectUris?.join(",") || ""}
                                                onChange={(e) =>
                                                    setEditingClient({
                                                        ...editingClient,
                                                        redirectUris: e.target.value
                                                            .split(",")
                                                            .map((uri) => uri.trim())
                                                            .filter((uri) => uri),
                                                    })
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">Comma-separated list of allowed
                                                redirect URIs</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateClient} disabled={!editingClient?.name}>
                            Update Client
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Client Secret Modal */}
            <Dialog open={isViewSecretModalOpen} onOpenChange={setIsViewSecretModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Client Secret</DialogTitle>
                        <DialogDescription>Copy this secret now. You won't be able to see it again.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 my-4">
                        <div
                            className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                            <div className="flex items-start">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 mr-2"/>
                                <div>
                                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Important</h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                                        This secret will only be shown once. Make sure to copy it and store it securely.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="client-secret">Client Secret</Label>
                            <div className="flex">
                                <Input id="client-secret" value={clientSecret} readOnly
                                       className="font-mono text-xs pr-10 flex-1"/>
                                <Button variant="ghost" size="icon" className="ml-2"
                                        onClick={() => copyToClipboard(clientSecret)}>
                                    <Copy className="h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setIsViewSecretModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Sessions Modal */}
            <Dialog open={isSessionsModalOpen} onOpenChange={setIsSessionsModalOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Client Sessions</DialogTitle>
                        <DialogDescription>Recent authentication sessions for this client</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 my-4">
                        {loadingSessions ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-5 w-5 animate-spin mr-2"/>
                                <span>Loading sessions...</span>
                            </div>
                        ) : selectedClientSessions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                                <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground"/>
                                <p>No recent sessions found</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>IP Address</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                        <TableHead>User Agent</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedClientSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    <Globe className="h-3 w-3 mr-2 text-muted-foreground"/>
                                                    {session.ipAddress}
                                                </div>
                                            </TableCell>
                                            <TableCell>{formatDate(session.timestamp)}</TableCell>
                                            <TableCell
                                                className="max-w-[200px] truncate">{session.userAgent || "Unknown"}</TableCell>
                                            <TableCell>
                                                {session.status === "success" ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                    >
                                                        Success
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                                    >
                                                        Failed
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <DialogFooter>
                        <Button onClick={() => setIsSessionsModalOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
