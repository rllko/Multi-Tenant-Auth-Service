"use client"

import type React from "react"
import {useState} from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {Checkbox} from "@/components/ui/checkbox"
import {Loader2} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {rolesApi} from "@/lib/api-service";

interface CreateRoleModalProps {
    isOpen: boolean
    onClose: () => void
    teamId: string
    onRoleCreated: () => void
}

export function CreateRoleModal({isOpen, onClose, teamId, onRoleCreated}: CreateRoleModalProps) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isDefault, setIsDefault] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const {toast} = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!name.trim()) {
            toast({
                title: "Validation Error",
                description: "Role name is required",
                variant: "destructive",
            })
            return
        }

        try {
            setIsSubmitting(true)

            await rolesApi.createRole(teamId, {
                name,
                description,
                isDefault,
                scopes: [],
            })

            toast({
                title: "Role created",
                description: `Role "${name}" has been created successfully.`,
            })

            setName("")
            setDescription("")
            setIsDefault(false)

            onClose()
            onRoleCreated()
        } catch (error) {
            console.error("Error creating role:", error)
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create role. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogDescription>Add a new role to define permissions for team members.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Admin, Editor, Viewer"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the purpose of this role"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox id="isDefault" checked={isDefault}
                                  onCheckedChange={(checked) => setIsDefault(!!checked)}/>
                        <Label htmlFor="isDefault" className="font-normal">
                            Set as default role for new users
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                                    Creating...
                                </>
                            ) : (
                                "Create Role"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
