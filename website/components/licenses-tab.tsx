"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Loader2,
  Search,
  Shield,
  Plus,
  RefreshCw,
  Copy,
  MoreHorizontal,
  Clock,
  User,
  Calendar,
  Trash,
  Key,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useTeam } from "@/contexts/team-context"
import { EmptyState } from "./empty-state"

export function LicensesTab({ appId }) {
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const { selectedTeam } = useTeam()

  useEffect(() => {
    fetchLicenses()
  }, [appId, selectedTeam])

  const fetchLicenses = async () => {
    if (!selectedTeam || !appId) return

    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${appId}/licenses`)

      if (!response.ok) {
        throw new Error(`Failed to fetch licenses: ${response.status}`)
      }

      const data = await response.json()
      setLicenses(data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch licenses:", err)
      setError("Failed to load licenses")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast({
      title: `${label} copied to clipboard`,
      description: "The value has been copied to your clipboard.",
      duration: 2000,
    })
  }

  // Filter licenses based on search query
  const filteredLicenses = licenses.filter((license) => {
    return (
      searchQuery === "" ||
      license.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      license.status.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>License Keys</CardTitle>
          <CardDescription>Manage license keys for this application</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLicenses}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create License
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative flex-1 my-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search licenses..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading licenses...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
            <Shield className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : filteredLicenses.length === 0 ? (
          <EmptyState
            title="No licenses found"
            description="Create your first license key to get started."
            icon={<Key className="h-10 w-10 text-muted-foreground" />}
            action={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create License
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>License Key</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.map((license) => (
                <TableRow key={license.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs truncate max-w-[140px]">{license.key}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(license.key, "License key")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        license.status === "active"
                          ? "default"
                          : license.status === "expired"
                            ? "destructive"
                            : "secondary"
                      }
                      className="capitalize"
                    >
                      {license.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {license.userId ? (
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        {license.userId}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">{new Date(license.createdAt).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      {license.expiresAt ? (
                        <div className="text-sm">{new Date(license.expiresAt).toLocaleDateString()}</div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Never</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {license.usageCount || 0}/{license.maxUsages || "∞"}
                    </Badge>
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
                        <DropdownMenuItem onClick={() => copyToClipboard(license.key, "License key")}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy License Key
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <User className="mr-2 h-4 w-4" />
                          Assign to User
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete License
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
