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

      const token = localStorage.getItem("authToken")

      if (!token) {
        const errorMessage = "Authentication required"
        setError(errorMessage)
        setTeamsLoaded(true)
        setIsLoading(false)

        toast({
          title: "Authentication Error",
          description: "Please log in to access this page",
          variant: "destructive",
        })

        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        let errorMessage = `Failed to fetch teams: ${response.status}`

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
        setSelectedTeam(null)
        localStorage.removeItem("selectedTeamId")

        toast({
          title: "No Teams Available",
          description: "You don't have any teams. Please create a team to continue.",
          variant: "default",
        })
      }

      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load teams"
      setError(errorMessage)
      setTeamsLoaded(true)

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
    const pathname = window.location.pathname
    if (pathname !== "/login" && pathname !== "/register") {
      fetchTeams()
    }
  }, [toast, router])

  const handleSetSelectedTeam = (team: Team) => {
    setSelectedTeam(team)
    localStorage.setItem("selectedTeamId", team.id)

    toast({
      title: "Team Switched",
      description: `You are now working in ${team.name}`,
      variant: "default",
    })
  }

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
