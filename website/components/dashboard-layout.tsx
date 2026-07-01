"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {usePathname, useRouter} from "next/navigation"
import Link from "next/link"
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Toaster} from "@/components/ui/toaster"
import {useTheme} from "next-themes"
import {TenantSwitcher} from "./tenant-switcher"
import {ActivityFeed} from "./activity-feed"
import {KeyboardShortcutsModal} from "./keyboard-shortcuts-modal"
import {useTeam} from "@/contexts/team-context"
import {ErrorBoundary} from "@/components/error-boundary"
import {
    Activity,
    BarChart2,
    Home,
    Key,
    Keyboard,
    Loader2,
    LogOut,
    Mail,
    Moon,
    Package,
    PanelLeft,
    Plus,
    Settings,
    Shield,
    Store,
    Sun,
    Users,
} from "lucide-react"
import apiService, {appsApi, isAuthenticated} from "@/lib/api-service";
import {CONSTANTS} from "@/app/const";
import {toast} from "@/hooks/use-toast"
import {Badge} from "@/components/ui/badge";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime"

interface DashboardLayoutProps {
    children: React.ReactNode
    userRole?: "admin" | "member"
}

export function DashboardLayout({children, userRole = "admin"}: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activityFeedOpen, setActivityFeedOpen] = useState(false)
    const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false)
    const {resolvedTheme, setTheme} = useTheme()
    const [mounted, setMounted] = useState(false)
    const pathname = usePathname()
    const {selectedTeam} = useTeam()
    const [apps, setApps] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [pendingInvites, setPendingInvites] = useState(0)
    const router = useRouter();

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        const fetchApps = async () => {
            if (!selectedTeam) return

            try {
                setLoading(true)
                const data = await appsApi.getApps(selectedTeam.id)
                setApps(Array.isArray(data) ? data : [])
                setError(null)
            } catch (err) {
                console.error("Failed to fetch applications:", err)
                setError("Failed to load applications")
            } finally {
                setLoading(false)
            }
        }

        fetchApps()

        window.addEventListener("apps-changed", fetchApps)
        return () => window.removeEventListener("apps-changed", fetchApps)
    }, [selectedTeam])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl/Cmd + / to toggle keyboard shortcuts modal
            if ((e.ctrlKey || e.metaKey) && e.key === "/") {
                e.preventDefault()
                setShortcutsModalOpen(true)
            }

            // Ctrl/Cmd + B to toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === "b") {
                e.preventDefault()
                setSidebarOpen((prev) => !prev)
            }

            // Ctrl/Cmd + J to toggle activity feed
            if ((e.ctrlKey || e.metaKey) && e.key === "j") {
                e.preventDefault()
                setActivityFeedOpen((prev) => !prev)
            }

            // Escape to close modals
            if (e.key === "Escape") {
                if (shortcutsModalOpen) setShortcutsModalOpen(false)
                if (activityFeedOpen) setActivityFeedOpen(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [shortcutsModalOpen, activityFeedOpen])

    const getAppIcon = (type?: string) => {
        switch (type) {
            case "web":
                return <Store className="h-4 w-4"/>
            case "service":
                return <Key className="h-4 w-4"/>
            case "spa":
                return <BarChart2 className="h-4 w-4"/>
            default:
                return <Package className="h-4 w-4"/>
        }
    }

    const isDark = mounted && resolvedTheme === "dark"

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-card border-r border-border h-screen flex flex-col transition-[width] duration-300 ease-in-out",
                    sidebarOpen ? "w-64" : "w-16",
                )}
            >
                {/* Brand */}
                <div className="h-16 shrink-0 border-b border-border flex items-center justify-between px-3">
                    <Link href="/dashboard"
                          className={cn("flex items-center gap-2.5 min-w-0", !sidebarOpen && "justify-center w-full")}>
                        <div
                            className="h-8 w-8 shrink-0 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                            <Shield className="h-4 w-4"/>
                        </div>
                        {sidebarOpen && (
                            <span className="text-base font-semibold tracking-tight truncate">Authio</span>
                        )}
                    </Link>
                    {sidebarOpen && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSidebarOpen(false)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                            <PanelLeft className="h-4 w-4"/>
                            <span className="sr-only">Collapse sidebar</span>
                        </Button>
                    )}
                </div>

                {/* Team switcher */}
                <div className={cn("p-3 border-b border-border/60", !sidebarOpen && "p-2")}>
                    <TenantSwitcher isCollapsed={!sidebarOpen}/>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1">
                    <nav className={cn("py-3 space-y-0.5", sidebarOpen ? "px-3" : "px-2")}>
                        <SectionLabel visible={sidebarOpen}>Overview</SectionLabel>
                        <NavItem
                            href="/dashboard"
                            icon={<Home className="h-4 w-4"/>}
                            label="Dashboard"
                            isActive={pathname === "/dashboard"}
                            isCollapsed={!sidebarOpen}
                        />

                        <SectionLabel visible={sidebarOpen}>Team</SectionLabel>
                        <NavItem
                            href="/dashboard/team/members"
                            icon={<Users className="h-4 w-4"/>}
                            label="Members"
                            isActive={pathname === "/dashboard/team/members"}
                            isCollapsed={!sidebarOpen}
                        />
                        <NavItem
                            href="/dashboard/team/roles"
                            icon={<Shield className="h-4 w-4"/>}
                            label="Roles"
                            isActive={pathname === "/dashboard/team/roles"}
                            isCollapsed={!sidebarOpen}
                        />
                        <NavItem
                            href="/dashboard/team/activity"
                            icon={<Activity className="h-4 w-4"/>}
                            label="Activity"
                            isActive={pathname === "/dashboard/team/activity"}
                            isCollapsed={!sidebarOpen}
                        />
                        <NavItem
                            href="/dashboard/team/invites"
                            icon={<Mail className="h-4 w-4"/>}
                            label="Invites"
                            isActive={pathname === "/dashboard/team/invites"}
                            isCollapsed={!sidebarOpen}
                            trailing={
                                pendingInvites > 0 ? (
                                    <Badge variant="destructive"
                                           className="ml-auto h-5 min-w-5 px-1.5 justify-center">
                                        {pendingInvites}
                                    </Badge>
                                ) : undefined
                            }
                        />

                        <SectionLabel visible={sidebarOpen}>Applications</SectionLabel>
                        {loading ? (
                            <div className={cn("flex items-center py-2", sidebarOpen ? "px-3" : "justify-center")}>
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                            </div>
                        ) : error ? (
                            sidebarOpen && <p className="px-3 py-1 text-xs text-destructive">Failed to load apps</p>
                        ) : (
                            <>
                                {apps.map((app) => (
                                    <NavItem
                                        key={app.id}
                                        href={`/dashboard/apps/${app.id}`}
                                        icon={getAppIcon(app.type)}
                                        label={app.name}
                                        isActive={pathname === `/dashboard/apps/${app.id}`}
                                        isCollapsed={!sidebarOpen}
                                    />
                                ))}
                                {apps.length === 0 && sidebarOpen && (
                                    <p className="px-3 py-1 text-xs text-muted-foreground">No apps yet</p>
                                )}
                                {userRole === "admin" && (
                                    <NavItem
                                        href="/dashboard/apps"
                                        icon={<Plus className="h-4 w-4"/>}
                                        label="Manage apps"
                                        isActive={pathname === "/dashboard/apps"}
                                        isCollapsed={!sidebarOpen}
                                        muted
                                    />
                                )}
                            </>
                        )}

                        <SectionLabel visible={sidebarOpen}>General</SectionLabel>
                        <NavItem
                            href="/dashboard/settings"
                            icon={<Settings className="h-4 w-4"/>}
                            label="Settings"
                            isActive={pathname === "/dashboard/settings"}
                            isCollapsed={!sidebarOpen}
                        />
                    </nav>
                </ScrollArea>

                {/* Pinned utilities */}
                <div className={cn("shrink-0 border-t border-border py-2 space-y-0.5", sidebarOpen ? "px-3" : "px-2")}>
                    {!sidebarOpen && (
                        <UtilityItem
                            icon={<PanelLeft className="h-4 w-4 rotate-180"/>}
                            label="Expand sidebar"
                            isCollapsed
                            onClick={() => setSidebarOpen(true)}
                        />
                    )}
                    <UtilityItem
                        icon={isDark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
                        label={isDark ? "Light mode" : "Dark mode"}
                        isCollapsed={!sidebarOpen}
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                    />
                    <UtilityItem
                        icon={<Keyboard className="h-4 w-4"/>}
                        label="Keyboard shortcuts"
                        isCollapsed={!sidebarOpen}
                        onClick={() => setShortcutsModalOpen(true)}
                    />
                    <UtilityItem
                        icon={<Activity className="h-4 w-4"/>}
                        label="Activity feed"
                        isCollapsed={!sidebarOpen}
                        isActive={activityFeedOpen}
                        onClick={() => setActivityFeedOpen(!activityFeedOpen)}
                    />
                    <UtilityItem
                        icon={<LogOut className="h-4 w-4"/>}
                        label="Log out"
                        isCollapsed={!sidebarOpen}
                        destructive
                        onClick={() => handleLogout(router)}
                    />
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                    <ErrorBoundary>{children}</ErrorBoundary>
                </main>

                {/* Activity Feed Sidebar */}
                {activityFeedOpen && <ActivityFeed onClose={() => setActivityFeedOpen(false)}/>}
            </div>

            {/* Keyboard shortcuts modal */}
            <KeyboardShortcutsModal isOpen={shortcutsModalOpen} onClose={() => setShortcutsModalOpen(false)}/>

            <Toaster/>
        </div>
    )
}

