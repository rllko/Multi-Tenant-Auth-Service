"use client"

import {useCallback, useEffect, useState} from "react"
import {useParams} from "next/navigation"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {AlertCircle, Loader2, MonitorSmartphone, RefreshCw} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {useTeam} from "@/contexts/team-context"
import {sessionsApi} from "@/lib/api-service"
import {EmptyState} from "./empty-state"
import {SelectTeamPrompt} from "./select-team-prompt"
import {UserSession} from "@/models/userSession"

export function SessionManagementView() {
    const params = useParams<{ id: string }>()
    const appId = params?.id
    const {selectedTeam} = useTeam()
    const {toast} = useToast()

    const [sessions, setSessions] = useState<UserSession[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchSessions = useCallback(
        async (showRefreshing = false) => {
            if (!selectedTeam || !appId) return

            try {
                if (showRefreshing) {
                    setIsRefreshing(true)
                } else {
                    setIsLoading(true)
                }
                setError(null)

                const data = await sessionsApi.getSessions(selectedTeam.id, appId)
                setSessions(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error("Error fetching sessions:", err)
                const errorMessage = err instanceof Error ? err.message : "Failed to load sessions"
                setError(errorMessage)
            } finally {
                setIsLoading(false)
                setIsRefreshing(false)
            }
        },
        [selectedTeam, appId],
    )

    useEffect(() => {
        fetchSessions()
    }, [fetchSessions])

    const handleTerminate = async (sessionId: string) => {
        if (!selectedTeam || !appId) return

        try {
            await sessionsApi.terminateSession(selectedTeam.id, appId, sessionId)

            setSessions((prev) => prev.filter((session) => session.id !== sessionId))
            toast({
                title: "Session terminated",
                description: "The session has been terminated successfully.",
            })
        } catch (err) {
            console.error("Error terminating session:", err)
            toast({
                title: "Error",
                description: err instanceof Error ? err.message : "Failed to terminate session",
                variant: "destructive",
            })
        }
    }

    const formatTimestamp = (timestamp?: number | null) => {
        if (!timestamp) return "—"
        try {
            return new Date(timestamp * 1000).toLocaleString()
        } catch {
            return "—"
        }
    }

    if (!selectedTeam) {
        return <SelectTeamPrompt/>
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Sessions</h1>
                    <p className="text-muted-foreground">Active license sessions for this application</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchSessions(true)} disabled={isRefreshing}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}/>
                    {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mr-2"/>
                    <span>Loading sessions...</span>
                </div>
            ) : error ? (
                <div className="rounded-md bg-destructive/15 p-4">
                    <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-3"/>
                        <div>
                            <h3 className="font-medium text-destructive">Error loading sessions</h3>
                            <p className="text-sm text-destructive/90 mt-1">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-3 border-destructive/50 text-destructive hover:bg-destructive/10"
                                onClick={() => fetchSessions()}
                            >
                                Try again
                            </Button>
                        </div>
                    </div>
                </div>
            ) : sessions.length === 0 ? (
                <EmptyState
                    title="No active sessions"
                    description="There are no active sessions for this application right now."
                    icon={<MonitorSmartphone className="h-10 w-10"/>}
                />
            ) : (
                <div className="border rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-3 font-medium">Session</th>
                                <th className="text-left p-3 font-medium">License</th>
                                <th className="text-left p-3 font-medium">IP Address</th>
                                <th className="text-left p-3 font-medium">Started</th>
                                <th className="text-left p-3 font-medium">Status</th>
                                <th className="text-right p-3 font-medium">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {sessions.map((session) => (
                                <tr key={session.id} className="hover:bg-muted/30">
                                    <td className="p-3 font-mono text-xs">{session.id}</td>
                                    <td className="p-3">{session.license_id}</td>
                                    <td className="p-3">{session.ip_address ?? "—"}</td>
                                    <td className="p-3 text-sm text-muted-foreground">{formatTimestamp(session.created_at)}</td>
                                    <td className="p-3">
                                        <Badge variant={session.is_active ? "default" : "secondary"}>
                                            {session.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </td>
                                    <td className="p-3 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleTerminate(session.id)}
                                        >
                                            Terminate
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
