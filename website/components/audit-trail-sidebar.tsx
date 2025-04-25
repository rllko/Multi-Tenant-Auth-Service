"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Search, Clock, Download } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// Mock audit log data
const auditLogEntries = [
  {
    id: "log_1",
    timestamp: "2023-06-15T14:30:00Z",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Added user Alice Brown to Acme Inc. with Viewer role",
    tenantId: "tenant_1",
    tenantName: "Acme Inc.",
    tenantColor: "#4f46e5",
    resourceType: "user",
  },
  {
    id: "log_2",
    timestamp: "2023-06-14T10:15:00Z",
    user: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Changed Bob Johnson's role from Viewer to Admin in Globex Corporation",
    tenantId: "tenant_2",
    tenantName: "Globex Corporation",
    tenantColor: "#0ea5e9",
    resourceType: "user",
  },
  {
    id: "log_3",
    timestamp: "2023-06-13T16:45:00Z",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Removed Charlie Wilson from Initech",
    tenantId: "tenant_3",
    tenantName: "Initech",
    tenantColor: "#10b981",
    resourceType: "user",
  },
  {
    id: "log_4",
    timestamp: "2023-06-12T09:20:00Z",
    user: {
      name: "System",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Invited Diana Prince to Acme Inc. with Editor role",
    tenantId: "tenant_1",
    tenantName: "Acme Inc.",
    tenantColor: "#4f46e5",
    resourceType: "user",
  },
  {
    id: "log_5",
    timestamp: "2023-06-11T11:30:00Z",
    user: {
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Created new OAuth client 'Discord Bot'",
    tenantId: "tenant_1",
    tenantName: "Acme Inc.",
    tenantColor: "#4f46e5",
    resourceType: "oauth",
  },
  {
    id: "log_6",
    timestamp: "2023-06-10T08:45:00Z",
    user: {
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Updated scopes for 'Web Dashboard' client",
    tenantId: "tenant_2",
    tenantName: "Globex Corporation",
    tenantColor: "#0ea5e9",
    resourceType: "oauth",
  },
  {
    id: "log_7",
    timestamp: "2023-06-09T15:20:00Z",
    user: {
      name: "System",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    action: "Rotated secret for 'API Gateway' client",
    tenantId: "tenant_3",
    tenantName: "Initech",
    tenantColor: "#10b981",
    resourceType: "oauth",
  },
]

interface AuditTrailSidebarProps {
  onClose: () => void
}

export function AuditTrailSidebar({ onClose }: AuditTrailSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [resourceFilter, setResourceFilter] = useState("all")
  const [tenantFilter, setTenantFilter] = useState("all")

  // Filter audit log entries
  const filteredEntries = auditLogEntries.filter((entry) => {
    const matchesSearch =
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.user.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesResource = resourceFilter === "all" || entry.resourceType === resourceFilter

    const matchesTenant = tenantFilter === "all" || entry.tenantId === tenantFilter

    return matchesSearch && matchesResource && matchesTenant
  })

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold">Audit Trail</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search audit logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Resource Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Resources</SelectItem>
              <SelectItem value="user">Team Members</SelectItem>
              <SelectItem value="oauth">OAuth Clients</SelectItem>
            </SelectContent>
          </Select>

          <Select value={tenantFilter} onValueChange={setTenantFilter}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Tenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tenants</SelectItem>
              <SelectItem value="tenant_1">Acme Inc.</SelectItem>
              <SelectItem value="tenant_2">Globex Corporation</SelectItem>
              <SelectItem value="tenant_3">Initech</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No audit logs found matching your filters.</div>
          ) : (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.user.avatar || "/placeholder.svg"} alt={entry.user.name} />
                    <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm">{entry.action}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{formatRelativeTime(entry.timestamp)}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full mr-1" style={{ backgroundColor: entry.tenantColor }} />
                        <span>{entry.tenantName}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Audit Logs
        </Button>
      </div>
    </div>
  )
}
