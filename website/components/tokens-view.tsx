"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, Trash, Eye, Clock, User, Bot, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// Mock tokens data
const tokensData = [
  {
    id: "token_1",
    clientId: "client_1a2b3c4d5e6f7g8h9i",
    clientName: "Web Dashboard",
    userId: "user_1",
    userName: "John Doe",
    userEmail: "john@example.com",
    scopes: ["user.read", "license.read"],
    issuedAt: "2023-09-15T14:32:21Z",
    expiresAt: "2023-09-16T14:32:21Z",
    lastUsed: "2023-09-15T15:45:10Z",
    status: "active",
    type: "access_token",
  },
  {
    id: "token_2",
    clientId: "client_2a3b4c5d6e7f8g9h0i",
    clientName: "Discord Bot",
    userId: "user_2",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    scopes: ["user.read", "user.write", "license.read", "license.write"],
    issuedAt: "2023-09-14T10:15:33Z",
    expiresAt: "2023-09-15T10:15:33Z",
    lastUsed: "2023-09-14T18:22:45Z",
    status: "expired",
    type: "access_token",
  },
  {
    id: "token_3",
    clientId: "client_1a2b3c4d5e6f7g8h9i",
    clientName: "Web Dashboard",
    userId: "user_3",
    userName: "Bob Johnson",
    userEmail: "bob@example.com",
    scopes: ["user.read", "license.read"],
    issuedAt: "2023-09-15T09:45:12Z",
    expiresAt: "2023-10-15T09:45:12Z",
    lastUsed: "2023-09-15T11:30:22Z",
    status: "active",
    type: "refresh_token",
  },
  {
    id: "token_4",
    clientId: "client_3a4b5c6d7e8f9g0h1i",
    clientName: "License Manager Bot",
    userId: "user_1",
    userName: "John Doe",
    userEmail: "john@example.com",
    scopes: ["license.read", "license.write", "license.delete", "license.admin"],
    issuedAt: "2023-09-10T16:20:45Z",
    expiresAt: "2023-09-11T16:20:45Z",
    lastUsed: "2023-09-10T17:15:30Z",
    status: "revoked",
    type: "access_token",
  },
  {
    id: "token_5",
    clientId: "client_4a5b6c7d8e9f0g1h2i",
    clientName: "Legacy System",
    userId: "user_4",
    userName: "Alice Brown",
    userEmail: "alice@example.com",
    scopes: ["user.read"],
    issuedAt: "2023-09-12T11:10:33Z",
    expiresAt: "2023-09-13T11:10:33Z",
    lastUsed: "2023-09-12T14:25:18Z",
    status: "expired",
    type: "access_token",
  },
  {
    id: "token_6",
    clientId: "client_5a6b7c8d9e0f1g2h3i",
    clientName: "Mobile App",
    userId: "user_2",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    scopes: ["user.read", "user.write", "license.read"],
    issuedAt: "2023-09-14T08:30:15Z",
    expiresAt: "2023-10-14T08:30:15Z",
    lastUsed: "2023-09-15T09:45:22Z",
    status: "active",
    type: "refresh_token",
  },
]

export function TokensView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedToken, setSelectedToken] = useState(null)
  const [tokenDetailsOpen, setTokenDetailsOpen] = useState(false)

  // Filter tokens
  const filteredTokens = tokensData.filter((token) => {
    const matchesSearch =
      searchQuery === "" ||
      token.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.userEmail.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || token.status === statusFilter

    const matchesType = typeFilter === "all" || token.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewToken = (token) => {
    setSelectedToken(token)
    setTokenDetailsOpen(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500 hover:bg-green-600"
      case "expired":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "revoked":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>OAuth Tokens</CardTitle>
          <CardDescription>Manage active OAuth tokens and monitor their usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search tokens..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="access_token">Access Token</SelectItem>
                  <SelectItem value="refresh_token">Refresh Token</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No tokens found matching your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTokens.map((token) => (
                    <TableRow key={token.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-primary" />
                          <div>
                            <div className="font-medium">{token.clientName}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">{token.clientId}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{token.userName}</div>
                            <div className="text-xs text-muted-foreground">{token.userEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {token.type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className={getStatusColor(token.status)}>
                          {token.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatDate(token.issuedAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatDate(token.expiresAt)}</span>
                        </div>
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
                            <DropdownMenuItem onClick={() => handleViewToken(token)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="h-4 w-4 mr-2" />
                              Revoke Token
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
        </CardContent>
      </Card>

      {/* Token Details Dialog */}
      <Dialog open={tokenDetailsOpen} onOpenChange={setTokenDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Token Details</DialogTitle>
            <DialogDescription>Detailed information about the selected token</DialogDescription>
          </DialogHeader>
          {selectedToken && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Client</h4>
                  <p className="font-medium">{selectedToken.clientName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">User</h4>
                  <p className="font-medium">{selectedToken.userName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Type</h4>
                  <Badge variant="outline" className="capitalize">
                    {selectedToken.type.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <Badge variant="default" className={getStatusColor(selectedToken.status)}>
                    {selectedToken.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Issued At</h4>
                  <p className="text-sm">{formatDate(selectedToken.issuedAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Expires At</h4>
                  <p className="text-sm">{formatDate(selectedToken.expiresAt)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Scopes</h4>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedToken.scopes.map((scope) => (
                    <Badge key={scope} variant="secondary" className="capitalize">
                      <Shield className="h-3 w-3 mr-1" />
                      {scope.replace(".", ":")}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Token ID</h4>
                <div className="font-mono text-xs bg-muted p-2 rounded-md truncate">{selectedToken.id}</div>
              </div>

              <div className="pt-2">
                <Button variant="destructive" className="w-full">
                  <Trash className="h-4 w-4 mr-2" />
                  Revoke Token
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
