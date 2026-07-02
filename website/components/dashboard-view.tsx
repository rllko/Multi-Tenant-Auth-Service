"use client"

import {useCallback, useEffect, useState} from "react"
import Link from "next/link"
import {formatDistanceToNow} from "date-fns"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import {useTeam} from "@/contexts/team-context"
import {RequireTeam} from "./require-team"
import {CreateTeamModal} from "./create-team-modal"
import {appsApi, dashboardApi, licensesApi} from "@/lib/api-service"
import {Dashboard} from "@/models/dashboard"
import {Application} from "@/models/application"
import {License} from "@/models/license"
import {cn} from "@/lib/utils"
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    ArrowRight,
    KeyRound,
    LogIn,
    Mail,
    Package,
    Plus,
    Shield,
    UserPlus,
    Users,
} from "lucide-react"

const activityTypeColors: Record<string, string> = {
    login: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    create: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    update: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    permission: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

// license buckets computed client-side from unix-second expiry timestamps
type AppLicenseStats = {
    total: number
    active: number
    expiringSoon: number
    expired: number
    failed?: boolean
}

type AppWithStats = Application & {stats: AppLicenseStats | null}

const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60

function computeLicenseStats(licenses: License[]): AppLicenseStats {
    const now = Math.floor(Date.now() / 1000)

    let active = 0
    let expiringSoon = 0
    let expired = 0

    for (const license of licenses) {
        if (license.expirationDate <= now) {
            expired++
            continue
        }

        if (license.activated && !license.paused) {
            active++
        }

        if (!license.paused && license.expirationDate <= now + SEVEN_DAYS_SECONDS) {
            expiringSoon++
        }
    }

    return {total: licenses.length, active, expiringSoon, expired}
}

export function DashboardView() {
    const [dashboard, setDashboard] = useState<Dashboard | null>(null)
    const [apps, setApps] = useState<AppWithStats[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const {selectedTeam} = useTeam()

    const loadDashboard = useCallback(async () => {
        if (!selectedTeam) return

        try {
            setIsLoading(true)

            const [overview, teamApps] = await Promise.all([
                dashboardApi.getDashboard(selectedTeam.id),
                appsApi.getApps(selectedTeam.id),
            ])

            setDashboard(overview)

            const appList = Array.isArray(teamApps) ? teamApps : []

            // show cards immediately, license buckets resolve per app
            setApps(appList.map((app) => ({...app, stats: null})))

            const withStats: AppWithStats[] = await Promise.all(
                appList.map(async (app) => {
                    try {
                        const licenses = await licensesApi.getLicenses(selectedTeam.id, app.id)

                        return {...app, stats: computeLicenseStats(Array.isArray(licenses) ? licenses : [])}
                    } catch (err) {
                        console.error(`Failed to fetch licenses for app ${app.id}:`, err)

                        return {...app, stats: {total: 0, active: 0, expiringSoon: 0, expired: 0, failed: true}}
                    }
                }),
            )

            setApps(withStats)
            setError(null)
        } catch (err) {
            console.error("Failed to fetch dashboard:", err)
            setError("Failed to load the team overview")
        } finally {
            setIsLoading(false)
        }
    }, [selectedTeam])

    useEffect(() => {
        loadDashboard()
    }, [loadDashboard])

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    {selectedTeam && (
                        <p className="text-muted-foreground mt-1">
                            Your applications in {selectedTeam.name} at a glance
                        </p>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/apps">
                            <Plus className="mr-1.5 h-4 w-4"/>
                            Create app
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/team/members">
                            <UserPlus className="mr-1.5 h-4 w-4"/>
                            Invite member
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/team/roles">
                            <Shield className="mr-1.5 h-4 w-4"/>
                            Create role
                        </Link>
                    </Button>
                    <CreateTeamModal/>
                </div>
            </div>

            <RequireTeam>
                {error && (
                    <div
                        className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md flex items-center justify-between">
                        <div className="flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2"/>
                            <span>{error}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={loadDashboard}>
                            Try again
                        </Button>
                    </div>
                )}

                {isLoading ? (
                    <DashboardSkeleton/>
                ) : dashboard ? (
                    <>
                        {/* Compact team strip */}
                        <div
                            className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border bg-card px-4 py-3">
                            <TeamStat
                                icon={<Users className="h-4 w-4"/>}
                                value={dashboard.members}
                                label={dashboard.members === 1 ? "member" : "members"}
                                href="/dashboard/team/members"
                            />
                            <TeamStat
                                icon={<Shield className="h-4 w-4"/>}
                                value={dashboard.roles}
                                label={dashboard.roles === 1 ? "role" : "roles"}
                                href="/dashboard/team/roles"
                            />
                            <TeamStat
                                icon={<Mail className="h-4 w-4"/>}
                                value={dashboard.pendingInvites}
                                label="pending invites"
                                href="/dashboard/team/invites"
                            />
                            <TeamStat
                                icon={<LogIn className="h-4 w-4"/>}
                                value={dashboard.signInsLast24H}
                                label="sign-ins · 24h"
                                href="/dashboard/team/activity"
                            />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-3">
                            {/* Application cards */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-lg font-semibold">Applications</h2>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/dashboard/apps">
                                            Manage apps
                                            <ArrowRight className="ml-1.5 h-3.5 w-3.5"/>
                                        </Link>
                                    </Button>
                                </div>

                                {apps.length === 0 ? (
                                    <Card>
                                        <CardContent className="flex flex-col items-center justify-center py-14 text-center">
                                            <Package className="h-10 w-10 text-muted-foreground/60 mb-3"/>
                                            <p className="font-medium">No applications yet</p>
                                            <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">
                                                Create your first application to start issuing licenses and
                                                authenticating users.
                                            </p>
                                            <Button size="sm" className="mt-4" asChild>
                                                <Link href="/dashboard/apps">
                                                    <Plus className="mr-1.5 h-4 w-4"/>
                                                    Create your first application
                                                </Link>
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {apps.map((app) => (
                                            <AppCard key={app.id} app={app}/>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Recent activity */}
                            <Card className="lg:col-span-1 h-fit">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle>Recent activity</CardTitle>
                                        <CardDescription>Latest events in your team</CardDescription>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/dashboard/team/activity">
                                            View all
                                            <ArrowRight className="ml-1.5 h-3.5 w-3.5"/>
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {dashboard.recentActivity.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <Activity className="h-8 w-8 text-muted-foreground/60 mb-3"/>
                                            <p className="font-medium">No activity yet</p>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Team events will show here.
                                            </p>
                                        </div>
                                    ) : (
                                        dashboard.recentActivity.map((activity, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <span
                                                    className={cn(
                                                        "mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize shrink-0",
                                                        activityTypeColors[activity.type] ??
                                                        "bg-muted text-muted-foreground",
                                                    )}
                                                >
                                                    {activity.type}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-sm truncate">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatTimeAgo(activity.timestamp)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </>
                ) : null}
            </RequireTeam>
        </div>
    )
}

function AppCard({app}: {app: AppWithStats}) {
    const isActive = (app.status ?? "active") === "active"

    return (
        <Link href={`/dashboard/apps/${app.id}`} className="block group">
            <Card className="transition-colors group-hover:border-primary/40 h-full">
                <CardContent className="p-5 flex flex-col gap-4 h-full">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        "h-2 w-2 rounded-full shrink-0",
                                        isActive ? "bg-green-500" : "bg-muted-foreground/40",
                                    )}
                                    title={isActive ? "Active" : "Inactive"}
                                />
                                <p className="font-semibold truncate">{app.name}</p>
                            </div>
                            {app.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{app.description}</p>
                            )}
                        </div>
                        <Package
                            className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0"/>
                    </div>

                    {app.stats === null ? (
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-20"/>
                            <Skeleton className="h-3 w-32"/>
                        </div>
                    ) : app.stats.failed ? (
                        <p className="text-xs text-muted-foreground">License counts unavailable</p>
                    ) : (
                        <div className="mt-auto">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight">{app.stats.active}</span>
                                <span className="text-xs text-muted-foreground">
                                    active {app.stats.active === 1 ? "license" : "licenses"} of {app.stats.total}
                                </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                {app.stats.expiringSoon > 0 && (
                                    <span
                                        className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                        <AlertTriangle className="h-3.5 w-3.5"/>
                                        {app.stats.expiringSoon} expiring within 7 days
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-muted-foreground">
                                    <KeyRound className="h-3.5 w-3.5"/>
                                    {app.stats.expired} expired
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    )
}

function TeamStat({
                      icon,
                      value,
                      label,
                      href,
                  }: {
    icon: React.ReactNode
    value: number
    label: string
    href: string
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
            <span className="text-muted-foreground/70">{icon}</span>
            <span className="font-semibold text-foreground">{value}</span>
            <span>{label}</span>
        </Link>
    )
}

function formatTimeAgo(timestamp: string) {
    try {
        return formatDistanceToNow(new Date(timestamp), {addSuffix: true})
    } catch {
        return ""
    }
}

function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <Skeleton className="h-[52px] rounded-lg"/>
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
                    {Array.from({length: 4}).map((_, i) => (
                        <Skeleton key={i} className="h-[160px] rounded-lg"/>
                    ))}
                </div>
                <Skeleton className="h-[340px] rounded-lg"/>
            </div>
        </div>
    )
}
