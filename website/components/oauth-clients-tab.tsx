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
  Eye,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {useTeam} from "@/contexts/team-context"
import {apiService} from "@/lib/api-service"
import {useToast} from "@/hooks/use-toast"

export function OAuthClientsTab({appId}: { appId: string }) {
    const {selectedTeam} = useTeam()
    const {toast} = useToast()
    const [clients, setClients] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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

    const filteredClients = clients.filter(
        (client) =>
            client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.clientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

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
            return date.toLocaleDateString()
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

    const handleRegenerateSecret = async (clientId: string) => {
        if (!selectedTeam || !appId || !clientId) return

        try {
            await apiService.oauth.updateClient(selectedTeam.id, appId, clientId, {regenerateSecret: true})
            toast({
                title: "Success",
                description: "Client secret regenerated successfully",
            })
            // Refresh the clients list
            const data = await apiService.oauth.getClients(selectedTeam.id, appId)
            setClients(data || [])
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
            toast({
                title: "Success",
                description: "Client deleted successfully",
            })
            // Remove the client from the list
            setClients(clients.filter((client) => client.id !== clientId))
        } catch (err) {
            console.error("Failed to delete client:", err)
            toast({
                title: "Error",
                description: "Failed to delete client",
                variant: "destructive",
            })
        }
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold">Machine-to-Machine Clients</h2>
                    <p className="text-muted-foreground">Manage API clients for service-to-service authentication</p>
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
                    <Button>
                        <Plus className="mr-2 h-4 w-4"/>
                        Create M2M Client
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Machine-to-Machine Clients</CardTitle>
                    <CardDescription>Manage service accounts that can access this API without user
                        interaction</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Client ID</TableHead>
                                <TableHead>Grant Type</TableHead>
                                <TableHead>Scopes</TableHead>
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
                                            {client.description && <div
                                                className="text-xs text-muted-foreground">{client.description}</div>}
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
                                                {client.scopes && client.scopes.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {client.scopes.slice(0, 3).map((scope, index) => (
                                                            <Badge key={index} variant="secondary" className="text-xs">
                                                                {scope}
                                                            </Badge>
                                                        ))}
                                                        {client.scopes.length > 3 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                +{client.scopes.length - 3} more
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">No scopes</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-muted-foreground"/>
                                                {formatDate(client.lastUsed)}
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
                                                    <DropdownMenuItem>
                                                        <Eye className="mr-2 h-4 w-4"/>
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Edit Client
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRegenerateSecret(client.id)}>
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
        </div>
    )
}
