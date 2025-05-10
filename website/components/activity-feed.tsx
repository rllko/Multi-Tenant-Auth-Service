"use client"

import {useState} from "react"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Clock, Download, Filter, Search, X} from "lucide-react"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {Separator} from "@/components/ui/separator"
import {Badge} from "@/components/ui/badge"

const activityItems = [
    {
        id: "act_1",
        timestamp: "2023-06-15T14:30:00Z",
        user: {
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        action: "Added user Alice Brown to Customer Portal with Viewer role",
        type: "team",
        appId: "app_1",
        appName: "Customer Portal",
        appIcon: "🏪",
    },
    {
        id: "act_2",
        timestamp: "2023-06-14T10:15:00Z",
        user: {
            name: "Jane Smith",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        action: "Created new OAuth client 'Analytics Bot'",
        type: "oauth",
        appId: "app_2",
        appName: "Analytics Dashboard",
        appIcon: "📊",
    },
    {
        id: "act_3",
        timestamp: "2023-06-13T16:45:00Z",
        user: {
            name: "System",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        action: "Rotated secret for 'License Manager Bot' client",
        type: "oauth",
        appId: "app_3",
        appName: "License Manager",
        appIcon: "🔑",
    },
    {
        id: "act_4",
        timestamp: "2023-06-12T09:20:00Z",
        user: {
            name: "John Doe",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        action: "Updated permissions for Bob Johnson in Customer Portal",
        type: "team",
        appId: "app_1",
        appName: "Customer Portal",
        appIcon: "🏪",
    },
    {
        id: "act_5",
        timestamp: "2023-06-11T11:30:00Z",
        user: {
            name: "Jane Smith",
            avatar: "/placeholder.svg?height=40&width=40",
        },
        action: "Added new app 'License Manager'",
        type: "app",
        appId: "app_3",
        appName: "License Manager",
        appIcon: "🔑",
    },
]

interface ActivityFeedProps {
    onClose: () => void
}

export function ActivityFeed({onClose}: ActivityFeedProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState("all")
    const [appFilter, setAppFilter] = useState("all")

    const filteredItems = activityItems.filter((item) => {
        const matchesSearch =
            searchQuery === "" ||
            item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.user.name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesType = typeFilter === "all" || item.type === typeFilter

        const matchesApp = appFilter === "all" || item.appId === appFilter

        return matchesSearch && matchesType && matchesApp
    })

    const formatRelativeTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
        return `${Math.floor(diffInSeconds / 86400)} days ago`
    }

    const getActivityBadge = (type: string) => {
        switch (type) {
            case "team":
                return <Badge className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600">Team</Badge>
            case "oauth":
                return <Badge className="bg-purple-500 dark:bg-purple-600 hover:bg-purple-600">OAuth</Badge>
            case "app":
                return <Badge className="bg-green-500 dark:bg-green-600 hover:bg-green-600">App</Badge>
            default:
                return <Badge>Other</Badge>
        }
    }

    return (
        <div className="w-80 border-l border-border bg-card dark:bg-[#1E1E1E] flex flex-col h-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold">Activity Feed</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4"/>
                </Button>
            </div>

            <div className="p-4 space-y-3 border-b border-border">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                    <Input
                        placeholder="Search activity..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="flex gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Activity Type"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Activities</SelectItem>
                            <SelectItem value="team">Team</SelectItem>
                            <SelectItem value="oauth">OAuth</SelectItem>
                            <SelectItem value="app">App</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={appFilter} onValueChange={setAppFilter}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="App"/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Apps</SelectItem>
                            <SelectItem value="app_1">Customer Portal</SelectItem>
                            <SelectItem value="app_2">Analytics Dashboard</SelectItem>
                            <SelectItem value="app_3">License Manager</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" size="icon" className="shrink-0">
                        <Filter className="h-4 w-4"/>
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {filteredItems.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No activity found matching your
                            filters.</div>
                    ) : (
                        filteredItems.map((item) => (
                            <div key={item.id} className="space-y-2">
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={item.user.avatar || "/placeholder.svg"} alt={item.user.name}/>
                                        <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{item.user.name}</p>
                                            {getActivityBadge(item.type)}
                                        </div>
                                        <p className="text-sm">{item.action}</p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <div className="flex items-center">
                                                <Clock className="h-3 w-3 mr-1"/>
                                                <span>{formatRelativeTime(item.timestamp)}</span>
                                            </div>
                                            <span>•</span>
                                            <div className="flex items-center">
                                                <span className="mr-1">{item.appIcon}</span>
                                                <span>{item.appName}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Separator/>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border">
                <Button variant="outline" className="w-full" size="sm">
                    <Download className="h-4 w-4 mr-2"/>
                    Export Activity Log
                </Button>
            </div>
        </div>
    )
}
