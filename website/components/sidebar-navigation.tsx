"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import {usePathname, useRouter} from "next/navigation"
import {cn} from "@/lib/utils"
import {useToast} from "@/hooks/use-toast"
import apiService, {appsApi, isAuthenticated} from "@/lib/api-service"
import {
    ActivitySquare,
    AlertCircle,
    BarChart3,
    CreditCard,
    FileText,
    HelpCircle,
    Home,
    KeyRound,
    LayoutDashboard,
    LogOut,
    Settings,
    Users,
} from "lucide-react"

import type {z} from "zod"
import {useTeam} from "@/contexts/team-context"
import {CreateTeamModal} from "./create-team-modal"
import {CONSTANTS} from "@/app/const";

interface SidebarNavigationProps {
    className?: string
}

export function SidebarNavigation({className}: SidebarNavigationProps) {
    const pathname = usePathname()
    const router = useRouter()
    const {toast} = useToast()
    const [apps, setApps] = useState<z.infer<typeof AppSchema>[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const {selectedTeam} = useTeam()
    const [isLoggingOut, setIsLoggingOut] = useState(false)

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)

            if (!isAuthenticated()) {
                await apiService.auth.logout()
            }

            localStorage.removeItem(CONSTANTS.TOKEN_NAME)
            localStorage.removeItem("selectedTeamId")

            toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
                variant: "default",
            })

            router.push("/login")
        } catch (error) {
            console.error("Logout error:", error)

            toast({
                title: "Logout Failed",
                description: "There was an issue logging you out. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoggingOut(false)
        }
    }

    useEffect(() => {
        const loadApps = async () => {
            if (!selectedTeam) {
                return
            }

            try {
                setIsLoading(true)

                const data: object = await appsApi.getApps(selectedTeam.id)
                setApps(data)
                setError(null)
            } catch (err) {
                console.error("Failed to fetch apps:", err)
                setError("Failed to load applications")
            } finally {
                setIsLoading(false)
            }
        }

        loadApps()
    }, [selectedTeam])

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Dashboard</h2>
                    <div className="space-y-1">
                        <Link
                            href="/dashboard"
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === "/dashboard" ? "bg-accent text-accent-foreground" : "transparent",
                            )}
                        >
                            <LayoutDashboard className="mr-2 h-4 w-4"/>
                            <span>Overview</span>
                        </Link>
                        <Link
                            href="/dashboard/apps"
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === "/dashboard/apps" ? "bg-accent text-accent-foreground" : "transparent",
                            )}
                        >
                            <Home className="mr-2 h-4 w-4"/>
                            <span>Applications</span>
                        </Link>
                        <Link
                            href="/dashboard/resources/analytics"
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === "/dashboard/resources/analytics" ? "bg-accent text-accent-foreground" : "transparent",
                            )}
                        >
                            <BarChart3 className="mr-2 h-4 w-4"/>
                            <span>Analytics</span>
                        </Link>
                    </div>
                </div>

                <div className="px-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="px-2 text-lg font-semibold tracking-tight">Teams</h2>
                        <CreateTeamModal triggerVariant="ghost" triggerSize="icon" triggerText=""
                                         triggerClassName="h-8 w-8 p-0"/>
                    </div>
                    <div className="space-y-1">
                        <Link
                            href="/dashboard/team/members"
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === "/dashboard/team/members" ? "bg-accent text-accent-foreground" : "transparent",
                            )}
                        >
                            <Users className="mr-2 h-4 w-4"/>
                            <span>Members</span>
                        </Link>
                        <Link
                            href="/dashboard/team/activity"
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === "/dashboard/team/activity" ? "bg-accent text-accent-foreground" : "transparent",
                            )}
                        >
                            <ActivitySquare className="mr-2 h-4 w-4"/>
                            <span>Activity</span>
                        </Link>
                        <Link
                            href="/dashboard/team/roles"
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === "/dashboard/team/roles" ? "bg-accent text-accent-foreground" : "transparent",
                            )}
                        >
                            <KeyRound className="mr-2 h-4 w-4"/>
                            <span>Roles & Permissions</span>
                        </Link>
                    </div>
                </div>

                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Resources</h2>
                    <div className="space-y-1">
                        <Link
                            href="/dashboard/resources/docs"
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === "/dashboard/resources/docs" ? "bg-accent text-accent-foreground" : "transparent",
                            )}
                        >
                            <FileText className="mr-2 h-4 w-4"/>
                            <span>Documentation</span>
                        </Link>
                        <Link
                            href="/dashboard/resources/billing"
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === "/dashboard/resources/billing" ? "bg-accent text-accent-foreground" : "transparent",
                            )}
                        >
                            <CreditCard className="mr-2 h-4 w-4"/>
                            <span>Billing</span>
                        </Link>
                    </div>
                </div>

                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                        Applications {selectedTeam &&
                        <span className="text-xs text-muted-foreground">({selectedTeam.name})</span>}
                    </h2>
                    {isLoading ? (
                        <div className="space-y-2">
                            <div className="h-9 w-full animate-pulse rounded-md bg-muted"></div>
                            <div className="h-9 w-full animate-pulse rounded-md bg-muted"></div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center rounded-md px-3 py-2 text-sm text-red-500">
                            <AlertCircle className="mr-2 h-4 w-4"/>
                            <span>Failed to load apps</span>
                        </div>
                    ) : apps.length === 0 ? (
                        <div className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground">
                            <span>No applications found</span>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {apps.map((app) => (
                                <Link
                                    key={app.id}
                                    href={`/dashboard/apps/${app.id}`}
                                    className={cn(
                                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                        pathname === `/dashboard/apps/${app.id}` ? "bg-accent text-accent-foreground" : "transparent",
                                    )}
                                >
                                    <span className="truncate">{app.name}</span>
                                    <span
                                        className={cn(
                                            "ml-2 h-2 w-2 rounded-full",
                                            app.status === "active" ? "bg-green-500" : "bg-amber-500",
                                        )}
                                    ></span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-4 py-2">
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Settings</h2>
                    <div className="space-y-1">
                        <Link
                            href="/dashboard/settings"
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === "/dashboard/settings" ? "bg-accent text-accent-foreground" : "transparent",
                            )}
                        >
                            <Settings className="mr-2 h-4 w-4"/>
                            <span>General</span>
                        </Link>
                        <Link
                            href="/dashboard/help"
                            className={cn(
                                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                pathname === "/dashboard/help" ? "bg-accent text-accent-foreground" : "transparent",
                            )}
                        >
                            <HelpCircle className="mr-2 h-4 w-4"/>
                            <span>Help & Support</span>
                        </Link>
                        <button
                            className="w-full flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                        >
                            <LogOut className="mr-2 h-4 w-4"/>
                            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
