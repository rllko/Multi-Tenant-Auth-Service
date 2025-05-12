"use client"

import type React from "react"

import { useTeam } from "@/contexts/team-context"
import { AlertCircle } from "lucide-react"
import { Loader2 } from "lucide-react"
import { CreateTeamModal } from "./create-team-modal"

interface RequireTeamProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequireTeam({ children, fallback }: RequireTeamProps) {
  const { teams, selectedTeam, isLoading, teamsLoaded } = useTeam()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading teams...</span>
      </div>
    )
  }

  if (teamsLoaded && teams.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">No teams available</p>
            <p className="text-sm">You don't have any teams yet. Create a team to get started.</p>
          </div>
        </div>
        <div className="mt-4">
          <CreateTeamModal triggerIcon={true} triggerText="Create Team" />
        </div>
      </div>
    )
  }

  if (!selectedTeam) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <div>
            <p className="font-medium">No team selected</p>
            <p className="text-sm">Please select a team from the dropdown in the sidebar to continue.</p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
