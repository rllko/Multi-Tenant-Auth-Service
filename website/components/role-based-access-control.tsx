"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Edit, Info, Plus, Search, Shield, Trash } from "lucide-react"
import {
  type Role,
  type Scope,
  type ScopeImpactLevel,
  getImpactLevelColor,
  predefinedRoles,
  predefinedScopes,
  scopeCategories,
} from "./scope-models"

export function RoleBasedAccessControl() {
  const [roles, setRoles] = useState<Role[]>(predefinedRoles)
  const [scopes] = useState<Scope[]>(predefinedScopes)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // New role form state
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    scopes: [],
  })

  // Filter roles based on search query
  const filteredRoles = roles.filter((role) => {
    if (!searchQuery) return true
    return (
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleCreateRole = () => {
    // Generate ID from name
    const id = newRole.name?.toLowerCase().replace(/\s+/g, "_") || `role_${Date.now()}`

    const roleToAdd: Role = {
      id,
      name: newRole.name || "New Role",
      description: newRole.description || "",
      scopes: newRole.scopes || [],
      isCustom: true,
    }

    setRoles([...roles, roleToAdd])
    setIsCreateDialogOpen(false)
    resetNewRole()
  }

  const handleEditRole = () => {
    if (!selectedRole) return

    setRoles(roles.map((role) => (role.id === selectedRole.id ? selectedRole : role)))
    setIsViewDialogOpen(false)
  }

  const handleDeleteRole = () => {
    if (!selectedRole) return

    setRoles(roles.filter((role) => role.id !== selectedRole.id))
    setIsDeleteDialogOpen(false)
    setSelectedRole(null)
  }

  const resetNewRole = () => {
    setNewRole({
      name: "",
      description: "",
      scopes: [],
    })
  }

  const handleScopeToggle = (scopeId: string) => {
    if (!selectedRole) return

    const updatedScopes = selectedRole.scopes.includes(scopeId)
      ? selectedRole.scopes.filter((id) => id !== scopeId)
      : [...selectedRole.scopes, scopeId]

    setSelectedRole({
      ...selectedRole,
      scopes: updatedScopes,
    })
  }

  const handleNewRoleScopeToggle = (scopeId: string) => {
    const currentScopes = newRole.scopes || []

    const updatedScopes = currentScopes.includes(scopeId)
      ? currentScopes.filter((id) => id !== scopeId)
      : [...currentScopes, scopeId]

    setNewRole({
      ...newRole,
      scopes: updatedScopes,
    })
  }

  // Group scopes by category for the UI
  const getScopesByCategory = () => {
    return scopes.reduce(
      (acc, scope) => {
        const category = scope.category
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(scope)
        return acc
      },
      {} as Record<string, Scope[]>,
    )
  }

  const scopesByCategory = getScopesByCategory()

  // Get the highest impact level from a role's scopes
  const getRoleHighestImpact = (role: Role): ScopeImpactLevel => {
    const roleScopes = scopes.filter((scope) => role.scopes.includes(scope.id))
    if (roleScopes.some((scope) => scope.impact === "critical")) return "critical"
    if (roleScopes.some((scope) => scope.impact === "high")) return "high"
    if (roleScopes.some((scope) => scope.impact === "medium")) return "medium"
    return "low"
  }

  // Get impact badge for a role
  const getRoleImpactBadge = (role: Role) => {
    const impact = getRoleHighestImpact(role)
    const colorClass = getImpactLevelColor(impact)
    return <Badge className={`${colorClass} border`}>{impact.charAt(0).toUpperCase() + impact.slice(1)} Impact</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Role-Based Access Control</h2>
        <Button
          onClick={() => {
            resetNewRole()
            setIsCreateDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search roles..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.map((role) => (
          <Card
            key={role.id}
            className={`hover:shadow-md transition-shadow cursor-pointer ${role.isCustom ? "border-dashed" : ""}`}
            onClick={() => {
              setSelectedRole(role)
              setIsViewDialogOpen(true)
            }}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  {role.name}
                </CardTitle>
                {getRoleImpactBadge(role)}
              </div>
              <CardDescription className="text-xs font-mono">{role.id}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">
                  {role.scopes.length} scope{role.scopes.length !== 1 ? "s" : ""}
                </Badge>
                {role.isDefault && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                    Default
                  </Badge>
                )}
                {role.isCustom && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 text-xs">
                    Custom
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredRoles.length === 0 && (
          <div className="col-span-full text-center p-8 border rounded-lg border-dashed text-muted-foreground">
            No roles found matching your criteria
          </div>
        )}
      </div>

      {/* View/Edit Role Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {selectedRole?.name}
              {selectedRole?.isDefault && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-2">Default</Badge>
              )}
              {selectedRole?.isCustom && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 ml-2">Custom</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="font-mono">{selectedRole?.id}</DialogDescription>
          </DialogHeader>

          {selectedRole && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={selectedRole.name}
                  onChange={(e) => setSelectedRole({ ...selectedRole, name: e.target.value })}
                  disabled={!selectedRole.isCustom}
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedRole.description}
                  onChange={(e) => setSelectedRole({ ...selectedRole, description: e.target.value })}
                  rows={3}
                  disabled={!selectedRole.isCustom}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Assigned Scopes ({selectedRole.scopes.length})</Label>
                  <Badge className={getImpactLevelColor(getRoleHighestImpact(selectedRole))}>
                    {getRoleHighestImpact(selectedRole).charAt(0).toUpperCase() +
                      getRoleHighestImpact(selectedRole).slice(1)}{" "}
                    Impact
                  </Badge>
                </div>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  <Tabs defaultValue="by-category" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="by-category">By Category</TabsTrigger>
                      <TabsTrigger value="by-impact">By Impact</TabsTrigger>
                    </TabsList>

                    <TabsContent value="by-category">
                      {Object.entries(scopesByCategory).map(([categoryId, categoryScopes]) => (
                        <div key={categoryId} className="mb-4">
                          <h4 className="text-sm font-medium mb-2">
                            {scopeCategories.find((c) => c.id === categoryId)?.name || categoryId}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {categoryScopes.map((scope) => (
                              <div key={scope.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                                <Checkbox
                                  id={`edit-scope-${scope.id}`}
                                  checked={selectedRole.scopes.includes(scope.id)}
                                  onCheckedChange={() => handleScopeToggle(scope.id)}
                                  disabled={!selectedRole.isCustom}
                                />
                                <div>
                                  <Label
                                    htmlFor={`edit-scope-${scope.id}`}
                                    className="font-normal cursor-pointer text-sm flex items-center"
                                  >
                                    {scope.name}
                                    <Badge className={`${getImpactLevelColor(scope.impact)} border ml-2 text-xs`}>
                                      {scope.impact}
                                    </Badge>
                                  </Label>
                                  <p className="text-xs text-muted-foreground">{scope.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="by-impact">
                      {["critical", "high", "medium", "low"].map((impact) => (
                        <div key={impact} className="mb-4">
                          <h4 className={`text-sm font-medium mb-2 flex items-center`}>
                            <Badge className={`${getImpactLevelColor(impact as ScopeImpactLevel)} border mr-2`}>
                              {impact.charAt(0).toUpperCase() + impact.slice(1)}
                            </Badge>
                            Impact Scopes
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {scopes
                              .filter((scope) => scope.impact === impact)
                              .map((scope) => (
                                <div key={scope.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                                  <Checkbox
                                    id={`edit-impact-${scope.id}`}
                                    checked={selectedRole.scopes.includes(scope.id)}
                                    onCheckedChange={() => handleScopeToggle(scope.id)}
                                    disabled={!selectedRole.isCustom}
                                  />
                                  <div>
                                    <Label
                                      htmlFor={`edit-impact-${scope.id}`}
                                      className="font-normal cursor-pointer text-sm"
                                    >
                                      {scope.name}
                                    </Label>
                                    <p className="text-xs text-muted-foreground">{scope.description}</p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <div>
              {selectedRole?.isCustom && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    setIsDeleteDialogOpen(true)
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Cancel
              </Button>
              {selectedRole?.isCustom ? (
                <Button onClick={handleEditRole}>
                  <Edit className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              ) : (
                <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Role Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Define a new role with specific scopes and permissions</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="new-name">Role Name</Label>
              <Input
                id="new-name"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                placeholder="e.g. License Manager"
              />
            </div>

            <div>
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Describe what this role is for"
                rows={3}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Assign Scopes ({newRole.scopes?.length || 0})</Label>
                {newRole.scopes?.length ? (
                  <Badge
                    className={getImpactLevelColor(
                      getRoleHighestImpact({
                        id: "temp",
                        name: "temp",
                        description: "temp",
                        scopes: newRole.scopes || [],
                      }),
                    )}
                  >
                    {getRoleHighestImpact({
                      id: "temp",
                      name: "temp",
                      description: "temp",
                      scopes: newRole.scopes || [],
                    })
                      .charAt(0)
                      .toUpperCase() +
                      getRoleHighestImpact({
                        id: "temp",
                        name: "temp",
                        description: "temp",
                        scopes: newRole.scopes || [],
                      }).slice(1)}{" "}
                    Impact
                  </Badge>
                ) : (
                  <Badge variant="outline">No scopes selected</Badge>
                )}
              </div>
              <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                <Tabs defaultValue="by-category" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="by-category">By Category</TabsTrigger>
                    <TabsTrigger value="by-impact">By Impact</TabsTrigger>
                  </TabsList>

                  <TabsContent value="by-category">
                    {Object.entries(scopesByCategory).map(([categoryId, categoryScopes]) => (
                      <div key={categoryId} className="mb-4">
                        <h4 className="text-sm font-medium mb-2">
                          {scopeCategories.find((c) => c.id === categoryId)?.name || categoryId}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {categoryScopes.map((scope) => (
                            <div key={scope.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                              <Checkbox
                                id={`new-scope-${scope.id}`}
                                checked={newRole.scopes?.includes(scope.id) || false}
                                onCheckedChange={() => handleNewRoleScopeToggle(scope.id)}
                              />
                              <div>
                                <Label
                                  htmlFor={`new-scope-${scope.id}`}
                                  className="font-normal cursor-pointer text-sm flex items-center"
                                >
                                  {scope.name}
                                  <Badge className={`${getImpactLevelColor(scope.impact)} border ml-2 text-xs`}>
                                    {scope.impact}
                                  </Badge>
                                </Label>
                                <p className="text-xs text-muted-foreground">{scope.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="by-impact">
                    {["critical", "high", "medium", "low"].map((impact) => (
                      <div key={impact} className="mb-4">
                        <h4 className={`text-sm font-medium mb-2 flex items-center`}>
                          <Badge className={`${getImpactLevelColor(impact as ScopeImpactLevel)} border mr-2`}>
                            {impact.charAt(0).toUpperCase() + impact.slice(1)}
                          </Badge>
                          Impact Scopes
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {scopes
                            .filter((scope) => scope.impact === impact)
                            .map((scope) => (
                              <div key={scope.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                                <Checkbox
                                  id={`new-impact-${scope.id}`}
                                  checked={newRole.scopes?.includes(scope.id) || false}
                                  onCheckedChange={() => handleNewRoleScopeToggle(scope.id)}
                                />
                                <div>
                                  <Label
                                    htmlFor={`new-impact-${scope.id}`}
                                    className="font-normal cursor-pointer text-sm"
                                  >
                                    {scope.name}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">{scope.description}</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
              <div className="mt-2 flex items-center">
                <Info className="h-4 w-4 mr-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Roles inherit all permissions from their assigned scopes
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRole} disabled={!newRole.name || (newRole.scopes?.length || 0) === 0}>
              Create Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this role? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-3 border rounded-md bg-red-50 text-red-800 gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Deleting this role will remove it from any users or applications that use it.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteRole}>
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
