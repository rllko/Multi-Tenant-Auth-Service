"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { RolesPermissionsView } from "@/components/roles-permissions-view"
import { SelectTeamPrompt } from "@/components/select-team-prompt"
import { useTeam } from "@/contexts/team-context"
import apiService from "@/lib/api-service"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeamRolesPage() {
    const { selectedTeam } = useTeam()
    const [roles, setRoles] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const initialLoadComplete = useRef(false)

    const fetchRoles = async (showToast = false) => {
        if (!selectedTeam) return

        try {
            if (!isRefreshing) {
                setIsLoading(true)
            }
            setError(null)

            console.log(`Fetching roles for team: ${selectedTeam.id}`)

            // Use the API service to fetch team roles
            const data = await apiService.roles.getRoles(selectedTeam.id)
            console.log("Roles data received:", data)
            setRoles(data)

            if (showToast) {
                toast({
                    title: "Roles refreshed",
                    description: "The roles list has been updated",
                })
            }
        } catch (err) {
            console.error("Error fetching team roles:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to load team roles"
            setError(errorMessage)

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
            initialLoadComplete.current = true
        }
    }

    const handleRefresh = () => {
        setIsRefreshing(true)
        fetchRoles(true)
    }

    useEffect(() => {
        if (selectedTeam && !initialLoadComplete.current) {
            console.log("Initial load - fetching roles for team:", selectedTeam.id)
            fetchRoles()
        } else if (!selectedTeam) {
            setIsLoading(false)
        }
    }, [selectedTeam])

    if (!selectedTeam) {
        return <SelectTeamPrompt />
    }

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground">Manage roles for {selectedTeam.name}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading || isRefreshing}>
                    {isRefreshing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Refreshing...
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </>
                    )}
                </Button>
            </div>

            {isLoading && !isRefreshing ? (
                <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            ) : error ? (
                <div className="rounded-md bg-destructive/15 p-4">
                    <h2 className="text-lg font-semibold text-destructive">Error Loading Roles</h2>
                    <p className="mt-2 text-sm">{error}</p>
                    <Button onClick={() => fetchRoles()} className="mt-4" variant="outline">
                        Try Again
                    </Button>
                </div>
            ) : (
                <RolesPermissionsView
                    selectedOrganization={{
                        id: selectedTeam.id,
                        name: selectedTeam.name,
                        members: roles.length,
                        role: "admin",
                    }}
                    roles={roles}
                    onRefresh={fetchRoles}
                    isRefreshing={isRefreshing}
                />
            )}
        </div>
    )
}
