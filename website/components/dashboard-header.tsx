"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Bell, Building, ChevronDown, Menu, Search, X} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useToast} from "@/hooks/use-toast"
import {Select, SelectContent, SelectItem, SelectTrigger} from "@/components/ui/select"
import {ThemeToggle} from "@/components/theme-toggle"
import {useTeam} from "@/contexts/team-context"
import {authApi} from "@/lib/api-service"
import {Tenant} from "@/models/tenant"
import {CONSTANTS} from "@/app/const"

export function DashboardHeader({toggleSidebar, isSidebarOpen}: {
    toggleSidebar: () => void
    isSidebarOpen: boolean
}) {
    const router = useRouter()
    const [showSearch, setShowSearch] = useState(false)
    const {toast} = useToast()
    const {teams, selectedTeam, setSelectedTeam} = useTeam()
    const [user, setUser] = useState<Tenant | null>(null)

    useEffect(() => {
        let cancelled = false

        authApi
            .getCurrentUser()
            .then((profile) => {
                if (!cancelled) setUser(profile)
            })
            .catch((err) => {
                console.error("Error fetching profile:", err)
            })

        return () => {
            cancelled = true
        }
    }, [])

    const handleTeamChange = (value: string) => {
        const team = teams.find((team) => team.id === value)
        if (team) {
            setSelectedTeam(team)
        }
    }

    const handleLogout = async () => {
        try {
            await authApi.logout()
        } catch (err) {
            console.error("Error logging out:", err)
        } finally {
            localStorage.removeItem(CONSTANTS.TOKEN_NAME)
            router.push("/login")
        }
    }

    const userInitials = user?.name
        ? user.name
              .split(" ")
              .map((part) => part.charAt(0))
              .slice(0, 2)
              .join("")
              .toUpperCase()
        : "U"

    return (
        <header
            className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card px-4">
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 md:hidden">
                        {isSidebarOpen ? <X className="h-4 w-4"/> : <Menu className="h-4 w-4"/>}
                    </Button>

                    <div className="hidden md:flex items-center">
                        <Select value={selectedTeam?.id ?? ""} onValueChange={handleTeamChange}>
                            <SelectTrigger
                                className="w-[180px] h-8 border-none bg-transparent hover:bg-secondary focus:ring-0">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4 text-primary"/>
                                    <span className="text-sm font-medium">{selectedTeam?.name ?? "Select team"}</span>
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map((team) => (
                                    <SelectItem key={team.id} value={team.id}>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-primary"/>
                                            <span>{team.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div
                    className={`${showSearch ? "flex flex-1 mx-2" : "hidden md:flex"} relative md:w-[250px] lg:w-[350px]`}>
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="w-full bg-muted/50 border-border pl-8 h-9 text-sm"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden"
                            onClick={() => setShowSearch(!showSearch)}>
                        {showSearch ? <X className="h-4 w-4"/> : <Search className="h-4 w-4"/>}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Building className="h-4 w-4 text-primary"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 md:hidden">
                            <DropdownMenuLabel>Select Team</DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            {teams.map((team) => (
                                <DropdownMenuItem
                                    key={team.id}
                                    onClick={() => setSelectedTeam(team)}
                                    className={selectedTeam?.id === team.id ? "bg-secondary" : ""}
                                >
                                    <Building className="mr-2 h-4 w-4 text-primary"/>
                                    <span>{team.name}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <ThemeToggle/>

                    <Button variant="ghost" size="icon" className="relative h-8 w-8">
                        <Bell className="h-4 w-4"/>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1 hidden md:flex h-8 sm:h-9">
                                <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                                    <AvatarImage src="/placeholder.svg?height=28&width=28" alt={user?.name ?? "User"}/>
                                    <AvatarFallback
                                        className="bg-secondary text-foreground text-xs">{userInitials}</AvatarFallback>
                                </Avatar>
                                <span className="hidden lg:inline-block text-xs sm:text-sm">{user?.name ?? "Account"}</span>
                                <ChevronDown className="h-3.5 w-3.5 opacity-50"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    <span>{user?.name ?? "My Account"}</span>
                                    {user?.email && (
                                        <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                                    )}
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Avatar className="h-7 w-7 md:hidden">
                        <AvatarImage src="/placeholder.svg?height=28&width=28" alt={user?.name ?? "User"}/>
                        <AvatarFallback className="bg-secondary text-foreground text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    )
}