const handleLogout = async (router: AppRouterInstance) => {
    try {

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
    }
}

function SectionLabel({children, visible}: { children: React.ReactNode; visible: boolean }) {
    if (!visible) return <div className="h-3" aria-hidden/>

    return (
        <p className="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70 select-none">
            {children}
        </p>
    )
}

interface NavItemProps {
    href: string
    icon: React.ReactNode
    label: string
    isActive: boolean
    isCollapsed: boolean
    muted?: boolean
    trailing?: React.ReactNode
}

function NavItem({href, icon, label, isActive, isCollapsed, muted = false, trailing}: NavItemProps) {
    return (
        <Link href={href} className="block" title={isCollapsed ? label : undefined}>
            <div
                className={cn(
                    "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                    "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    muted && "text-muted-foreground/70",
                    isActive &&
                    "bg-primary/10 text-primary font-medium hover:bg-primary/10 hover:text-primary " +
                    "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 " +
                    "before:h-4 before:w-[3px] before:rounded-full before:bg-primary",
                    isCollapsed && "justify-center px-0",
                )}
            >
                <span className="shrink-0">{icon}</span>
                {!isCollapsed && <span className="truncate">{label}</span>}
                {!isCollapsed && trailing}
            </div>
        </Link>
    )
}

interface UtilityItemProps {
    icon: React.ReactNode
    label: string
    isCollapsed: boolean
    isActive?: boolean
    destructive?: boolean
    onClick: () => void
}

function UtilityItem({icon, label, isCollapsed, isActive = false, destructive = false, onClick}: UtilityItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={isCollapsed ? label : undefined}
            className={cn(
                "w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive && "bg-accent text-foreground",
                destructive && "hover:bg-destructive/10 hover:text-destructive",
                isCollapsed && "justify-center px-0",
            )}
        >
            <span className="shrink-0">{icon}</span>
            {!isCollapsed && <span className="truncate">{label}</span>}
        </button>
    )
}
