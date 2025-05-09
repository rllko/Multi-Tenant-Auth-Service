"use client"

import { useEffect, useState, useRef } from "react"
import { useTeam } from "@/contexts/team-context"
import { TeamMembersView } from "@/components/team-members-view"
import { SelectTeamPrompt } from "@/components/select-team-prompt"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TeamMembersPage() {
  const { selectedTeam } = useTeam()
  const [isLoading, setIsLoading] = useState(true)
  const initialLoadRef = useRef(false)
  const { toast } = useToast()

  useEffect(() => {
    // Only set loading on initial load
    if (!initialLoadRef.current) {
      setIsLoading(true)
      initialLoadRef.current = true
    }

    // If a team is selected, we're no longer loading
    if (selectedTeam) {
      setIsLoading(false)
    }
  }, [selectedTeam])

  if (!selectedTeam) {
    return <SelectTeamPrompt />
  }

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
          <span className="text-lg">Loading team members...</span>
        </div>
    )
  }

  return (
      <div className="p-6">
        <TeamMembersView teamId={selectedTeam.id} />
      </div>
  )
}
