"use client"

import type React from "react"
import {useState} from "react"
import {Button} from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {toast} from "@/hooks/use-toast"
import {Loader2, Plus} from "lucide-react"
import {useTeam} from "@/contexts/team-context"
import {CONSTANTS} from "@/app/const";
import {teamsApi} from "@/lib/api-service";

interface CreateTeamModalProps {
    triggerClassName?: string
    triggerVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    triggerSize?: "default" | "sm" | "lg" | "icon"
    triggerText?: string
    triggerIcon?: boolean
    onTeamCreated?: () => void
}

export function CreateTeamModal({
                                    triggerClassName,
                                    triggerVariant = "default",
                                    triggerSize = "default",
                                    triggerText = "Create Team",
                                    triggerIcon = true,
                                    onTeamCreated,
                                }: CreateTeamModalProps) {
    const [open, setOpen] = useState(false)
    const [newTeamName, setNewTeamName] = useState("")
    const [isCreatingTeam, setIsCreatingTeam] = useState(false)
    const {refreshTeams} = useTeam()

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newTeamName.trim()) {
            toast({
                title: "Error",
                description: "Team name cannot be empty",
                variant: "destructive",
            })
            return
        }

        try {
            setIsCreatingTeam(true)

            const token = localStorage.getItem(CONSTANTS.TOKEN_NAME)

            if (!token) {
                toast({
                    title: "Authentication Error",
                    description: "Please log in to create a team",
                    variant: "destructive",
                })
                return
            }

            const newTeam = await teamsApi.createTeam(newTeamName)

            // Close the modal and reset the form
            setOpen(false)
            setNewTeamName("")

            toast({
                title: "Team Created",
                description: `${newTeam.name} has been created successfully`,
            })

            // Refresh the teams list to include the new team
            await refreshTeams()

            // Call the onTeamCreated callback if provided
            if (onTeamCreated) {
                onTeamCreated()
            }
        } catch (error) {
            console.error("Error creating team:", error)
            toast({
                title: "Error Creating Team",
                description: error instanceof Error ? error.message : "Failed to create team ssLOL",
                variant: "destructive",
            })
        } finally {
            setIsCreatingTeam(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={triggerVariant} size={triggerSize} className={triggerClassName}>
                    {triggerIcon && <Plus className="mr-2 h-4 w-4"/>}
                    {triggerText}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Team</DialogTitle>
                    <DialogDescription>Add a new team to manage products and customers.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTeam}>
                    <div className="space-y-4 py-2 pb-4">
                        <div className="space-y-2">
                            <Label htmlFor="team-name">Team name</Label>
                            <Input
                                id="team-name"
                                placeholder="My Team"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isCreatingTeam}>
                            {isCreatingTeam ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Creating...
                                </>
                            ) : (
                                "Create Team"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
