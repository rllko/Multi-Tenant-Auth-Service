"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Clock,
  Globe,
  Laptop,
  Loader2,
  LogOut,
  MoreHorizontal,
  Search,
  Shield,
  Smartphone,
  Tablet,
  Trash,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getSessions, revokeSession, revokeAllSessions } from "@/lib/api-service"
import type { Session } from "@/lib/schemas"

export function SessionManagementView({ applicationId }: { applicationId?: string }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const { toast } = useToast()

  // Fetch sessions on component mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true)
        const response = await getSessions(applicationId)
        if (response.success && response.data) {
          setSessions(response.data)
        } else {
          setError("Failed to fetch sessions")
        }
      } catch (err) {
        setError("An error occurred while fetching sessions")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSessions()
  }, [applicationId])

  // Filter sessions based on search query
  const filteredSessions = sessions.filter(
    (session) =>
      session.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.deviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.ipAddress.includes(searchQuery),
  )

  const handleRevokeSession = async () => {
    if (!selectedSession) return

    try {
      setLoading(true)
      const response = await revokeSession(selectedSession.id)
      if (response.success) {
        setSessions(
          sessions.map((session) => (session.id === selectedSession.id ? { ...session, status: "revoked" } : session)),
        )
        toast({
          title: "Session revoked",
          description: "The session has been revoked successfully.",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
      setConfirmRevoke(false)
      setSelectedSession(null)
    }
  }

  const handleRevokeAllSessions = async () => {
    try {
      setLoading(true)
      const response = await revokeAllSessions()
      if (response.success) {
        setSessions(sessions.map((session) => ({ ...session, status: "revoked" })))
        toast({
          title: "All sessions revoked",
          description: "All sessions have been revoked successfully.",
        })
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to revoke all sessions",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
      setConfirmRevokeAll(false)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case "desktop":
      case "laptop":
        return <Laptop className="h-4 w-4" />
      case "mobile":
      case "phone":
        return <Smartphone className="h-4 w-4" />
      case "tablet":
        return <Tablet className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "expired":
        return <Badge variant="secondary">Expired</Badge>
      case "revoked":
        return <Badge variant="destructive">Revoked</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading sessions...</span>
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
      <Card className="shadow-sm border-border">
        <CardHeader className="flex flex-row items-center justify-between bg-secondary/50 rounded-t-lg">
          <div className="space-y-1.5">
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Manage user sessions and devices.</CardDescription>
          </div>
          <Button
            variant="destructive"
            onClick={() => setConfirmRevokeAll(true)}
            disabled={!sessions.some((session) => session.status === "active")}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Revoke All Sessions
          </Button>
        </CardHeader>
        <CardContent>
          <div className="relative flex items-center mb-4">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by username, device, or location..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No sessions found. Try adjusting your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span>{session.username}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.deviceType)}
                          <span>{session.deviceType}</span>
                          <span className="text-xs text-muted-foreground">{session.userAgent.split(" ")[0]}</span>
                        </div>
                      </TableCell>
                      <TableCell>{session.location}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">{session.ipAddress}</code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{session.lastActive}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(session.status)}</TableCell>
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
                            {session.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSession(session)
                                  setConfirmRevoke(true)
                                }}
                              >
                                <LogOut className="mr-2 h-4 w-4" />
                                Revoke Session
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Trash className="mr-2 h-4 w-4" />
                              Delete Record
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

      {/* Revoke Session Dialog */}
      <AlertDialog open={confirmRevoke} onOpenChange={setConfirmRevoke}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke this session? The user will be signed out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeSession} className="bg-destructive text-destructive-foreground">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke Session"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke All Sessions Dialog */}
      <AlertDialog open={confirmRevokeAll} onOpenChange={setConfirmRevokeAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke All Sessions</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke all active sessions? All users will be signed out immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevokeAllSessions} className="bg-destructive text-destructive-foreground">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Revoking...
                </>
              ) : (
                "Revoke All Sessions"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
