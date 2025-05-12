"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card"
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog"
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
import {Label} from "@/components/ui/label"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs"
import {Checkbox} from "@/components/ui/checkbox"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {
    AlertTriangle,
    Ban,
    Calendar,
    CalendarPlus,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Copy,
    Download,
    Edit,
    FileText,
    Filter,
    Key,
    Loader2,
    MoreHorizontal,
    Plus,
    RefreshCw,
    Search,
    ShieldCheck,
    Trash,
    Upload,
    UserPlus,
    Users,
    X,
} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {Separator} from "@/components/ui/separator"
import {CONSTANTS} from "@/app/const"
import {licensesApi} from "@/lib/api-service";
import {useTeam} from "@/contexts/team-context";


// Mock user permissions
const userPermissions = [
    "license.delete",
    "license.delete_multiple",
    "license.create",
    "license.assign_to_user",
    "license.set_note",
    "license.unban",
    "license.verify_exists",
    "license.retrieve_info",
    "license.add_time_all_used",
    "license.add_time_all_unused",
    "license.create_user",
    // Uncomment to test other permissions
    // "license.delete_all",
    // "license.delete_all_used",
    // "license.delete_all_unused",
]

// Helper function to check if user has permission
const hasPermission = (permission) => {
    return userPermissions.includes(permission)
}

