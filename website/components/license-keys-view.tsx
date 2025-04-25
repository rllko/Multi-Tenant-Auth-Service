"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  ArrowLeft,
  Globe,
  Loader2,
  Filter,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ApplicationSelector } from "./application-selector"
import { useToast } from "@/hooks/use-toast"
import {
  getLicenseKeys,
  createLicenseKey,
  updateLicenseKey,
  deleteLicenseKey,
  revokeLicenseKey,
  banLicenseKey,
  unbanLicenseKey,
} from "@/lib/api-service"
import type { LicenseKey } from "@/lib/schemas"

// Mock data for organizations and applications
const organizations = [
  { id: "org-1", name: "Acme Corp" },
  { id: "org-2", name: "Beta Inc" },
]

const applications = [
  { id: "app-1", name: "KeyAuth Desktop", organizationId: "org-1" },
  { id: "app-2", name: "KeyAuth Mobile", organizationId: "org-1" },
  { id: "app-3", name: "Gamma App", organizationId: "org-2" },
]

// Plans for license keys
const plans = [
  { id: "basic", name: "Basic" },
  { id: "pro", name: "Pro" },
  { id: "enterprise", name: "Enterprise" },
]

export function LicenseKeysView() {
  const [licenses, setLicenses] = useState<LicenseKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<LicenseKey | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0])
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null)
  const { toast } = useToast()
  const [newKey, setNewKey] = useState({
    plan: "pro",
    expiresAt: "",
    maxUsages: 1,
    notes: "",
    generateKey: true,
    customKey: "",
    organization: selectedOrganization.name,
    applicationId: "",
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Reset to first page when changing filters
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, planFilter, selectedApplicationId])

  // Fetch license keys when component mounts or application ID changes
  useEffect(() => {
    const fetchLicenseKeys = async () => {
      try {
        setLoading(true)
        const response = await getLicenseKeys(selectedApplicationId || undefined)
        if (response.success && response.data) {
          setLicenses(response.data)
        } else {
          setError("Failed to fetch license keys")
        }
      } catch (err) {
        setError("An error occurred while fetching license keys")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchLicenseKeys()
  }, [selectedApplicationId])

  // Get the selected application
  const selectedApplication = applications.find((app) => app.id === selectedApplicationId)

  // Filter license keys based on search query, filters, selected organization, and application
  const filteredKeys = licenses.filter((key) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      key.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      key.notes.toLowerCase().includes(searchQuery.toLowerCase())

    // Status filter
    const matchesStatus = statusFilter === "all" || key.status === statusFilter

    // Plan filter
    const matchesPlan = planFilter === "all" || key.plan.toLowerCase() === planFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPlan
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredKeys.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredKeys.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleEdit = (key: LicenseKey) => {
    setSelectedKey(key)
    setNewKey({
      plan: key.plan.toLowerCase(),
      expiresAt: key.expiresAt || "",
      maxUsages: key.maxUsages,
      notes: key.notes || "",
      generateKey: false,
      customKey: key.key,
      organization: key.organization || selectedOrganization.name,
      applicationId: key.applicationId,
    })
    setOpen(true)
  }

  const handleCreate = () => {
    setSelectedKey(null)
    setNewKey({
      plan: "pro",
      expiresAt: "",
      maxUsages: 1,
      notes: "",
      generateKey: true,
      customKey: "",
      organization: selectedOrganization.name,
      applicationId: selectedApplicationId || "",
    })
    setOpen(true)
  }

  const handleSave = async () => {
    try {
      setLoading(true)

      if (selectedKey) {
        // Update existing license
        const response = await updateLicenseKey(selectedKey.id, {
          plan: newKey.plan,
          expiresAt: newKey.expiresAt || undefined,
          maxUsages: Number(newKey.maxUsages),
          notes: newKey.notes,
          key: newKey.generateKey ? undefined : newKey.customKey,
        })

        if (response.success && response.data) {
          setLicenses(licenses.map((lic) => (lic.id === selectedKey.id ? response.data : lic)))
          toast({
            title: "License updated",
            description: "The license has been updated successfully.",
          })
        }
      } else {
        // Create new license
        const response = await createLicenseKey({
          key: newKey.generateKey ? undefined : newKey.customKey,
          plan: newKey.plan,
          status: "active",
          expiresAt: newKey.expiresAt || undefined,
          usages: 0,
          maxUsages: Number(newKey.maxUsages),
          assignedTo: null,
          notes: newKey.notes,
          applicationId: selectedApplicationId || "",
        })

        if (response.success && response.data) {
          setLicenses([response.data, ...licenses])
          toast({
            title: "License created",
            description: "A new license has been created successfully.",
          })
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save license",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewKey((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name, value) => {
    setNewKey((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target
    setNewKey((prev) => ({ ...prev, [name]: checked }))
  }

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org)
    setSelectedApplicationId(null)
    setNewKey({
      ...newKey,
      organization: org.name,
      applicationId: "",
    })
    // Reset to first page when changing organization
    setCurrentPage(1)
  }

  const handleApplicationSelect = (appId) => {
    setSelectedApplicationId(appId)
    setNewKey({
      ...newKey,
      applicationId: appId,
    })
  }

  const handleBackToApplications = () => {
    setSelectedApplicationId(null)
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
    })
  }

  const handleDeleteLicense = async (licenseId) => {
    try {
      setLoading(true)
      const response = await deleteLicenseKey(licenseId)
      if (response.success) {
        setLicenses(licenses.filter((lic) => lic.id !== licenseId))
        toast({
          title: "License deleted",
          description: "The license has been deleted successfully.",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete license",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeLicense = async (licenseId) => {
    try {
      setLoading(true)
      const response = await revokeLicenseKey(licenseId)
      if (response.success && response.data) {
        setLicenses(licenses.map((lic) => (lic.id === licenseId ? response.data : lic)))
        toast({
          title: "License revoked",
          description: "The license has been revoked successfully.",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to revoke license",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleBanLicense = async (licenseId) => {
    try {
      setLoading(true)
      const response = await banLicenseKey(licenseId)
      if (response.success && response.data) {
        setLicenses(licenses.map((lic) => (lic.id === licenseId ? response.data : lic)))
        toast({
          title: "License banned",
          description: "The license has been banned successfully.",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to ban license",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUnbanLicense = async (licenseId) => {
    try {
      setLoading(true)
      const response = await unbanLicenseKey(licenseId)
      if (response.success && response.data) {
        setLicenses(licenses.map((lic) => (lic.id === licenseId ? response.data : lic)))
        toast({
          title: "License unbanned",
          description: "The license has been unbanned successfully.",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to unban license",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
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
            <X className="mr-1 h-3 w-3" />
            Banned
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  // If no application is selected, show the application selector
  if (!selectedApplicationId) {
    return (
      <ApplicationSelector
        onApplicationSelect={handleApplicationSelect}
        selectedOrganization={selectedOrganization}
        onOrganizationChange={handleOrganizationChange}
      />
    )
  }

  if (loading && licenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading license keys...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Application Context Banner */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-medium">Application Context</h3>
                <p className="text-sm text-muted-foreground">
                  Managing license keys for <span className="font-medium">{selectedApplication?.name}</span> in{" "}
                  <span className="font-medium">{selectedOrganization.name}</span>
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleBackToApplications}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Applications
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">License Keys</h2>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Generate License Key
        </Button>
      </div>

      <Card className="shadow-sm border-border bg-white dark:bg-[#1E1E1E]">
        <CardHeader className="flex flex-row items-center border-b">
          <div className="space-y-1.5">
            <CardTitle>License Keys</CardTitle>
            <CardDescription>Generate and manage license keys for {selectedApplication?.name}.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 mt-4">
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
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Status</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Plan</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  {plans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow>
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
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No license keys found. Try adjusting your filters or create a new license key.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((license) => (
                    <TableRow key={license.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
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
                      <TableCell>{license.expiresAt || "Never"}</TableCell>
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
                            {license.status === "active" && (
                              <DropdownMenuItem onClick={() => handleBanLicense(license.id)}>
                                <X className="mr-2 h-4 w-4" />
                                Ban License
                              </DropdownMenuItem>
                            )}
                            {license.status === "banned" && (
                              <DropdownMenuItem onClick={() => handleUnbanLicense(license.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                Unban License
                              </DropdownMenuItem>
                            )}
                            {license.status === "revoked" && (
                              <DropdownMenuItem>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Reactivate License
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteLicense(license.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete License
                            </DropdownMenuItem>
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
          {filteredKeys.length > 0 && (
            <CardFooter className="flex items-center justify-between border-t px-6 py-4 mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredKeys.length)} of {filteredKeys.length}{" "}
                keys
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
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-[110px]">
                    <span>{itemsPerPage} per page</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardFooter>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit License Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{selectedKey ? "Edit License Key" : "Generate New License Key"}</DialogTitle>
            <DialogDescription>
              {selectedKey ? "Update license key details." : "Configure and generate a new license key."}
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
                  <Select value={newKey.plan} onValueChange={(value) => handleSelectChange("plan", value)}>
                    <SelectTrigger id="plan">
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="expiresAt">Expiration Date</Label>
                  <Input
                    id="expiresAt"
                    name="expiresAt"
                    type="date"
                    value={newKey.expiresAt}
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
                    value={newKey.maxUsages}
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
                    value={newKey.notes}
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
                      checked={newKey.generateKey}
                      onChange={handleCheckboxChange}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="generateKey" className="font-normal">
                      Auto-generate license key
                    </Label>
                  </div>
                </div>

                {!newKey.generateKey && (
                  <div className="grid gap-2">
                    <Label htmlFor="customKey">Custom License Key</Label>
                    <Input
                      id="customKey"
                      name="customKey"
                      value={newKey.customKey}
                      onChange={handleInputChange}
                      placeholder="Enter custom license key"
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      Custom format for your license key. Ensure it follows your validation rules.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {newKey.generateKey && !selectedKey && (
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Key className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium">Preview:</span>
                </div>
                <span className="font-mono text-xs">{generateRandomKey()}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This is a preview. A unique key will be generated when you save.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {selectedKey ? "Updating..." : "Generating..."}
                </>
              ) : selectedKey ? (
                "Update"
              ) : (
                "Generate"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
