"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface Team {
  id: string
  name: string
  slug: string
  logo?: string
}

interface TeamContextType {
  teams: Team[]
  selectedTeam: Team | null
  setSelectedTeam: (team: Team) => void
  isLoading: boolean
  error: string | null
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setIsLoading(true)

        // Real API call to fetch teams
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`)

        if (!response.ok) {
          throw new Error(`Failed to fetch teams: ${response.status}`)
        }

        const data = await response.json()
        setTeams(data)

        // Try to get selected team from localStorage
        const savedTeamId = localStorage.getItem("selectedTeamId")
        if (savedTeamId) {
          const savedTeam = data.find((team: Team) => team.id === savedTeamId)
          if (savedTeam) {
            setSelectedTeam(savedTeam)
          } else if (data.length > 0) {
            setSelectedTeam(data[0])
            localStorage.setItem("selectedTeamId", data[0].id)
          }
        } else if (data.length > 0) {
          setSelectedTeam(data[0])
          localStorage.setItem("selectedTeamId", data[0].id)
        }

        setError(null)
      } catch (err) {
        console.error("Error fetching teams:", err)
        setError("Failed to load teams")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTeams()
  }, [])

  // Update localStorage when selected team changes
  const handleSetSelectedTeam = (team: Team) => {
    setSelectedTeam(team)
    localStorage.setItem("selectedTeamId", team.id)
    console.log("Team switched to:", team.name)
  }

  return (
    <TeamContext.Provider
      value={{
        teams,
        selectedTeam,
        setSelectedTeam: handleSetSelectedTeam,
        isLoading,
        error,
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
