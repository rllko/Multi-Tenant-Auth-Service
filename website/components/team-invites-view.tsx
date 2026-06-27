"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {toast} from "@/hooks/use-toast"
import {EmptyState} from "./empty-state"
import {
    AlertCircle,
    Calendar,
    Check,
    Clock,
    Filter,
    Loader2,
    Mail,
    RefreshCw,
    Search,
    Shield,
    User,
    X,
} from "lucide-react"
import {format, formatDistanceToNow} from "date-fns"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {CONSTANTS} from "@/app/const"
import {invitesApi} from "@/lib/api-service"

interface TeamInvite {
    id: string
    teamId: string
    teamName: string
    teamLogo?: string
    createdBy: string
    inviterEmail: string
    inviterAvatar?: string
    role: string
    status: "pending" | "accepted" | "declined" | "expired"
    createdAt: string
    expiresAt: string
}

export function TeamInvitesView() {
    const [invites, setInvites] = useState<TeamInvite[]>([])
    const [sentInvites, setSentInvites] = useState<TeamInvite[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [activeTab, setActiveTab] = useState("received")
    const [selectedInvite, setSelectedInvite] = useState<TeamInvite | null>(null)
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [confirmAction, setConfirmAction] = useState<"accept" | "decline" | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const [tenantName, setTenantName] = useState("")
    const [tenantDomain, setTenantDomain] = useState("")
    const [tenantAdminEmail, setTenantAdminEmail] = useState("")
    const [tenantMessage, setTenantMessage] = useState("")
    const [isInvitingTenant, setIsInvitingTenant] = useState(false)

    const [pendingInvites, setPendingInvites] = useState<any[]>([])
    const [isLoadingInvites, setIsLoadingInvites] = useState(false)

    // Fetch invites
    useEffect(() => {
        if (statusFilter === "all" || statusFilter === "pending") {
            fetchPendingInvites()
        }

        fetchInvites()
    }, [activeTab, statusFilter])

    const fetchPendingInvites = async () => {
        try {
            setIsLoadingInvites(true)

            const token = localStorage.getItem(CONSTANTS.TOKEN_NAME)
            if (!token) {
                throw new Error("Authentication required")
            }

            // Use the API service to fetch pending invites
            const data = await invitesApi.getPendingInvites()
            console.log("Pending invites received:", data)

            console.log(data)

            
            // Transform invites to match member format
            const formattedInvites = data.map((invite) => ({
                id: invite.id,
                name: invite.recipientName || "Invited User",
                email: invite.recipientEmail,
                status: "pending",
                lastActive: "Never",
                role: invite.role,
                isPendingInvite: true,
                invitedAt: invite.createdAt,
                expiresAt: invite.expiresAt
            }))

            setPendingInvites(formattedInvites)
        } catch (err) {
            console.error("Error fetching pending invites:", err)
        } finally {
            setIsLoadingInvites(false)
        }
    }

    const fetchInvites = async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setIsRefreshing(true)
            } else {
                setIsLoading(true)
            }
            setError(null)

            const token = localStorage.getItem(CONSTANTS.TOKEN_NAME)
            if (!token) {
                throw new Error("Authentication required")
            }

            const data = activeTab === "received" ? await invitesApi.getReceivedInvites() : await invitesApi.getSentInvites()

            if (activeTab === "received") {
                setInvites(data)
            } else {
                setSentInvites(data)
            }
        } catch (err) {
            console.error("Error fetching invites:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to load invites"
            setError(errorMessage)

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    const handleRefresh = () => {
        fetchInvites(true)
    }

    const handleViewDetails = (invite: TeamInvite) => {
        setSelectedInvite(invite)
        setDetailsDialogOpen(true)
    }

    const handleAcceptInvite = (invite: TeamInvite) => {
        setSelectedInvite(invite)
        setConfirmAction("accept")
        setConfirmDialogOpen(true)
    }

    const handleDeclineInvite = (invite: TeamInvite) => {
        setSelectedInvite(invite)
        setConfirmAction("decline")
        setConfirmDialogOpen(true)
    }

    const confirmInviteAction = async () => {
        if (!selectedInvite || !confirmAction) return

        try {
            setIsProcessing(true)

            const token = localStorage.getItem(CONSTANTS.TOKEN_NAME)
            if (!token) {
                throw new Error("Authentication required")
            }

            if (confirmAction == "accept")
                await invitesApi.acceptInvite(selectedInvite.inviteToken)
            else
                await invitesApi.declineInvite(selectedInvite.inviteToken)

            // Close dialogs
            setConfirmDialogOpen(false)
            setDetailsDialogOpen(false)

            // Update the invite in the list
            setInvites((prevInvites) =>
                prevInvites.map((invite) =>
                    invite.id === selectedInvite.id
                        ? {...invite, status: confirmAction === "accept" ? "accepted" : "declined"}
                        : invite,
                ),
            )

            // Show success message
            toast({
                title: confirmAction === "accept" ? "Invite Accepted" : "Invite Declined",
                description:
                    confirmAction === "accept"
                        ? `You have joined ${selectedInvite.teamName}`
                        : `You have declined the invitation to ${selectedInvite.teamName}`,
                variant: "default",
            })

            if (confirmAction === "accept") {
                // This would typically be handled by the team context
                // refreshTeams()
            }
        } catch (err) {
            console.error(`Error ${confirmAction}ing invite:`, err)
            const errorMessage = err instanceof Error ? err.message : `Failed to ${confirmAction} invite`

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    const cancelInvite = async (inviteId: string) => {
        try {
            const token = localStorage.getItem(CONSTANTS.TOKEN_NAME)
            if (!token) {
                throw new Error("Authentication required")
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invites/${inviteId}/cancel`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to cancel invite: ${response.status}`)
            }

            // Update the sent invites list
            setSentInvites((prevInvites) => prevInvites.filter((invite) => invite.id !== inviteId))

            toast({
                title: "Invite Cancelled",
                description: "The invitation has been cancelled successfully.",
                variant: "default",
            })
        } catch (err) {
            console.error("Error cancelling invite:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to cancel invite"

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        }
    }

    const handleInviteTenant = async () => {
        //TODO: implement this function
    }

    // Filter invites based on search query and status filter
    const getFilteredInvites = () => {
        const currentInvites = activeTab === "received" ? invites : sentInvites

        return currentInvites.filter((invite) => {
            const matchesSearch =
                searchQuery === "" ||
                invite.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invite.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invite.inviterEmail.toLowerCase().includes(searchQuery.toLowerCase())

            const matchesStatus = statusFilter === "all" || invite.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }

    const filteredInvites = getFilteredInvites()

    // Get status badge variant
    const getStatusBadge = (status: string) => {
        switch (status) {
            case "pending":
                return (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                        Pending
                    </Badge>
                )
            case "accepted":
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
                        Accepted
                    </Badge>
                )
            case "declined":
                return (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-300">
                        Declined
                    </Badge>
                )
            case "expired":
                return (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-300">
                        Expired
                    </Badge>
                )
            default:
                return <Badge variant="outline">Unknown</Badge>
        }
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return format(date, "PPP")
        } catch (error) {
            return "Invalid date"
        }
    }

    // Get time ago for display
    const getTimeAgo = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return formatDistanceToNow(date, {addSuffix: true})
        } catch (error) {
            return "Unknown time"
        }
    }

    // Check if an invite is expired
    const isExpired = (expiresAt: string) => {
        try {
            const expiryDate = new Date(expiresAt)
            return expiryDate < new Date()
        } catch (error) {
            return false
        }
    }

    if (error && !isRefreshing && invites.length === 0 && sentInvites.length === 0) {
        return (
            <div className="rounded-md bg-destructive/15 p-4">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-3"/>
                    <div>
                        <h3 className="font-medium text-destructive">Error loading invites</h3>
                        <p className="text-sm text-destructive/90 mt-1">{error}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={handleRefresh}
                        >
                            Try again
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Team Invites</h1>
                    <p className="text-muted-foreground">Manage your team invitations</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}/>
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="received">Received Invites</TabsTrigger>
                    <TabsTrigger value="sent">Sent Invites</TabsTrigger>
                </TabsList>

                <div className="mt-4 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                        <Input
                            type="search"
                            placeholder={`Search ${activeTab === "received" ? "invites" : "sent invites"}...`}
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Filter by status"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" className="shrink-0">
                        <Filter className="h-4 w-4"/>
                    </Button>
                </div>

                <TabsContent value="received" className="mt-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2"/>
                            <span>Loading invites...</span>
                        </div>
                    ) : filteredInvites.length === 0 ? (
                        <EmptyState
                            title="No invites found"
                            description={
                                searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "You don't have any team invitations at the moment"
                            }
                            icon={<Mail className="h-10 w-10"/>}
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredInvites.map((invite) => (
                                <Card key={invite.inviteToken}
                                      className="overflow-hidden hover:shadow-md transition-shadow">
                                    <CardContent className="p-0">
                                        <div className="p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage
                                                        src={invite.teamLogo || "/placeholder.svg?height=40&width=40"}
                                                        alt={invite.teamName}
                                                    />
                                                    <AvatarFallback>{invite.teamName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-medium">{invite.teamName}</h3>
                                                    <p className="text-xs text-muted-foreground">
                            <span className="inline-flex items-center">
                              <Shield className="h-3 w-3 mr-1"/>
                                {/*{invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}*/}
                            </span>
                                                    </p>
                                                </div>
                                                <div className="ml-auto">{getStatusBadge(invite.status)}</div>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-start">
                                                    <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground"/>
                                                    <div>
                                                        <p className="text-muted-foreground">From</p>
                                                        <p>{invite.createdBy}</p>
                                                        <p className="text-xs text-muted-foreground">{invite.createdByEmail}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground"/>
                                                    <div>
                                                        <p className="text-muted-foreground">Sent</p>
                                                        <p>{formatDate(invite.createdAt)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-2 text-muted-foreground"/>
                                                    <div>
                                                        <p className="text-muted-foreground">Expires</p>
                                                        <p className={isExpired(invite.expiresAt) ? "text-red-500" : ""}>
                                                            {formatDate(invite.expiresAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleViewDetails(invite)}
                                                >
                                                    View Details
                                                </Button>
                                                {invite.status === "pending" && !isExpired(invite.expiresAt) && (
                                                    <>
                                                        <Button
                                                            variant="default"
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => handleAcceptInvite(invite)}
                                                        >
                                                            <Check className="h-4 w-4 mr-1"/>
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => handleDeclineInvite(invite)}
                                                        >
                                                            <X className="h-4 w-4 mr-1"/>
                                                            Decline
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="sent" className="mt-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2"/>
                            <span>Loading sent invites...</span>
                        </div>
                    ) : filteredInvites.length === 0 ? (
                        <EmptyState
                            title="No sent invites found"
                            description={
                                searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your search or filters"
                                    : "You haven't sent any team invitations yet"
                            }
                            icon={<Mail className="h-10 w-10"/>}
                        />
                    ) : (
                        <div className="border rounded-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left p-3 font-medium">Recipient</th>
                                        <th className="text-left p-3 font-medium">Team</th>
                                        <th className="text-left p-3 font-medium">Role</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Sent</th>
                                        <th className="text-left p-3 font-medium">Expires</th>
                                        <th className="text-right p-3 font-medium">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                    {filteredInvites.map((invite) => (
                                        <tr key={invite.id} className="hover:bg-muted/30">
                                            <td className="p-3">
                                                <div>
                                                    <div className="font-medium">{invite.createdBy}</div>
                                                    <div
                                                        className="text-xs text-muted-foreground">{invite.inviterEmail}</div>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage
                                                            src={invite.teamLogo || "/placeholder.svg?height=24&width=24"}
                                                            alt={invite.teamName}
                                                        />
                                                        <AvatarFallback>{invite.teamName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span>{invite.teamName}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="capitalize">{invite.role}</span>
                                            </td>
                                            <td className="p-3">{getStatusBadge(invite.status)}</td>
                                            <td className="p-3 text-sm">
                                                <div>{formatDate(invite.createdAt)}</div>
                                                <div
                                                    className="text-xs text-muted-foreground">{getTimeAgo(invite.createdAt)}</div>
                                            </td>
                                            <td className="p-3 text-sm">
                                                <div className={isExpired(invite.expiresAt) ? "text-red-500" : ""}>
                                                    {formatDate(invite.expiresAt)}
                                                </div>
                                                <div
                                                    className="text-xs text-muted-foreground">{getTimeAgo(invite.expiresAt)}</div>
                                            </td>
                                            <td className="p-3 text-right">
                                                {invite.status === "pending" && !isExpired(invite.expiresAt) ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => cancelInvite(invite.id)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" size="sm"
                                                            onClick={() => handleViewDetails(invite)}>
                                                        Details
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Invite Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Invite Details</DialogTitle>
                        <DialogDescription>Details about this team invitation</DialogDescription>
                    </DialogHeader>

                    {selectedInvite && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-12 w-12">
                                    <AvatarImage
                                        src={selectedInvite.teamLogo || "/placeholder.svg?height=48&width=48"}
                                        alt={selectedInvite.teamName}
                                    />
                                    <AvatarFallback>{selectedInvite.teamName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium text-lg">{selectedInvite.teamName}</h3>
                                </div>
                            </div>

                            <div className="border rounded-md p-3 space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                                    <div className="mt-1">{getStatusBadge(selectedInvite.status)}</div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Role</p>
                                    <p className="capitalize">{selectedInvite.role}</p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        {activeTab === "received" ? "Invited by" : "Recipient"}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage
                                                src={selectedInvite.inviterAvatar || "/placeholder.svg?height=24&width=24"}
                                                alt={selectedInvite.createdBy}
                                            />
                                            <AvatarFallback>{selectedInvite.createdBy.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p>{selectedInvite.createdBy}</p>
                                            <p className="text-xs text-muted-foreground">{selectedInvite.inviterEmail}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Sent</p>
                                        <p>{formatDate(selectedInvite.createdAt)}</p>
                                        <p className="text-xs text-muted-foreground">{getTimeAgo(selectedInvite.createdAt)}</p>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Expires</p>
                                        <p className={isExpired(selectedInvite.expiresAt) ? "text-red-500" : ""}>
                                            {formatDate(selectedInvite.expiresAt)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{getTimeAgo(selectedInvite.expiresAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex sm:justify-between">
                        <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                            Close
                        </Button>
                        {selectedInvite &&
                            activeTab === "received" &&
                            selectedInvite.status === "pending" &&
                            !isExpired(selectedInvite.expiresAt) && (
                                <div className="flex gap-2">
                                    <Button variant="default" onClick={() => handleAcceptInvite(selectedInvite)}>
                                        <Check className="h-4 w-4 mr-1"/>
                                        Accept
                                    </Button>
                                    <Button variant="secondary" onClick={() => handleDeclineInvite(selectedInvite)}>
                                        <X className="h-4 w-4 mr-1"/>
                                        Decline
                                    </Button>
                                </div>
                            )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Action Dialog */}
            <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {confirmAction === "accept" ? "Accept Team Invitation" : "Decline Team Invitation"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmAction === "accept"
                                ? `Are you sure you want to join ${selectedInvite?.teamName}?`
                                : `Are you sure you want to decline the invitation to ${selectedInvite?.teamName}?`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault()
                                confirmInviteAction()
                            }}
                            disabled={isProcessing}
                            className={
                                confirmAction === "accept"
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            }
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
                                    {confirmAction === "accept" ? "Accepting..." : "Declining..."}
                                </>
                            ) : confirmAction === "accept" ? (
                                "Accept"
                            ) : (
                                "Decline"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
