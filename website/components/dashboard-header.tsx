"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Bell, Menu, Search, ChevronDown, X, Building } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"

// Mock notifications data
const notifications = [
  {
    id: "notif_1",
    title: "New team member joined",
    description: "Jane Smith has joined your organization",
    time: "2 minutes ago",
  },
  {
    id: "notif_2",
    title: "License key activated",
    description: "A license key was activated by user@example.com",
    time: "1 hour ago",
  },
  {
    id: "notif_3",
    title: "Storage limit warning",
    description: "You're approaching your storage limit (85% used)",
    time: "3 hours ago",
  },
]

// Mock data for organizations
const organizations = [
  { id: "org_1", name: "Acme Inc.", members: 12 },
  { id: "org_2", name: "Globex Corporation", members: 8 },
  { id: "org_3", name: "Initech", members: 5 },
]

export function DashboardHeader({ toggleSidebar, isSidebarOpen }) {
  const [showSearch, setShowSearch] = useState(false)
  const { toast } = useToast()
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0])

  const handleNotificationClick = () => {
    // Show the most recent notification as a toast
    const latestNotification = notifications[0]

    toast({
      title: latestNotification.title,
      description: latestNotification.description,
      duration: 5000,
    })

    // Show a second toast after a short delay
    setTimeout(() => {
      toast({
        title: `${notifications.length - 1} more notifications`,
        description: "Click to view all notifications",
        duration: 4000,
      })
    }, 1000)
  }

  const handleOrganizationChange = (value) => {
    const org = organizations.find((org) => org.id === value)
    setSelectedOrganization(org)
    // In a real app, you would dispatch an event or use context to update the organization globally
  }

  return (
    <header className="sticky top-0 z-20 flex h-1 sm:h-12 items-center gap-2 sm:gap-3 border-b bg-white px-3 sm:px-4">
      <div className="flex h-12 items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 md:hidden">
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* Organization Selector */}
          <div className="hidden md:flex items-center">
            <Select value={selectedOrganization.id} onValueChange={handleOrganizationChange}>
              <SelectTrigger className="w-[180px] h-8 border-none bg-transparent hover:bg-accent focus:ring-0">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{selectedOrganization.name}</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-primary" />
                      <span>{org.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search - hidden by default on mobile, toggleable */}
        <div className={`${showSearch ? "flex flex-1 mx-2" : "hidden md:flex"} relative md:w-[250px] lg:w-[350px]`}>
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-secondary/50 pl-7 sm:pl-8 h-8 sm:h-9 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Search toggle for mobile */}
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setShowSearch(!showSearch)}>
            {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>

          {/* Mobile Organization Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Building className="h-4 w-4 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 md:hidden">
              <DropdownMenuLabel>Select Organization</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  onClick={() => setSelectedOrganization(org)}
                  className={selectedOrganization.id === org.id ? "bg-accent" : ""}
                >
                  <Building className="mr-2 h-4 w-4 text-primary" />
                  <span>{org.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-8 w-8" onClick={handleNotificationClick}>
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 hidden md:flex h-8 sm:h-9">
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                  <AvatarImage src="/placeholder.svg?height=28&width=28" alt="User" />
                  <AvatarFallback className="bg-secondary text-foreground text-xs">JD</AvatarFallback>
                </Avatar>
                <span className="hidden lg:inline-block text-xs sm:text-sm">John Doe</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile avatar */}
          <Avatar className="h-7 w-7 md:hidden">
            <AvatarImage src="/placeholder.svg?height=28&width=28" alt="User" />
            <AvatarFallback className="bg-secondary text-foreground text-xs">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
