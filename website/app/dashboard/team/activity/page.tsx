"use client"

import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { ActivityView } from "@/components/activity-view"
import { SelectTeamPrompt } from "@/components/select-team-prompt"
import { useTeam } from "@/contexts/team-context"
import apiService from "@/lib/api-service"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function TeamActivityPage() {
    const { selectedTeam } = useTeam()
    const [activities, setActivities] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()
    const initialLoadComplete = useRef(false)

    const fetchActivities = async (showToast = false) => {
        if (!selectedTeam) return

        try {
            if (!isRefreshing) {
                setIsLoading(true)
            }
            setError(null)

            console.log(`Fetching activities for team: ${selectedTeam.id}`)

            // Use the API service to fetch team activities
            const data = await apiService.activity.getActivity(selectedTeam.id)
            console.log("Activities data received:", data)
            setActivities(data)

            if (showToast) {
                toast({
                    title: "Activities refreshed",
                    description: "The activity log has been updated",
                })
            }
        } catch (err) {
            console.error("Error fetching team activities:", err)
            const errorMessage = err instanceof Error ? err.message : "Failed to load team activities"
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
        fetchActivities(true)
    }

    useEffect(() => {
        if (selectedTeam && !initialLoadComplete.current) {
            fetchActivities()
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
                    <h1 className="text-2xl font-bold tracking-tight">Team Activity</h1>
                    <p className="text-muted-foreground">Monitor team member actions and system events for {selectedTeam.name}</p>
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
                    <h2 className="text-lg font-semibold text-destructive">Error Loading Activities</h2>
                    <p className="mt-2 text-sm">{error}</p>
                    <Button onClick={() => fetchActivities()} className="mt-4" variant="outline">
                        Try Again
                    </Button>
                </div>
            ) : (
                <ActivityView
                    activities={activities}
                    teamId={selectedTeam.id}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                />
            )}
        </div>
    )
}