export function LicensesTab({appId}) {
    const [licenses, setLicenses] = useState([])
    const [plans, setPlans] = useState([])
    const {selectedTeam} = useTeam()
    const [open, setOpen] = useState(false)
    const [selectedLicense, setSelectedLicense] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [planFilter, setPlanFilter] = useState("all")
    const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false)
    const [selectedBulkAction, setSelectedBulkAction] = useState(null)
    const [selectedLicenses, setSelectedLicenses] = useState([])
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [timeToAdd, setTimeToAdd] = useState(30)
    const [timeUnit, setTimeUnit] = useState("days")
    const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const {toast} = useToast()

    const [newLicense, setNewLicense] = useState({
        plan: "",
        expiresAt: "",
        maxUsages: 1,
        notes: "",
        generateKey: true,
        customKey: "",
    })

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(5)
    const [totalLicenses, setTotalLicenses] = useState(0)

    // Fetch licenses and plans on component mount
    useEffect(() => {
        fetchLicenses()
    }, [appId, selectedTeam])

    // Fetch licenses when filters or pagination changes
    useEffect(() => {
        fetchLicenses()
    }, [currentPage, itemsPerPage, statusFilter, planFilter, searchQuery])

    // Fetch licenses from API
    const fetchLicenses = async () => {
        if (!selectedTeam) return
        try {
            setIsLoading(true)
            setError(null)

            // Build query parameters
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
                ...(statusFilter !== "all" && {status: statusFilter}),
                ...(planFilter !== "all" && {plan: planFilter}),
                ...(searchQuery && {search: searchQuery}),
            })

            const data = await licensesApi.getLicenses(selectedTeam.id, appId, params.toString())

            setLicenses(data || [])
            setTotalLicenses(data.total || 0)
        } catch (err) {
            setError("Failed to fetch licenses. Please try again.")
            toast({
                title: "Error",
                description: "Failed to fetch licenses. Please try again.",
                variant: "destructive",
            })
            console.error("Error fetching licenses:", err)
        } finally {
            setIsLoading(false)
        }
    }


    const refreshData = () => {
        setIsRefreshing(true)
        Promise.all([fetchLicenses()])
            .catch((error) => {
                console.error("Error refreshing data:", error)
                toast({
                    title: "Error",
                    description: "Failed to refresh data. Please try again.",
                    variant: "destructive",
                })
            })
            .finally(() => {
                setIsRefreshing(false)
            })
    }

    const handleEdit = (license) => {
        setSelectedLicense(license)
        setNewLicense({
            plan: license.plan.toLowerCase(),
            expiresAt: license.expiresAt,
            maxUsages: license.maxUsages,
            notes: license.notes,
            generateKey: false,
            customKey: license.key,
        })
        setOpen(true)
    }

    const handleCreate = () => {
        setSelectedLicense(null)
        setNewLicense({
            plan: plans.length > 0 ? plans[0].id : "pro",
            expiresAt: "",
            maxUsages: 1,
            notes: "",
            generateKey: true,
            customKey: "",
        })
        setOpen(true)
    }

    const handleSave = async () => {
        try {
            setIsSubmitting(true)

            const licenseData = {
                plan: newLicense.plan,
                expiresAt: newLicense.expiresAt || null,
                maxUsages: Number.parseInt(newLicense.maxUsages),
                notes: newLicense.notes,
                generateKey: newLicense.generateKey,
                customKey: newLicense.generateKey ? null : newLicense.customKey,
            }

            let response

            if (selectedLicense) {
                // Update existing license
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses/${selectedLicense.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                    },
                    body: JSON.stringify(licenseData),
                })
            } else {
                // Create new license
                response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                    },
                    body: JSON.stringify(licenseData),
                })
            }

            if (!response.ok) {
                throw new Error(`Failed to ${selectedLicense ? "update" : "create"} license: ${response.statusText}`)
            }

            toast({
                title: selectedLicense ? "License updated" : "License created",
                description: selectedLicense
                    ? "The license has been updated successfully."
                    : "A new license has been created successfully.",
            })

            refreshData()
            setOpen(false)
        } catch (err) {
            toast({
                title: "Error",
                description: `Failed to ${selectedLicense ? "update" : "create"} license. Please try again.`,
                variant: "destructive",
            })
            console.error(`Error ${selectedLicense ? "updating" : "creating"} license:`, err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleInputChange = (e) => {
        const {name, value} = e.target
        setNewLicense((prev) => ({...prev, [name]: value}))
    }

    const handleSelectChange = (name, value) => {
        setNewLicense((prev) => ({...prev, [name]: value}))
    }

    const handleCheckboxChange = (e) => {
        const {name, checked} = e.target
        setNewLicense((prev) => ({...prev, [name]: checked}))
    }

    const generateRandomKey = () => {
        const segments = []
        for (let i = 0; i < 4; i++) {
            segments.push(Math.random().toString(36).substring(2, 6).toUpperCase())
        }
        return `KEYAUTH-${segments.join("-")}`
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Copied to clipboard",
            description: "The license key has been copied to your clipboard.",
            duration: 2000,
        })
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-green-500 hover:bg-green-600">
                        <Check className="mr-1 h-3 w-3"/>
                        Active
                    </Badge>
                )
            case "expired":
                return (
                    <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Calendar className="mr-1 h-3 w-3"/>
                        Expired
                    </Badge>
                )
            case "revoked":
                return (
                    <Badge variant="destructive">
                        <X className="mr-1 h-3 w-3"/>
                        Revoked
                    </Badge>
                )
            case "banned":
                return (
                    <Badge variant="destructive" className="bg-red-700">
                        <Ban className="mr-1 h-3 w-3"/>
                        Banned
                    </Badge>
                )
            default:
                return <Badge>{status}</Badge>
        }
    }

    const handleBulkAction = (actionId) => {
        const action = {
            id: actionId,
            name:
                actionId === "add_time"
                    ? "Add Time to Licenses"
                    : actionId === "create_license"
                        ? "Create License"
                        : actionId === "create_user"
                            ? "Create User with License"
                            : actionId === "delete_selected"
                                ? "Delete Selected Licenses"
                                : actionId === "delete_all"
                                    ? "Delete All Licenses"
                                    : actionId === "delete_all_used"
                                        ? "Delete All Used Licenses"
                                        : actionId === "delete_all_unused"
                                            ? "Delete All Unused Licenses"
                                            : "Perform Action",
            description:
                actionId === "add_time"
                    ? "Add time to selected licenses"
                    : actionId === "create_license"
                        ? "Create a new license key"
                        : actionId === "create_user"
                            ? "Create a new user with a license"
                            : actionId === "delete_selected"
                                ? "Delete selected licenses"
                                : actionId === "delete_all"
                                    ? "Delete all licenses"
                                    : actionId === "delete_all_used"
                                        ? "Delete all used licenses"
                                        : actionId === "delete_all_unused"
                                            ? "Delete all unused licenses"
                                            : "Perform the selected action",
            permission:
                actionId === "add_time"
                    ? "license.add_time_all_used"
                    : actionId === "create_license"
                        ? "license.create"
                        : actionId === "create_user"
                            ? "license.create_user"
                            : actionId === "delete_selected"
                                ? "license.delete_multiple"
                                : actionId === "delete_all"
                                    ? "license.delete_all"
                                    : actionId === "delete_all_used"
                                        ? "license.delete_all_used"
                                        : actionId === "delete_all_unused"
                                            ? "license.delete_all_unused"
                                            : "",
            confirmText: actionId.includes("delete")
                ? "Are you sure you want to delete these licenses? This action cannot be undone."
                : "",
        }

        setSelectedBulkAction(action)

        if (actionId === "create_license") {
            handleCreate()
            return
        }

        if (actionId === "create_user") {
            setCreateUserDialogOpen(true)
            return
        }

        if (actionId === "add_time") {
            setBulkActionDialogOpen(true)
            return
        }

        if (actionId.includes("delete")) {
            setConfirmDialogOpen(true)
            return
        }
    }

    const executeBulkAction = async () => {
        if (!selectedBulkAction) return

        try {
            setIsSubmitting(true)

            let response

            switch (selectedBulkAction.id) {
                case "add_time":
                    // Add time to selected licenses
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses/bulk/add-time`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                        },
                        body: JSON.stringify({
                            licenseIds: selectedLicenses,
                            amount: timeToAdd,
                            unit: timeUnit,
                        }),
                    })

                    if (!response.ok) {
                        throw new Error(`Failed to add time to licenses: ${response.statusText}`)
                    }

                    toast({
                        title: "Time added to licenses",
                        description: `Added ${timeToAdd} ${timeUnit} to ${selectedLicenses.length} licenses.`,
                    })
                    break

                case "delete_selected":
                    // Delete selected licenses
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses/bulk/delete`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                        },
                        body: JSON.stringify({
                            licenseIds: selectedLicenses,
                        }),
                    })

                    if (!response.ok) {
                        throw new Error(`Failed to delete selected licenses: ${response.statusText}`)
                    }

                    toast({
                        title: "Licenses deleted",
                        description: `${selectedLicenses.length} licenses have been deleted.`,
                    })
                    break

                case "delete_all":
                    // Delete all licenses for this app
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                        },
                    })

                    if (!response.ok) {
                        throw new Error(`Failed to delete all licenses: ${response.statusText}`)
                    }

                    toast({
                        title: "All licenses deleted",
                        description: "All licenses have been deleted.",
                    })
                    break

                case "delete_all_used":
                    // Delete all used licenses
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses/used`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                        },
                    })

                    if (!response.ok) {
                        throw new Error(`Failed to delete used licenses: ${response.statusText}`)
                    }

                    toast({
                        title: "Used licenses deleted",
                        description: "All used licenses have been deleted.",
                    })
                    break

                case "delete_all_unused":
                    // Delete all unused licenses
                    response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses/unused`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                        },
                    })

                    if (!response.ok) {
                        throw new Error(`Failed to delete unused licenses: ${response.statusText}`)
                    }

                    toast({
                        title: "Unused licenses deleted",
                        description: "All unused licenses have been deleted.",
                    })
                    break
            }

            refreshData()
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to perform action. Please try again.",
                variant: "destructive",
            })
            console.error("Error executing bulk action:", err)
        } finally {
            setIsSubmitting(false)
            setBulkActionDialogOpen(false)
            setConfirmDialogOpen(false)
            setSelectedBulkAction(null)
            setSelectedLicenses([])
        }
    }

    const handleCreateUser = async (data) => {
        try {
            setIsSubmitting(true)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/with-license`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                },
                body: JSON.stringify({
                    email: data.email,
                    name: data.name,
                    plan: data.plan,
                    expiresAt: data.expiresAt,
                    applicationId: appId,
                }),
            })

            if (!response.ok) {
                throw new Error(`Failed to create user: ${response.statusText}`)
            }

            toast({
                title: "User created",
                description: `A new user has been created with a license.`,
            })

            refreshData()
            setCreateUserDialogOpen(false)
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to create user. Please try again.",
                variant: "destructive",
            })
            console.error("Error creating user:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteLicense = async (licenseId) => {
        try {
            setIsSubmitting(true)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses/${licenseId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to delete license: ${response.statusText}`)
            }

            toast({
                title: "License deleted",
                description: "The license has been deleted successfully.",
            })

            // Remove the license from the local state
            setLicenses(licenses.filter((lic) => lic.id !== licenseId))
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to delete license. Please try again.",
                variant: "destructive",
            })
            console.error("Error deleting license:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRevokeLicense = async (licenseId) => {
        try {
            setIsSubmitting(true)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses/${licenseId}/revoke`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to revoke license: ${response.statusText}`)
            }

            toast({
                title: "License revoked",
                description: "The license has been revoked successfully.",
            })

            // Update the license in the local state
            setLicenses(licenses.map((lic) => (lic.id === licenseId ? {...lic, status: "revoked"} : lic)))
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to revoke license. Please try again.",
                variant: "destructive",
            })
            console.error("Error revoking license:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleBanLicense = async (licenseId) => {
        try {
            setIsSubmitting(true)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses/${licenseId}/ban`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to ban license: ${response.statusText}`)
            }

            toast({
                title: "License banned",
                description: "The license has been banned successfully.",
            })

            // Update the license in the local state
            setLicenses(licenses.map((lic) => (lic.id === licenseId ? {...lic, status: "banned"} : lic)))
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to ban license. Please try again.",
                variant: "destructive",
            })
            console.error("Error banning license:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUnbanLicense = async (licenseId) => {
        try {
            setIsSubmitting(true)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/apps/${appId}/licenses/${licenseId}/unban`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(CONSTANTS.TOKEN_NAME)}`,
                },
            })

            if (!response.ok) {
                throw new Error(`Failed to unban license: ${response.statusText}`)
            }

            toast({
                title: "License unbanned",
                description: "The license has been unbanned successfully.",
            })

            // Update the license in the local state
            setLicenses(licenses.map((lic) => (lic.id === licenseId ? {...lic, status: "active"} : lic)))
        } catch (err) {
            toast({
                title: "Error",
                description: "Failed to unban license. Please try again.",
                variant: "destructive",
            })
            console.error("Error unbanning license:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const totalPages = Math.ceil(totalLicenses / itemsPerPage)

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
        // fetchLicenses will be called via the useEffect
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">License Keys</h2>
                    <p className="text-muted-foreground">Manage license keys for user authentication and access
                        control</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}/>
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                    {hasPermission("license.create") && (
                        <Button onClick={handleCreate}>
                            <Plus className="mr-2 h-4 w-4"/>
                            Generate License Key
                        </Button>
                    )}
                </div>
            </div>

            <Card className="shadow-sm border-border bg-white dark:bg-[#1E1E1E]">
                <CardHeader className="border-b">
                    <CardTitle>License Management</CardTitle>
                    <CardDescription>Generate and manage license keys for this application.</CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                    {/* Action Groups */}
                    <div className="mb-6">
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList>
                                <TabsTrigger value="all">All Actions</TabsTrigger>
                                <TabsTrigger value="create">Create</TabsTrigger>
                                <TabsTrigger value="manage">Manage</TabsTrigger>
                                <TabsTrigger value="delete">Delete</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Create Section */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Create</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <Button
                                                className="w-full justify-start"
                                                onClick={() => handleBulkAction("create_license")}
                                                disabled={!hasPermission("license.create")}
                                            >
                                                <Key className="mr-2 h-4 w-4"/>
                                                Create New License
                                            </Button>
                                            <Button
                                                className="w-full justify-start"
                                                onClick={() => handleBulkAction("create_user")}
                                                disabled={!hasPermission("license.create_user")}
                                            >
                                                <UserPlus className="mr-2 h-4 w-4"/>
                                                Create User with License
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Manage Section */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Manage</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <Button
                                                className="w-full justify-start"
                                                onClick={() => handleBulkAction("add_time")}
                                                disabled={!hasPermission("license.add_time_all_used") || selectedLicenses.length === 0}
                                            >
                                                <CalendarPlus className="mr-2 h-4 w-4"/>
                                                Add Time to Selected
                                            </Button>
                                            <Button className="w-full justify-start" variant="outline" onClick={() => {
                                            }}>
                                                <Download className="mr-2 h-4 w-4"/>
                                                Export Licenses
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    {/* Delete Section */}
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-base">Delete</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <Button
                                                className="w-full justify-start"
                                                variant="destructive"
                                                onClick={() => handleBulkAction("delete_selected")}
                                                disabled={!hasPermission("license.delete_multiple") || selectedLicenses.length === 0}
                                            >
                                                <Trash className="mr-2 h-4 w-4"/>
                                                Delete Selected ({selectedLicenses.length})
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button className="w-full justify-between" variant="outline">
                                                        <div className="flex items-center">
                                                            <AlertTriangle className="mr-2 h-4 w-4 text-amber-500"/>
                                                            Bulk Delete Options
                                                        </div>
                                                        <ChevronRight className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-56">
                                                    <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
                                                    <DropdownMenuSeparator/>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleBulkAction("delete_all_unused")}
                                                        disabled={!hasPermission("license.delete_all_unused")}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4"/>
                                                        Delete All Unused
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleBulkAction("delete_all_used")}
                                                        disabled={!hasPermission("license.delete_all_used")}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4"/>
                                                        Delete All Used
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleBulkAction("delete_all")}
                                                        disabled={!hasPermission("license.delete_all")}
                                                    >
                                                        <AlertTriangle className="mr-2 h-4 w-4"/>
                                                        Delete All Licenses
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="create" className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Create License</CardTitle>
                                            <CardDescription>Generate a new license key for a user</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">

                                            <div className="grid gap-2">
                                                <Label>Expiration</Label>
                                                <Input type="date"/>
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={() => handleBulkAction("create_license")}
                                                disabled={!hasPermission("license.create")}
                                            >
                                                <Key className="mr-2 h-4 w-4"/>
                                                Generate License Key
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Create User with License</CardTitle>
                                            <CardDescription>Create a new user account with a license
                                                key</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label>Email</Label>
                                                <Input type="email" placeholder="user@example.com"/>
                                            </div>
                                          
                                            <Button
                                                className="w-full"
                                                onClick={() => handleBulkAction("create_user")}
                                                disabled={!hasPermission("license.create_user")}
                                            >
                                                <UserPlus className="mr-2 h-4 w-4"/>
                                                Create User with License
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="manage" className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Time Management</CardTitle>
                                            <CardDescription>Add time to licenses</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <Label>Amount</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={timeToAdd}
                                                        onChange={(e) => setTimeToAdd(Number(e.target.value))}
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Unit</Label>
                                                    <select
                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                        value={timeUnit}
                                                        onChange={(e) => setTimeUnit(e.target.value)}
                                                    >
                                                        <option value="days">Days</option>
                                                        <option value="months">Months</option>
                                                        <option value="years">Years</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    onClick={() => handleBulkAction("add_time")}
                                                    disabled={!hasPermission("license.add_time_all_used") || selectedLicenses.length === 0}
                                                >
                                                    <Clock className="mr-2 h-4 w-4"/>
                                                    Add to Selected
                                                </Button>
                                                <Button variant="outline"
                                                        disabled={!hasPermission("license.add_time_all_used")}>
                                                    <Users className="mr-2 h-4 w-4"/>
                                                    Add to All Used
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Import/Export</CardTitle>
                                            <CardDescription>Manage license data</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <Button className="w-full" variant="outline">
                                                <Download className="mr-2 h-4 w-4"/>
                                                Export Licenses (CSV)
                                            </Button>
                                            <Button className="w-full" variant="outline">
                                                <Upload className="mr-2 h-4 w-4"/>
                                                Import Licenses
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="delete" className="mt-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Delete Licenses</CardTitle>
                                        <CardDescription>Remove licenses from the system</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Alert
                                            variant="warning"
                                            className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-900"
                                        >
                                            <AlertTriangle className="h-4 w-4"/>
                                            <AlertTitle>Warning</AlertTitle>
                                            <AlertDescription>
                                                Deleting licenses is permanent and cannot be undone. Users will lose
                                                access immediately.
                                            </AlertDescription>
                                        </Alert>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <Button
                                                variant="destructive"
                                                onClick={() => handleBulkAction("delete_selected")}
                                                disabled={!hasPermission("license.delete_multiple") || selectedLicenses.length === 0}
                                            >
                                                <Trash className="mr-2 h-4 w-4"/>
                                                Delete Selected ({selectedLicenses.length})
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                                                onClick={() => handleBulkAction("delete_all_unused")}
                                                disabled={!hasPermission("license.delete_all_unused")}
                                            >
                                                <Trash className="mr-2 h-4 w-4"/>
                                                Delete All Unused
                                            </Button>
                                        </div>

                                        <Separator/>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <Button
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                                                onClick={() => handleBulkAction("delete_all_used")}
                                                disabled={!hasPermission("license.delete_all_used")}
                                            >
                                                <Trash className="mr-2 h-4 w-4"/>
                                                Delete All Used
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                                                onClick={() => handleBulkAction("delete_all")}
                                                disabled={!hasPermission("license.delete_all")}
                                            >
                                                <AlertTriangle className="mr-2 h-4 w-4"/>
                                                Delete All Licenses
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input
                                type="search"
                                placeholder="Search by key, user, or notes..."
                                className="pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="w-full md:w-auto">
                                    <Filter className="mr-2 h-4 w-4"/>
                                    Filters
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Filter Licenses</DropdownMenuLabel>
                                <DropdownMenuSeparator/>
                                <div className="p-2">
                                    <Label className="text-xs">Status</Label>
                                    <select
                                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="active">Active</option>
                                        <option value="expired">Expired</option>
                                        <option value="revoked">Revoked</option>
                                        <option value="banned">Banned</option>
                                    </select>
                                </div>
                                <div className="p-2">
                                    <Label className="text-xs">Plan</Label>
                                    <select
                                        className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm mt-1"
                                        value={planFilter}
                                        onChange={(e) => setPlanFilter(e.target.value)}
                                    >
                                        <option value="all">All Plans</option>
                                        {plans.map((plan) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <DropdownMenuSeparator/>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full m-2"
                                    onClick={() => {
                                        setStatusFilter("all")
                                        setPlanFilter("all")
                                        setSearchQuery("")
                                    }}
                                >
                                    Reset Filters
                                </Button>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Licenses Table */}
                    <div className="relative">
                        {(isLoading || isRefreshing) && (
                            <div
                                className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                                    <p className="text-sm text-muted-foreground">
                                        {isRefreshing ? "Refreshing..." : "Loading licenses..."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <Table>
                            <TableHeader className="bg-gray-50 dark:bg-gray-900">
                                <TableRow>
                                    <TableHead className="w-[40px]">
                                        <Checkbox
                                            checked={licenses.length > 0 && selectedLicenses.length === licenses.length}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedLicenses(licenses.map((lic) => lic.id))
                                                } else {
                                                    setSelectedLicenses([])
                                                }
                                            }}
                                        />
                                    </TableHead>
                                    <TableHead>License Key</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {licenses.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No license keys found. Try adjusting your filters or create a new license
                                            key.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    licenses.map((license) => (
                                        <TableRow key={license.id}
                                                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedLicenses.includes(license.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setSelectedLicenses([...selectedLicenses, license.id])
                                                        } else {
                                                            setSelectedLicenses(selectedLicenses.filter((id) => id !== license.id))
                                                        }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-mono text-xs">{license.key}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => copyToClipboard(license.key)}
                                                    >
                                                        <Copy className="h-3 w-3"/>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {license.plan}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(license.status)}</TableCell>
                                            <TableCell>
                                                {license.assignedTo ? (
                                                    <span className="text-sm">{license.assignedTo}</span>
                                                ) : (
                                                    <span
                                                        className="text-sm text-muted-foreground italic">Unassigned</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{license.expiresAt}</TableCell>
                                            <TableCell>
                        <span className="text-sm">
                          {license.usages} / {license.maxUsages === 0 ? "∞" : license.maxUsages}
                        </span>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4"/>
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEdit(license)}>
                                                            <Edit className="mr-2 h-4 w-4"/>
                                                            Edit License
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => copyToClipboard(license.key)}>
                                                            <Copy className="mr-2 h-4 w-4"/>
                                                            Copy Key
                                                        </DropdownMenuItem>
                                                        {license.status === "active" && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleRevokeLicense(license.id)}>
                                                                <X className="mr-2 h-4 w-4"/>
                                                                Revoke License
                                                            </DropdownMenuItem>
                                                        )}
                                                        {license.status === "active" && hasPermission("license.blacklist") && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleBanLicense(license.id)}>
                                                                <Ban className="mr-2 h-4 w-4"/>
                                                                Ban License
                                                            </DropdownMenuItem>
                                                        )}
                                                        {license.status === "banned" && hasPermission("license.unban") && (
                                                            <DropdownMenuItem
                                                                onClick={() => handleUnbanLicense(license.id)}>
                                                                <ShieldCheck className="mr-2 h-4 w-4"/>
                                                                Unban License
                                                            </DropdownMenuItem>
                                                        )}
                                                        {license.status === "revoked" && (
                                                            <DropdownMenuItem>
                                                                <RefreshCw className="mr-2 h-4 w-4"/>
                                                                Reactivate License
                                                            </DropdownMenuItem>
                                                        )}
                                                        {hasPermission("license.set_note") && (
                                                            <DropdownMenuItem>
                                                                <FileText className="mr-2 h-4 w-4"/>
                                                                Edit Notes
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator/>
                                                        {hasPermission("license.delete") && (
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => handleDeleteLicense(license.id)}
                                                            >
                                                                <Trash className="mr-2 h-4 w-4"/>
                                                                Delete License
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalLicenses > 0 && (
                        <CardFooter className="flex items-center justify-between border-t px-6 py-4 mt-4">
                            <div className="text-sm text-muted-foreground">
                                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalLicenses)} of{" "}
                                {totalLicenses} keys
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4"/>
                                    <span className="sr-only">Previous Page</span>
                                </Button>
                                <div className="flex items-center gap-1">
                                    {Array.from({length: totalPages}, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => handlePageChange(page)}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4"/>
                                    <span className="sr-only">Next Page</span>
                                </Button>
                                <select
                                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                                    value={itemsPerPage.toString()}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value))
                                        setCurrentPage(1)
                                    }}
                                >
                                    <option value="5">5 per page</option>
                                    <option value="10">10 per page</option>
                                    <option value="20">20 per page</option>
                                </select>
                            </div>
                        </CardFooter>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit License Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>{selectedLicense ? "Edit License Key" : "Generate New License Key"}</DialogTitle>
                        <DialogDescription>
                            {selectedLicense ? "Update license key details." : "Configure and generate a new license key."}
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="basic" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basic" className="space-y-4 py-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="plan">License Plan</Label>
                                    <select
                                        id="plan"
                                        name="plan"
                                        value={newLicense.plan}
                                        onChange={handleInputChange}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        {plans.map((plan) => (
                                            <option key={plan.id} value={plan.id}>
                                                {plan.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="expiresAt">Expiration Date</Label>
                                    <Input
                                        id="expiresAt"
                                        name="expiresAt"
                                        type="date"
                                        value={newLicense.expiresAt}
                                        onChange={handleInputChange}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave blank for a non-expiring license key (not recommended)
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="maxUsages">Maximum Activations</Label>
                                    <Input
                                        id="maxUsages"
                                        name="maxUsages"
                                        type="number"
                                        min="0"
                                        value={newLicense.maxUsages}
                                        onChange={handleInputChange}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        How many times this license can be activated. Set to 0 for unlimited.
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Input
                                        id="notes"
                                        name="notes"
                                        value={newLicense.notes}
                                        onChange={handleInputChange}
                                        placeholder="Internal notes about this license"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="space-y-4 py-4">
                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="generateKey"
                                            name="generateKey"
                                            checked={newLicense.generateKey}
                                            onChange={handleCheckboxChange}
                                            className="rounded border-gray-300"
                                        />
                                        <div className={"flex "}>
                                            <Label htmlFor="generateKey" className="font-normal">
                                                Auto-generate license key
                                            </Label>


                                        </div>

                                    </div>
                                </div>

                                {!newLicense.generateKey && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="customKey">Custom License Key</Label>
                                        <select
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                            {plans.map((plan) => (
                                                <option key={plan.id} value={plan.id}>
                                                    {plan.name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            Custom format for your license key. Ensure it follows your validation rules.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    {newLicense.generateKey && !selectedLicense && (

                        <div className="bg-muted p-3 rounded-md">
                            <div className="flex items-center justify-between">

                                <div className="flex items-center">
                                    <Key className="h-4 w-4 mr-2 text-muted-foreground"/>
                                    <span className="text-sm font-medium">Preview:</span>
                                </div>
                                <span className="font-mono text-xs">{generateRandomKey()}</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                This is a preview. A unique key will be generated when you save.
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    {selectedLicense ? "Updating..." : "Generating..."}
                                </>
                            ) : selectedLicense ? (
                                "Update"
                            ) : (
                                "Generate"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bulk Action Dialog - Add Time */}
            <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add Time to Licenses</DialogTitle>
                        <DialogDescription>Extend the expiration date of the selected licenses.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="timeToAdd">Amount</Label>
                                <Input
                                    id="timeToAdd"
                                    type="number"
                                    min="1"
                                    value={timeToAdd}
                                    onChange={(e) => setTimeToAdd(Number(e.target.value))}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="timeUnit">Unit</Label>
                                <select
                                    id="timeUnit"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={timeUnit}
                                    onChange={(e) => setTimeUnit(e.target.value)}
                                >
                                    <option value="days">Days</option>
                                    <option value="months">Months</option>
                                    <option value="years">Years</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">
                                This will add {timeToAdd} {timeUnit} to {selectedLicenses.length} selected license(s).
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setBulkActionDialogOpen(false)}
                                disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={executeBulkAction} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Processing...
                                </>
                            ) : (
                                "Add Time"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Confirm Dialog for Destructive Actions */}
            <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedBulkAction?.name}</DialogTitle>
                        <DialogDescription>{selectedBulkAction?.confirmText}</DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4"/>
                            <AlertTitle>Warning</AlertTitle>
                            <AlertDescription>
                                This action cannot be undone. Users will lose access to these licenses immediately.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={executeBulkAction} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Processing...
                                </>
                            ) : (
                                "Confirm"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create User Dialog */}
            <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create User with License</DialogTitle>
                        <DialogDescription>Create a new user account and assign a license key.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="user@example.com"/>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" placeholder="John Doe"/>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="userExpiresAt">Expiration Date</Label>
                            <Input id="userExpiresAt" type="date"/>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setCreateUserDialogOpen(false)}
                                disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateUser} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Creating...
                                </>
                            ) : (
                                "Create User"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
