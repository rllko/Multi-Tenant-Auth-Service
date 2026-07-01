"use client"

import {useCallback, useEffect, useState} from "react"
import Link from "next/link"
import {Area, AreaChart, CartesianGrid, XAxis, YAxis} from "recharts"
import {format, formatDistanceToNow} from "date-fns"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import {ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import {useTeam} from "@/contexts/team-context"
import {RequireTeam} from "./require-team"
import {CreateTeamModal} from "./create-team-modal"
import {dashboardApi} from "@/lib/api-service"
import {Dashboard} from "@/models/dashboard"
import {cn} from "@/lib/utils"
import {
    Activity,
    AlertCircle,
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

const licenseChartConfig = {
    count: {
        label: "Licenses issued",
        color: "hsl(var(--primary))",
    },
}

const activityTypeColors: Record<string, string> = {
    login: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    create: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    update: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    permission: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
}

export function DashboardView() {
    const [dashboard, setDashboard] = useState<Dashboard | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const {selectedTeam} = useTeam()

    const loadDashboard = useCallback(async () => {
        if (!selectedTeam) return

        try {
            setIsLoading(true)

            const data: Dashboard = await dashboardApi.getDashboard(selectedTeam.id)

            setDashboard(data)
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
                        <p className="text-muted-foreground mt-1">What&apos;s happening in {selectedTeam.name}</p>
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
                        {/* Stat cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <StatCard
                                title="Members"
                                value={dashboard.members}
                                subtext={`${dashboard.roles} role${dashboard.roles === 1 ? "" : "s"} defined`}
                                icon={<Users className="h-4 w-4"/>}
                                href="/dashboard/team/members"
                            />
                            <StatCard
                                title="Applications"
                                value={dashboard.apps}
                                subtext={
                                    dashboard.appsInactive > 0
                                        ? `${dashboard.appsInactive} inactive`
                                        : "All active"
                                }
                                icon={<Package className="h-4 w-4"/>}
                                href="/dashboard/apps"
                            />
                            <StatCard
                                title="Licenses"
                                value={dashboard.licensesTotal}
                                subtext={`${dashboard.licensesActive} active · ${dashboard.licensesPaused} paused`}
                                icon={<KeyRound className="h-4 w-4"/>}
                                href="/dashboard/apps"
                            />
                            <StatCard
                                title="Pending invites"
                                value={dashboard.pendingInvites}
                                subtext={
                                    dashboard.pendingInvites > 0 ? "Awaiting response" : "No invites outstanding"
                                }
                                icon={<Mail className="h-4 w-4"/>}
                                href="/dashboard/team/invites"
                            />
                        </div>

                        {/* Sign-ins strip */}
                        <div
                            className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm">
                            <div
                                className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <LogIn className="h-4 w-4"/>
                            </div>
                            <div>
                                <span className="font-semibold">{dashboard.signInsLast24H}</span>{" "}
                                <span className="text-muted-foreground">
                                    sign-in{dashboard.signInsLast24H === 1 ? "" : "s"} by team members in the last 24 hours
                                </span>
                            </div>
                            <Button variant="ghost" size="sm" className="ml-auto" asChild>
                                <Link href="/dashboard/team/activity">
                                    Security events
                                    <ArrowRight className="ml-1.5 h-3.5 w-3.5"/>
                                </Link>
                            </Button>
                        </div>

                        {/* Chart + activity */}
                        <div className="grid gap-4 lg:grid-cols-7">
                            <Card className="lg:col-span-4">
                                <CardHeader>
                                    <CardTitle>License issuance</CardTitle>
                                    <CardDescription>Licenses created in the last 30 days</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {dashboard.licensesPerDay.length === 0 ? (
                                        <EmptyPanel
                                            icon={<KeyRound className="h-8 w-8"/>}
                                            title="No licenses yet"
                                            description="Licenses issued by your applications will chart here."
                                            actionLabel="Go to applications"
                                            actionHref="/dashboard/apps"
                                        />
                                    ) : (
                                        <ChartContainer config={licenseChartConfig} className="h-[240px] w-full">
                                            <AreaChart
                                                data={dashboard.licensesPerDay.map((day) => ({
                                                    ...day,
                                                    label: format(new Date(day.date), "MMM d"),
                                                }))}
                                                margin={{left: 0, right: 12, top: 8}}
                                            >
                                                <CartesianGrid vertical={false} strokeDasharray="3 3"/>
                                                <XAxis
                                                    dataKey="label"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    minTickGap={24}
                                                />
                                                <YAxis
                                                    allowDecimals={false}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    width={32}
                                                />
                                                <ChartTooltip content={<ChartTooltipContent/>}/>
                                                <Area
                                                    dataKey="count"
                                                    type="monotone"
                                                    fill="var(--color-count)"
                                                    fillOpacity={0.15}
                                                    stroke="var(--color-count)"
                                                    strokeWidth={2}
                                                />
                                            </AreaChart>
                                        </ChartContainer>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-3">
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
                                        <EmptyPanel
                                            icon={<Activity className="h-8 w-8"/>}
                                            title="No activity yet"
                                            description="Team events like sign-ins, invites, and app changes will show here."
                                        />
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

function formatTimeAgo(timestamp: string) {
    try {
        return formatDistanceToNow(new Date(timestamp), {addSuffix: true})
    } catch {
        return ""
    }
}

function StatCard({
                      title,
                      value,
                      subtext,
                      icon,
                      href,
                  }: {
    title: string
    value: number
    subtext: string
    icon: React.ReactNode
    href: string
}) {
    return (
        <Link href={href} className="block group">
            <Card className="transition-colors group-hover:border-primary/40">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <span className="text-muted-foreground group-hover:text-primary transition-colors">
                            {icon}
                        </span>
                    </div>
                    <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{subtext}</p>
                </CardContent>
            </Card>
        </Link>
    )
}

function EmptyPanel({
                        icon,
                        title,
                        description,
                        actionLabel,
                        actionHref,
                    }: {
    icon: React.ReactNode
    title: string
    description: string
    actionLabel?: string
    actionHref?: string
}) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="text-muted-foreground/60 mb-3">{icon}</div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[260px]">{description}</p>
            {actionLabel && actionHref && (
                <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href={actionHref}>{actionLabel}</Link>
                </Button>
            )}
        </div>
    )
}

function DashboardSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({length: 4}).map((_, i) => (
                    <Skeleton key={i} className="h-[118px] rounded-lg"/>
                ))}
            </div>
            <Skeleton className="h-[58px] rounded-lg"/>
            <div className="grid gap-4 lg:grid-cols-7">
                <Skeleton className="h-[340px] rounded-lg lg:col-span-4"/>
                <Skeleton className="h-[340px] rounded-lg lg:col-span-3"/>
            </div>
        </div>
    )
}
