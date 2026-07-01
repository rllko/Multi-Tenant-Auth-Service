"use client"

import {useEffect, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Loader2, Plus, RefreshCw, Shield} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {useTeam} from "@/contexts/team-context"
import {EmptyState} from "./empty-state"
import {appsApi} from "@/lib/api-service";

export function PermissionsTab({appId}) {
    const [scopes, setScopes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [scopesDialogOpen, setScopesDialogOpen] = useState(false)
    const [selectedScopes, setSelectedScopes] = useState([])
    const {toast} = useToast()
    const {selectedTeam} = useTeam()

    useEffect(() => {
        fetchScopes()
    }, [appId, selectedTeam])

    const fetchScopes = async () => {
        if (!selectedTeam || !appId) return

        try {
            setLoading(true)

            const data = await appsApi.getAppPermissions(selectedTeam.id, appId);

            setScopes(data)
            setSelectedScopes(data)
            setError(null)
        } catch (err) {
            console.error("Failed to fetch scopes:", err)
            setError("Failed to load scopes")
        } finally {
            setLoading(false)
        }
    }


    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Application Permissions</CardTitle>
                        <CardDescription>Manage the permissions for this application</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={fetchScopes}>
                            <RefreshCw className="mr-2 h-4 w-4"/>
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-32">
                            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                            <span className="ml-2">Loading permissions...</span>
                        </div>
                    ) : error ? (
                        <div
                            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
                            <Shield className="h-5 w-5 mr-2"/>
                            <span>{error}</span>
                        </div>
                    ) : scopes.length === 0 ? (
                        <EmptyState
                            title="No permissions assigned"
                            description="This application doesn't have any permissions assigned yet."
                            icon={<Shield className="h-10 w-10 text-muted-foreground"/>}
                            action={
                                <Button onClick={() => setScopesDialogOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4"/>
                                    Add Permissions
                                </Button>
                            }
                        />
                    ) : (
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {scopes.map((scope) => (
                                    <Badge key={scope.name} variant="secondary">
                                        {scope.name}
                                    </Badge>
                                ))}
                            </div>

                            <div className="bg-muted/50 p-4 rounded-md">
                                <div className="flex items-center mb-2">
                                    <Shield className="h-5 w-5 mr-2 text-primary"/>
                                    <h3 className="font-medium">Permission Details</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    These permissions define what actions this application can perform on behalf of
                                    users. Each permission
                                    grants access to specific API endpoints and functionality.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    )
}
