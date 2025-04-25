"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Calendar,
  Check,
  Copy,
  Edit,
  Key,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Clock,
  UserPlus,
  Ban,
  FileText,
  ShieldCheck,
  Filter,
  Download,
  Upload,
  CalendarPlus,
  Users,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

// Mock data for license keys
const licenseKeys = [
  {
    id: "lic_1",
    key: "KEYAUTH-1234-5678-9ABC-DEFG",
    plan: "Pro",
    status: "active",
    createdAt: "2023-06-15",
    expiresAt: "2024-06-15",
    usages: 0,
    maxUsages: 1,
    assignedTo: "john@example.com",
    notes: "Annual subscription",
    applicationId: "app_1",
  },
  {
    id: "lic_2",
    key: "KEYAUTH-2345-6789-ABCD-EFGH",
    plan: "Enterprise",
    status: "active",
    createdAt: "2023-05-20",
    expiresAt: "2024-05-20",
    usages: 1,
    maxUsages: 5,
    assignedTo: "acme-corp",
    notes: "Multi-seat license",
    applicationId: "app_1",
  },
  {
    id: "lic_3",
    key: "KEYAUTH-3456-7890-ABCD-EFGH",
    plan: "Basic",
    status: "expired",
    createdAt: "2023-01-10",
    expiresAt: "2023-07-10",
    usages: 1,
    maxUsages: 1,
    assignedTo: "alice@example.com",
    notes: "6-month trial",
    applicationId: "app_1",
  },
  {
    id: "lic_4",
    key: "KEYAUTH-4567-8901-ABCD-EFGH",
    plan: "Pro",
    status: "revoked",
    createdAt: "2023-03-05",
    expiresAt: "2024-03-05",
    usages: 0,
    maxUsages: 1,
    assignedTo: null,
    notes: "Revoked due to abuse",
    applicationId: "app_1",
  },
  {
    id: "lic_5",
    key: "KEYAUTH-5678-9012-ABCD-EFGH",
    plan: "Enterprise",
    status: "active",
    createdAt: "2023-07-01",
    expiresAt: "2025-07-01",
    usages: 3,
    maxUsages: 10,
    assignedTo: "globex-corp",
    notes: "2-year enterprise agreement",
    applicationId: "app_1",
  },
  {
    id: "lic_6",
    key: "KEYAUTH-6789-0123-ABCD-EFGH",
    plan: "Pro",
    status: "active",
    createdAt: "2023-08-15",
    expiresAt: "2024-08-15",
    usages: 1,
    maxUsages: 1,
    assignedTo: "bob@example.com",
    notes: "Annual subscription",
    applicationId: "app_1",
  },
  {
    id: "lic_7",
    key: "KEYAUTH-7890-1234-ABCD-EFGH",
    plan: "Basic",
    status: "active",
    createdAt: "2023-09-01",
    expiresAt: "2024-03-01",
    usages: 0,
    maxUsages: 1,
    assignedTo: "carol@example.com",
    notes: "6-month subscription",
    applicationId: "app_1",
  },
  {
    id: "lic_8",
    key: "KEYAUTH-8901-2345-ABCD-EFGH",
    plan: "Enterprise",
    status: "active",
    createdAt: "2023-10-10",
    expiresAt: "2025-10-10",
    usages: 5,
    maxUsages: 20,
    assignedTo: "initech-corp",
    notes: "2-year enterprise agreement",
    applicationId: "app_1",
  },
  {
    id: "lic_9",
    key: "KEYAUTH-9012-3456-ABCD-EFGH",
    plan: "Pro",
    status: "expired",
    createdAt: "2023-02-15",
    expiresAt: "2023-08-15",
    usages: 1,
    maxUsages: 1,
    assignedTo: "dave@example.com",
    notes: "Expired pro license",
    applicationId: "app_1",
  },
  {
    id: "lic_10",
    key: "KEYAUTH-0123-4567-ABCD-EFGH",
    plan: "Basic",
    status: "active",
    createdAt: "2023-11-05",
    expiresAt: "2024-11-05",
    usages: 0,
    maxUsages: 1,
    assignedTo: "eve@example.com",
    notes: "Annual basic subscription",
    applicationId: "app_1",
  },
]

// Plans for license keys
const plans = [
  { id: "basic", name: "Basic" },
  { id: "pro", name: "Pro" },
  { id: "enterprise", name: "Enterprise" },
]

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

