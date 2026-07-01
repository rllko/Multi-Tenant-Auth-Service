"use client"

import { AlertCircle } from "lucide-react"
import { useTeam } from "@/contexts/team-context"
import { CreateTeamModal } from "./create-team-modal"

export function SelectTeamPrompt() {
  const { teams } = useTeam()

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] p-6">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center mb-4 text-amber-600">
          <AlertCircle className="h-6 w-6 mr-2" />
          <h3 className="text-lg font-medium">No team selected</h3>
        </div>
        <p className="text-muted-foreground mb-6">
          Please select a team from the dropdown in the header to view this page.
        </p>
        {teams.length === 0 ? (
          <div className="flex justify-center">
            <CreateTeamModal triggerText="Create a team" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
