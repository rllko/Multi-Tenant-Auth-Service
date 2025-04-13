"use client"

import { useState } from "react"
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
  Filter,
  Key,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Trash,
  X,
  Building,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for organizations
const organizations = [
  { id: "org_1", name: "Acme Inc.", members: 12 },
  { id: "org_2", name: "Globex Corporation", members: 8 },
  { id: "org_3", name: "Initech", members: 5 },
]

// Add organization property to license keys
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
    organization: "Acme Inc.",
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
    organization: "Acme Inc.",
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
    organization: "Globex Corporation",
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
    organization: "Acme Inc.",
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
    organization: "Initech",
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
    organization: "Acme Inc.",
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
    organization: "Acme Inc.",
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
    organization: "Initech",
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
    organization: "Globex Corporation",
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
    organization: "Acme Inc.",
  },
]

// Plans for license keys
const plans = [
  { id: "basic", name: "Basic" },
  { id: "pro", name: "Pro" },
  { id: "enterprise", name: "Enterprise" },
]

export function LicenseKeysView() {
  const [open, setOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [planFilter, setPlanFilter] = useState("all")
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0])
  const [newKey, setNewKey] = useState({
    plan: "pro",
    expiresAt: "",
    maxUsages: 1,
    notes: "",
    generateKey: true,
    customKey: "",
    organization: selectedOrganization.name,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Filter license keys based on search query, filters, and selected organization
  const filteredKeys = licenseKeys.filter((key) => {
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

    // Organization filter
    const matchesOrg = key.organization === selectedOrganization.name

    return matchesSearch && matchesStatus && matchesPlan && matchesOrg
  })

  // Calculate pagination
  const totalPages = Math.ceil(filteredKeys.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredKeys.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const handleEdit = (key) => {
    setSelectedKey(key)
    setNewKey({
      plan: key.plan.toLowerCase(),
      expiresAt: key.expiresAt,
      maxUsages: key.maxUsages,
      notes: key.notes,
      generateKey: false,
      customKey: key.key,
      organization: key.organization,
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
    })
    setOpen(true)
  }

  const handleSave = () => {
    // In a real app, this would call an API to save the license key
    console.log("Saving license key:", selectedKey ? "update" : "create", newKey)
    setOpen(false)
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
    setNewKey({
      ...newKey,
      organization: org.name,
    })
    // Reset to first page when changing organization
    setCurrentPage(1)
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
    // In a real app, you would show a toast notification here
    console.log("Copied to clipboard:", text)
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
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Organization Context Banner */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Organization Context</h3>
              <p className="text-sm text-muted-foreground">
                Managing license keys for <span className="font-medium">{selectedOrganization.name}</span>
              </p>
            </div>
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

      <Card className="shadow-sm border-border bg-white">
        <CardHeader className="flex flex-row items-center border-b">
          <div className="space-y-1.5">
            <CardTitle>License Keys</CardTitle>
            <CardDescription>Generate and manage license keys for your applications.</CardDescription>
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

          <Table>
            <TableHeader className="bg-gray-50">
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
                currentItems.map((key) => (
                  <TableRow key={key.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs">{key.key}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(key.key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {key.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(key.status)}</TableCell>
                    <TableCell>
                      {key.assignedTo ? (
                        <span className="text-sm">{key.assignedTo}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>{key.expiresAt}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {key.usages} / {key.maxUsages === 0 ? "∞" : key.maxUsages}
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
                          <DropdownMenuItem onClick={() => handleEdit(key)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit License
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(key.key)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Key
                          </DropdownMenuItem>
                          {key.status === "active" && (
                            <DropdownMenuItem>
                              <X className="mr-2 h-4 w-4" />
                              Revoke License
                            </DropdownMenuItem>
                          )}
                          {key.status === "revoked" && (
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Reactivate License
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
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
                  <Label htmlFor="organization">Organization</Label>
                  <select
                    id="organization"
                    name="organization"
                    value={newKey.organization}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.name}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

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

                <div className="grid gap-2">
                  <Label>Features</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="feature_1" className="rounded border-gray-300" defaultChecked />
                      <Label htmlFor="feature_1" className="font-normal">
                        Core Features
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="feature_2" className="rounded border-gray-300" defaultChecked />
                      <Label htmlFor="feature_2" className="font-normal">
                        API Access
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="feature_3" className="rounded border-gray-300" />
                      <Label htmlFor="feature_3" className="font-normal">
                        Premium Support
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="feature_4" className="rounded border-gray-300" />
                      <Label htmlFor="feature_4" className="font-normal">
                        White Labeling
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Hardware Binding</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="bind_device" className="rounded border-gray-300" />
                      <Label htmlFor="bind_device" className="font-normal">
                        Bind to device
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="bind_ip" className="rounded border-gray-300" />
                      <Label htmlFor="bind_ip" className="font-normal">
                        Bind to IP address
                      </Label>
                    </div>
                  </div>
                </div>
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
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>{selectedKey ? "Update" : "Generate"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