export function LicensesTab({ appId }) {
  const [licenses, setLicenses] = useState(licenseKeys.filter((lic) => lic.applicationId === appId))
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
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [newLicense, setNewLicense] = useState({
    plan: "pro",
    expiresAt: "",
    maxUsages: 1,
    notes: "",
    generateKey: true,
    customKey: "",
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Reset to first page when changing filters
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, planFilter])

  // Filter license keys based on search query and filters
  const filteredLicenses = licenses.filter((license) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      license.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.notes.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === "all" || license.status === statusFilter

    // Plan filter
    const matchesPlan = planFilter === "all" || license.plan.toLowerCase() === planFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPlan
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredLicenses.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredLicenses.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
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
      plan: "pro",
      expiresAt: "",
      maxUsages: 1,
      notes: "",
      generateKey: true,
      customKey: "",
    })
    setOpen(true)
  }

  const handleSave = () => {
    // In a real app, this would call an API to save the license key
    setIsLoading(true)

    setTimeout(() => {
      if (selectedLicense) {
        // Update existing license
        setLicenses(
          licenses.map((lic) =>
            lic.id === selectedLicense.id
              ? {
                  ...lic,
                  plan: newLicense.plan.charAt(0).toUpperCase() + newLicense.plan.slice(1),
                  expiresAt: newLicense.expiresAt,
                  maxUsages: Number.parseInt(newLicense.maxUsages),
                  notes: newLicense.notes,
                  key: newLicense.generateKey ? generateRandomKey() : newLicense.customKey,
                }
              : lic,
          ),
        )
      } else {
        // Create new license
        const newId = `lic_${Date.now()}`
        const key = newLicense.generateKey ? generateRandomKey() : newLicense.customKey

        setLicenses([
          ...licenses,
          {
            id: newId,
            key,
            plan: newLicense.plan.charAt(0).toUpperCase() + newLicense.plan.slice(1),
            status: "active",
            createdAt: new Date().toISOString().split("T")[0],
            expiresAt: newLicense.expiresAt || "Never",
            usages: 0,
            maxUsages: Number.parseInt(newLicense.maxUsages),
            assignedTo: null,
            notes: newLicense.notes,
            applicationId: appId,
          },
        ])
      }

      setIsLoading(false)
      setOpen(false)

      toast({
        title: selectedLicense ? "License updated" : "License created",
        description: selectedLicense
          ? `The license has been updated successfully.`
          : `A new license has been created successfully.`,
      })
    }, 1000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewLicense((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setNewLicense((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setNewLicense((prev) => ({ ...prev, [name]: checked }))
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
            <Check className="mr-1 h-3 w-3" />
            Active
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="secondary" className="bg-amber-500 hover:bg-amber-600 text-white">
            <Calendar className="mr-1 h-3 w-3" />
            Expired
          </Badge>
        )
      case "revoked":
        return (
          <Badge variant="destructive">
            <X className="mr-1 h-3 w-3" />
            Revoked
          </Badge>
        )
      case "banned":
        return (
          <Badge variant="destructive" className="bg-red-700">
            <Ban className="mr-1 h-3 w-3" />
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

  const executeBulkAction = () => {
    if (!selectedBulkAction) return

    setIsLoading(true)

    setTimeout(() => {
      // In a real app, this would call an API to perform the bulk action
      if (selectedBulkAction.id === "add_time") {
        // Add time to selected licenses
        toast({
          title: "Time added to licenses",
          description: `Added ${timeToAdd} ${timeUnit} to ${selectedLicenses.length} licenses.`,
        })
      } else if (selectedBulkAction.id === "delete_selected") {
        // Delete selected licenses
        setLicenses(licenses.filter((lic) => !selectedLicenses.includes(lic.id)))
        toast({
          title: "Licenses deleted",
          description: `${selectedLicenses.length} licenses have been deleted.`,
        })
      } else if (selectedBulkAction.id === "delete_all") {
        // Delete all licenses
        setLicenses([])
        toast({
          title: "All licenses deleted",
          description: "All licenses have been deleted.",
        })
      } else if (selectedBulkAction.id === "delete_all_used") {
        // Delete all used licenses
        setLicenses(licenses.filter((lic) => lic.usages === 0))
        toast({
          title: "Used licenses deleted",
          description: "All used licenses have been deleted.",
        })
      } else if (selectedBulkAction.id === "delete_all_unused") {
        // Delete all unused licenses
        setLicenses(licenses.filter((lic) => lic.usages > 0))
        toast({
          title: "Unused licenses deleted",
          description: "All unused licenses have been deleted.",
        })
      }

      setIsLoading(false)
      setBulkActionDialogOpen(false)
      setConfirmDialogOpen(false)
      setSelectedBulkAction(null)
      setSelectedLicenses([])
    }, 1000)
  }

  const handleCreateUser = (data) => {
    // In a real app, this would call an API to create a user with a license
    setIsLoading(true)

    setTimeout(() => {
      toast({
        title: "User created",
        description: `A new user has been created with a license.`,
      })

      setIsLoading(false)
      setCreateUserDialogOpen(false)
    }, 1000)
  }

  const handleDeleteLicense = (licenseId) => {
    if (!hasPermission("license.delete")) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete licenses.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would call an API to delete the license
    setIsLoading(true)

    setTimeout(() => {
      setLicenses(licenses.filter((lic) => lic.id !== licenseId))

      toast({
        title: "License deleted",
        description: "The license has been deleted successfully.",
      })

      setIsLoading(false)
    }, 500)
  }

  const handleRevokeLicense = (licenseId) => {
    // In a real app, this would call an API to revoke the license
    setIsLoading(true)

    setTimeout(() => {
      setLicenses(licenses.map((lic) => (lic.id === licenseId ? { ...lic, status: "revoked" } : lic)))

      toast({
        title: "License revoked",
        description: "The license has been revoked successfully.",
      })

      setIsLoading(false)
    }, 500)
  }

  const handleBanLicense = (licenseId) => {
    if (!hasPermission("license.blacklist")) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to ban licenses.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would call an API to ban the license
    setIsLoading(true)

    setTimeout(() => {
      setLicenses(licenses.map((lic) => (lic.id === licenseId ? { ...lic, status: "banned" } : lic)))

      toast({
        title: "License banned",
        description: "The license has been banned successfully.",
      })

      setIsLoading(false)
    }, 500)
  }

  const handleUnbanLicense = (licenseId) => {
    if (!hasPermission("license.unban")) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to unban licenses.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would call an API to unban the license
    setIsLoading(true)

    setTimeout(() => {
      setLicenses(licenses.map((lic) => (lic.id === licenseId ? { ...lic, status: "active" } : lic)))

      toast({
        title: "License unbanned",
        description: "The license has been unbanned successfully.",
      })

      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">License Keys</h2>
          <p className="text-muted-foreground">Manage license keys for user authentication and access control</p>
        </div>
        {hasPermission("license.create") && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Generate License Key
          </Button>
        )}
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
                        <Key className="mr-2 h-4 w-4" />
                        Create New License
                      </Button>
                      <Button
                        className="w-full justify-start"
                        onClick={() => handleBulkAction("create_user")}
                        disabled={!hasPermission("license.create_user")}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
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
                        <CalendarPlus className="mr-2 h-4 w-4" />
                        Add Time to Selected
                      </Button>
                      <Button className="w-full justify-start" variant="outline" onClick={() => {}}>
                        <Download className="mr-2 h-4 w-4" />
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
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedLicenses.length})
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="w-full justify-between" variant="outline">
                            <div className="flex items-center">
                              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                              Bulk Delete Options
                            </div>
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>Danger Zone</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleBulkAction("delete_all_unused")}
                            disabled={!hasPermission("license.delete_all_unused")}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete All Unused
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleBulkAction("delete_all_used")}
                            disabled={!hasPermission("license.delete_all_used")}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete All Used
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleBulkAction("delete_all")}
                            disabled={!hasPermission("license.delete_all")}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
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
                        <Label>License Plan</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="basic">Basic</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Expiration</Label>
                        <Input type="date" />
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleBulkAction("create_license")}
                        disabled={!hasPermission("license.create")}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Generate License Key
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Create User with License</CardTitle>
                      <CardDescription>Create a new user account with a license key</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="user@example.com" />
                      </div>
                      <div className="grid gap-2">
                        <Label>License Plan</Label>
                        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                          <option value="basic">Basic</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => handleBulkAction("create_user")}
                        disabled={!hasPermission("license.create_user")}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
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
                          <Input type="number" min="1" defaultValue="30" />
                        </div>
                        <div>
                          <Label>Unit</Label>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
                          <Clock className="mr-2 h-4 w-4" />
                          Add to Selected
                        </Button>
                        <Button variant="outline" disabled={!hasPermission("license.add_time_all_used")}>
                          <Users className="mr-2 h-4 w-4" />
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
                        <Download className="mr-2 h-4 w-4" />
                        Export Licenses (CSV)
                      </Button>
                      <Button className="w-full" variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
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
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Warning</AlertTitle>
                      <AlertDescription>
                        Deleting licenses is permanent and cannot be undone. Users will lose access immediately.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleBulkAction("delete_selected")}
                        disabled={!hasPermission("license.delete_multiple") || selectedLicenses.length === 0}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Selected ({selectedLicenses.length})
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                        onClick={() => handleBulkAction("delete_all_unused")}
                        disabled={!hasPermission("license.delete_all_unused")}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete All Unused
                      </Button>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                        onClick={() => handleBulkAction("delete_all_used")}
                        disabled={!hasPermission("license.delete_all_used")}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete All Used
                      </Button>
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                        onClick={() => handleBulkAction("delete_all")}
                        disabled={!hasPermission("license.delete_all")}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
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
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Licenses</DropdownMenuLabel>
                <DropdownMenuSeparator />
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
                <DropdownMenuSeparator />
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
            {isLoading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Processing...</p>
                </div>
              </div>
            )}

            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={currentItems.length > 0 && selectedLicenses.length === currentItems.length}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLicenses(currentItems.map((lic) => lic.id))
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
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No license keys found. Try adjusting your filters or create a new license key.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((license) => (
                    <TableRow key={license.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
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
                            <Copy className="h-3 w-3" />
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
                          <span className="text-sm text-muted-foreground italic">Unassigned</span>
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
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(license)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit License
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => copyToClipboard(license.key)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Key
                            </DropdownMenuItem>
                            {license.status === "active" && (
                              <DropdownMenuItem onClick={() => handleRevokeLicense(license.id)}>
                                <X className="mr-2 h-4 w-4" />
                                Revoke License
                              </DropdownMenuItem>
                            )}
                            {license.status === "active" && hasPermission("license.blacklist") && (
                              <DropdownMenuItem onClick={() => handleBanLicense(license.id)}>
                                <Ban className="mr-2 h-4 w-4" />
                                Ban License
                              </DropdownMenuItem>
                            )}
                            {license.status === "banned" && hasPermission("license.unban") && (
                              <DropdownMenuItem onClick={() => handleUnbanLicense(license.id)}>
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                Unban License
                              </DropdownMenuItem>
                            )}
                            {license.status === "revoked" && (
                              <DropdownMenuItem>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reactivate License
                              </DropdownMenuItem>
                            )}
                            {hasPermission("license.set_note") && (
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Edit Notes
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {hasPermission("license.delete") && (
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteLicense(license.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
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
          {filteredLicenses.length > 0 && (
            <CardFooter className="flex items-center justify-between border-t px-6 py-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLicenses.length)} of{" "}
                {filteredLicenses.length} keys
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Previous Page</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                  <ChevronRight className="h-4 w-4" />
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
                    min="1"
                    value={newLicense.maxUsages}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    name="notes"
                    type="text"
                    placeholder="License notes"
                    value={newLicense.notes}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="generateKey">Generate Key</Label>
                  <Checkbox
                    id="generateKey"
                    name="generateKey"
                    checked={newLicense.generateKey}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <p className="text-xs text-muted-foreground">If unchecked, you must provide a custom license key.</p>
                </div>

                {!newLicense.generateKey && (
                  <div className="grid gap-2">
                    <Label htmlFor="customKey">Custom License Key</Label>
                    <Input
                      id="customKey"
                      name="customKey"
                      type="text"
                      placeholder="Enter custom license key"
                      value={newLicense.customKey}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  Saving...
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                "Save License"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedBulkAction?.name}</DialogTitle>
            <DialogDescription>{selectedBulkAction?.description}</DialogDescription>
          </DialogHeader>

          {selectedBulkAction?.id === "add_time" && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="timeToAdd">Amount</Label>
                  <Input
                    id="timeToAdd"
                    type="number"
                    min="1"
                    value={timeToAdd}
                    onChange={(e) => setTimeToAdd(Number(e.target.value))}
                  />
                </div>
                <div>
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
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setBulkActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={executeBulkAction} disabled={isLoading}>
              {isLoading ? (
                <>
                  Processing...
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                "Execute Action"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>{selectedBulkAction?.confirmText}</DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={executeBulkAction} disabled={isLoading}>
              {isLoading ? (
                <>
                  Deleting...
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                "Delete Licenses"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createUserDialogOpen} onOpenChange={setCreateUserDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create User with License</DialogTitle>
            <DialogDescription>Create a new user account and assign a license key.</DialogDescription>
          </DialogHeader>

          <CreateUserForm
            onSubmit={handleCreateUser}
            onCancel={() => setCreateUserDialogOpen(false)}
            isLoading={isLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CreateUserForm({ onSubmit, onCancel, isLoading }) {
  const [email, setEmail] = useState("")
  const [plan, setPlan] = useState("basic")

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ email, plan })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="plan">License Plan</Label>
        <select
          id="plan"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
        >
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              Creating...
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            "Create User"
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}
