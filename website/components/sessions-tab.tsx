"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Search, Shield, X, RefreshCw, Globe, Clock, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTeam } from "@/contexts/team-context"
import { EmptyState } from "./empty-state"

export function SessionsTab({ appId }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const { selectedTeam } = useTeam()

  useEffect(() => {
    fetchSessions()
  }, [appId, selectedTeam])

  const fetchSessions = async () => {
    if (!selectedTeam || !appId) return

    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${appId}/sessions`)

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`)
      }

      const data = await response.json()
      setSessions(data)
      setError(null)
    } catch (err) {
      console.error("Failed to fetch sessions:", err)
      setError("Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }

  const revokeSession = async (sessionId) => {
    if (!selectedTeam || !appId) return

    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${appId}/sessions/${sessionId}`,
        {
          method: "DELETE",
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to revoke session: ${response.status}`)
      }

      setSessions(sessions.filter((session) => session.id !== sessionId))

      toast({
        title: "Session revoked",
        description: "The session has been revoked successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to revoke session: ${err.message}`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const revokeAllSessions = async () => {
    if (!selectedTeam || !appId) return

    try {
      setLoading(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/apps/${appId}/sessions`,
        {
          method: "DELETE",
        },
      )

      if (!response.ok) {
        throw new Error(`Failed to revoke all sessions: ${response.status}`)
      }

      setSessions([])

      toast({
        title: "All sessions revoked",
        description: "All sessions have been revoked successfully.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to revoke all sessions: ${err.message}`,
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filter sessions based on search query
  const filteredSessions = sessions.filter((session) => {
    return (
      searchQuery === "" ||
      session.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>Manage active user sessions for this application</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchSessions}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="destructive" size="sm" onClick={revokeAllSessions} disabled={sessions.length === 0}>
            <X className="mr-2 h-4 w-4" />
            Revoke All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative flex-1 my-4">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search sessions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading sessions...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
            <Shield className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        ) : filteredSessions.length === 0 ? (
          <EmptyState
            title="No active sessions"
            description="There are no active sessions for this application."
            icon={<Clock className="h-10 w-10 text-muted-foreground" />}
          />
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{session.userId}</TableCell>
                  <TableCell>{session.ipAddress}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      {session.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">{session.browser}</div>
                        <div className="text-xs text-muted-foreground">{session.os}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(session.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.createdAt).toLocaleTimeString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={new Date(session.expiresAt) < new Date() ? "destructive" : "outline"}>
                      {new Date(session.expiresAt).toLocaleDateString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
