"use client"

import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Card, CardContent} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Building, ChevronDown, ChevronRight, Edit, Plus} from "lucide-react"

export function OrganizationSelector({organizations, selectedOrganization, onOrganizationChange}) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [newOrgName, setNewOrgName] = useState("")
    const [editOrgName, setEditOrgName] = useState("")

    const handleCreateOrg = () => {
        setCreateDialogOpen(false)
        setNewOrgName("")
    }

    const handleEditOrg = () => {
        setEditDialogOpen(false)
    }

    const handleEditClick = (e) => {
        e.stopPropagation()
        setEditOrgName(selectedOrganization.name)
        setEditDialogOpen(true)
    }

    return (
        <>
            <Card className="shadow-sm border-border bg-white overflow-hidden">
                <CardContent className="p-0">
                    <div
                        className="p-4 cursor-pointer flex items-center justify-between"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                                <Building className="h-5 w-5 text-primary"/>
                            </div>
                            <div>
                                <h3 className="font-medium text-lg">{selectedOrganization.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {selectedOrganization.members} member{selectedOrganization.members !== 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handleEditClick}>
                                <Edit className="h-4 w-4"/>
                            </Button>
                            {isExpanded ? <ChevronDown className="h-5 w-5"/> : <ChevronRight className="h-5 w-5"/>}
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="border-t">
                            <div className="p-2 max-h-[300px] overflow-y-auto">
                                {organizations.map((org) => (
                                    <div
                                        key={org.id}
                                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-50 ${
                                            selectedOrganization.id === org.id ? "bg-gray-100" : ""
                                        }`}
                                        onClick={() => {
                                            onOrganizationChange(org)
                                            setIsExpanded(false)
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                                                <Building className="h-4 w-4 text-primary"/>
                                            </div>
                                            <div>
                                                <h4 className="font-medium">{org.name}</h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {org.members} member{org.members !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedOrganization.id === org.id &&
                                            <ChevronRight className="h-4 w-4 text-primary"/>}
                                    </div>
                                ))}
                            </div>
                            <div className="border-t p-2">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setCreateDialogOpen(true)
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4"/>
                                    Create New Organization
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create New Organization</DialogTitle>
                        <DialogDescription>Add a new organization to manage teams and permissions.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="org-name">Organization Name</Label>
                            <Input
                                id="org-name"
                                value={newOrgName}
                                onChange={(e) => setNewOrgName(e.target.value)}
                                placeholder="Acme Inc."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateOrg} disabled={!newOrgName.trim()}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Organization</DialogTitle>
                        <DialogDescription>Update organization details</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-org-name">Organization Name</Label>
                            <Input
                                id="edit-org-name"
                                value={editOrgName}
                                onChange={(e) => setEditOrgName(e.target.value)}
                                placeholder="Acme Inc."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditOrg} disabled={!editOrgName.trim()}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
