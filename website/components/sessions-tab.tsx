"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Clock, Globe, Info, Laptop, MoreHorizontal, Search, Smartphone, Tablet, Trash, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock data for sessions
const sessions = [
  {
    id: "session_1",
    clientId: "client_1",
    clientName: "Web Dashboard",
    userId: "user_1",
    userName: "John Doe",
    userEmail: "john@example.com",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36",
    deviceType: "desktop",
    ip: "192.168.1.1",
    location: "New York, US",
    createdAt: "2023-11-05T14:32:18Z",
    lastActive: "2023-11-05T15:45:12Z",
    expiresAt: "2023-11-06T14:32:18Z",
    scopes: ["user.read", "license.read"],
  },
  {
    id: "session_2",
    clientId: "client_1",
    clientName: "Web Dashboard",
    userId: "user_2",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    deviceType: "desktop",
    ip: "192.168.1.2",
    location: "Los Angeles, US",
    createdAt: "2023-11-05T12:15:43Z",
    lastActive: "2023-11-05T15:30:22Z",
    expiresAt: "2023-11-06T12:15:43Z",
    scopes: ["user.read", "license.read"],
  },
  {
    id: "session_3",
    clientId: "client_2",
    clientName: "Mobile App",
    userId: "user_1",
    userName: "John Doe",
    userEmail: "john@example.com",
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    deviceType: "mobile",
    ip: "10.0.0.1",
    location: "Chicago, US",
    createdAt: "2023-11-04T18:22:31Z",
    lastActive: "2023-11-05T14:12:05Z",
    expiresAt: "2023-11-05T18:22:31Z",
    scopes: ["user.read", "user.write", "license.read"],
  },
  {
    id: "session_4",
    clientId: "client_2",
    clientName: "Mobile App",
    userId: "user_3",
    userName: "Bob Johnson",
    userEmail: "bob@example.com",
    userAgent:
      "Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    deviceType: "tablet",
    ip: "172.16.0.1",
    location: "Miami, US",
    createdAt: "2023-11-05T09:45:12Z",
    lastActive: "2023-11-05T13:22:45Z",
    expiresAt: "2023-11-06T09:45:12Z",
    scopes: ["user.read", "license.read"],
  },
]

export function SessionsTab({ appId }: { appId: string }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSession, setSelectedSession] = useState(null)
  const [isSessionDetailsOpen, setIsSessionDetailsOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const { toast } = useToast()

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      searchQuery === "" ||
      session.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.ip.includes(searchQuery) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase())

    // Filter by device type if not "all"
    const matchesDeviceType = activeFilter === "all" || session.deviceType === activeFilter

    return matchesSearch && matchesDeviceType
  })

  const handleViewSessionDetails = (session) => {
    setSelectedSession(session)
    setIsSessionDetailsOpen(true)
  }

  const handleRevokeSession = (sessionId) => {
    // In a real app, this would revoke the session
    toast({
      title: "Session Revoked",
      description: "The session has been revoked successfully.",
    })
  }

  const handleRevokeAllSessions = () => {
    // In a real app, this would revoke all sessions
    toast({
      title: "All Sessions Revoked",
      description: "All active sessions have been revoked successfully.",
    })
  }

  const getDeviceIcon = (deviceType) => {
    switch (deviceType) {
      case "desktop":
        return <Laptop className="h-4 w-4" />
      case "mobile":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getTimeSince = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Active Sessions</h2>
          <p className="text-muted-foreground">Manage active user sessions for this application</p>
        </div>
        <Button variant="destructive" onClick={handleRevokeAllSessions}>
          <X className="mr-2 h-4 w-4" />
          Revoke All Sessions
        </Button>
      </div>

      <Card className="bg-card dark:bg-[#1E1E1E]">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>View and manage active user sessions</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search sessions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeFilter === "all" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("all")}
            >
              All Devices
            </Button>
            <Button
              variant={activeFilter === "desktop" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("desktop")}
            >
              <Laptop className="mr-2 h-4 w-4" />
              Desktop
            </Button>
            <Button
              variant={activeFilter === "mobile" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("mobile")}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Mobile
            </Button>
            <Button
              variant={activeFilter === "tablet" ? "secondary" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("tablet")}
            >
              <Tablet className="mr-2 h-4 w-4" />
              Tablet
            </Button>
          </div>

          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Client</th>
                  <th className="text-left p-3 font-medium">Device</th>
                  <th className="text-left p-3 font-medium">Location</th>
                  <th className="text-left p-3 font-medium">Last Active</th>
                  <th className="text-left p-3 font-medium w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No active sessions found.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => (
                    <tr key={session.id} className="border-t hover:bg-muted/30">
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{session.userName}</span>
                          <span className="text-xs text-muted-foreground">{session.userEmail}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{session.clientName}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.deviceType)}
                          <span className="capitalize">{session.deviceType}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span>{session.location}</span>
                          <span className="text-xs text-muted-foreground">{session.ip}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{getTimeSince(session.lastActive)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewSessionDetails(session)}>
                              <Info className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleRevokeSession(session.id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              Revoke Session
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Session Details Dialog */}
      <Dialog open={isSessionDetailsOpen} onOpenChange={setIsSessionDetailsOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
            <DialogDescription>Detailed information about this session</DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">User</h3>
                  <p className="text-base">{selectedSession.userName}</p>
                  <p className="text-xs text-muted-foreground">{selectedSession.userEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                  <p className="text-base">{selectedSession.clientName}</p>
                  <p className="text-xs text-muted-foreground">{selectedSession.clientId}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Device Information</h3>
                <div className="flex items-center gap-2 mt-1">
                  {getDeviceIcon(selectedSession.deviceType)}
                  <span className="capitalize">{selectedSession.deviceType}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{selectedSession.userAgent}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                  <p className="text-base">{selectedSession.location}</p>
                  <p className="text-xs text-muted-foreground">{selectedSession.ip}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Activity</h3>
                  <p className="text-base">Last active {getTimeSince(selectedSession.lastActive)}</p>
                  <p className="text-xs text-muted-foreground">Created {formatDate(selectedSession.createdAt)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Permissions</h3>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedSession.scopes.map((scope) => (
                    <Badge key={scope} variant="secondary" className="text-xs">
                      {scope}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionDetailsOpen(false)}>
              Close
            </Button>
            {selectedSession && (
              <Button
                variant="destructive"
                onClick={() => {
                  handleRevokeSession(selectedSession.id)
                  setIsSessionDetailsOpen(false)
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Revoke Session
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
