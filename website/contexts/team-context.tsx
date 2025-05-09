"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export interface Team {
  id: string
  name: string
  slug: string
  logo?: string
}

interface TeamContextType {
  teams: Team[]
  setTeams: (teams: Team[]) => void
  selectedTeam: Team | null
  setSelectedTeam: (team: Team) => void
  isLoading: boolean
  teamsLoaded: boolean
  error: string | null
  refreshTeams: () => Promise<void>
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { toast } = useToast()
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [teamsLoaded, setTeamsLoaded] = useState(false)

  const fetchTeams = async () => {
    try {
      setIsLoading(true)

      // Get the auth token from localStorage
      const token = localStorage.getItem("authToken")

      if (!token) {
        const errorMessage = "Authentication required"
        setError(errorMessage)
        setTeamsLoaded(true)
        setIsLoading(false)

        // Show toast notification
        toast({
          title: "Authentication Error",
          description: "Please log in to access this page",
          variant: "destructive",
        })

        // Redirect to login page
        router.push("/login")
        return
      }

      // Ensure we're using the absolute API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      if (!apiUrl) {
        console.error("API URL is not defined in environment variables")
        throw new Error("API configuration error")
      }

      // Use the absolute URL for the API request
      const response = await fetch(`${apiUrl}/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        let errorMessage = `Failed to fetch teams: ${response.status}`

        // Handle specific status codes
        if (response.status === 401) {
          errorMessage = "Your session has expired. Please log in again."
          localStorage.removeItem("authToken")
          router.push("/login")
        } else if (response.status === 403) {
          errorMessage = "You don't have permission to access teams."
        } else if (response.status === 404) {
          errorMessage = "Teams resource not found."
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later."
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      setTeams(data)
      setTeamsLoaded(true)

      // Try to get selected team from localStorage
      const savedTeamId = localStorage.getItem("selectedTeamId")
      if (savedTeamId && data.length > 0) {
        const savedTeam = data.find((team: Team) => team.id === savedTeamId)
        if (savedTeam) {
          setSelectedTeam(savedTeam)
        } else {
          setSelectedTeam(data[0])
          localStorage.setItem("selectedTeamId", data[0].id)
        }
      } else if (data.length > 0) {
        setSelectedTeam(data[0])
        localStorage.setItem("selectedTeamId", data[0].id)
      } else {
        // No teams available
        setSelectedTeam(null)
        localStorage.removeItem("selectedTeamId")

        // Show toast notification for no teams
        toast({
          title: "No Teams Available",
          description: "You don't have any teams. Please create a team to continue.",
          variant: "default",
        })
      }

      setError(null)
    } catch (err) {
      console.error("Error fetching teams:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to load teams"
      setError(errorMessage)
      setTeamsLoaded(true)

      // Show toast notification for the error
      toast({
        title: "Error Loading Teams",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch teams if we're not on the login or register page
    const pathname = window.location.pathname
    if (pathname !== "/login" && pathname !== "/register") {
      fetchTeams()
    }
  }, [toast, router])

  // Update localStorage when selected team changes
  const handleSetSelectedTeam = (team: Team) => {
    setSelectedTeam(team)
    localStorage.setItem("selectedTeamId", team.id)

    // Show toast notification for team switch
    toast({
      title: "Team Switched",
      description: `You are now working in ${team.name}`,
      variant: "default",
    })

    console.log("Team switched to:", team.name)
  }

  // Function to refresh teams list
  const refreshTeams = async () => {
    await fetchTeams()
  }

  return (
      <TeamContext.Provider
          value={{
            teams,
            setTeams,
            selectedTeam,
            setSelectedTeam: handleSetSelectedTeam,
            isLoading,
            teamsLoaded,
            error,
            refreshTeams,
          }}
      >
        {children}
      </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}
