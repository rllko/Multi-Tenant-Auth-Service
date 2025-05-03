"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Shield, Plus, RefreshCw, Copy, MoreHorizontal, Clock, Trash } from "lucide-react"
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

export function OAuthClientsTab({ appId }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const { selectedTeam } = useTeam()

  useEffect(() => {
    fetchClients()
  }, [appId, selectedTeam])

  const fetchClients = async () => {
    if (!selectedTeam || !appId) return

    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${appId}/oauth-clients`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch OAuth clients: ${response.status}`)
      }

      const data = await response.json()
      setClients(data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch OAuth clients:", err)
      setError("Failed to load OAuth clients")
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

  // Filter clients based on search query
  const filteredClients = clients.filter((client) => {
    return (
      searchQuery === "" ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.clientId.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>OAuth Clients</CardTitle>
          <CardDescription>Manage OAuth clients for this application</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchClients}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Client
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative flex-1 my-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading OAuth clients...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
            <Shield className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <EmptyState
            title="No OAuth clients found"
            description="Create your first OAuth client to get started."
            icon={<Shield className="h-10 w-10 text-muted-foreground" />}
            action={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Client
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Client ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs truncate max-w-[140px]">{client.clientId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(client.clientId, "Client ID")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {client.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.status === "active" ? "default" : "secondary"} className="capitalize">
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">{new Date(client.createdAt).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{client.lastUsed || "Never"}</TableCell>
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
                        <DropdownMenuItem onClick={() => copyToClipboard(client.clientId, "Client ID")}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Client ID
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          Manage Permissions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Client
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
