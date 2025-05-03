"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Plus, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTeam } from "@/contexts/team-context"

export function TeamMembersView() {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { selectedTeam } = useTeam()

  useEffect(() => {
    const loadTeamMembers = async () => {
      if (!selectedTeam) return

      try {
        setIsLoading(true)

        // Real API call to fetch team members
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${selectedTeam.id}/members`)

        if (!response.ok) {
          throw new Error(`Failed to fetch team members: ${response.status}`)
        }

        const data = await response.json()
        setMembers(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch team members:", err)
        setError("Failed to load team members. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadTeamMembers()
  }, [selectedTeam])

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Team context banner */}
      {selectedTeam && (
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="font-semibold text-primary">{selectedTeam.name.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-medium">Team: {selectedTeam.name}</h3>
              <p className="text-xs text-muted-foreground">Managing team members</p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage your team members and their access levels.</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search members..."
              className="pl-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading team members...</span>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-3 text-sm font-medium text-muted-foreground">
                <div>Name</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
                <div>Last Active</div>
              </div>
              <div className="divide-y">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div key={member.id} className="grid grid-cols-5 p-3 text-sm">
                      <div className="font-medium">{member.name}</div>
                      <div>{member.email}</div>
                      <div>{member.role}</div>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            member.status === "active"
                              ? "bg-green-50 text-green-700"
                              : member.status === "invited"
                                ? "bg-yellow-50 text-yellow-700"
                                : "bg-gray-50 text-gray-700"
                          }`}
                        >
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </span>
                      </div>
                      <div>
                        {member.lastActive
                          ? new Date(member.lastActive).toLocaleDateString()
                          : member.status === "invited"
                            ? "Not joined yet"
                            : "Never"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">No members found</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
