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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  AlertCircle,
  CreditCard,
  Edit,
  FileText,
  Filter,
  Globe,
  Info,
  Key,
  Plus,
  Search,
  Shield,
  Trash,
  User,
} from "lucide-react"
import {
  type Scope,
  type ScopeImpactLevel,
  getImpactLevelColor,
  getImpactLevelDescription,
  predefinedScopes,
  scopeCategories,
} from "./scope-models"
import { permissionGroups } from "./permissions-manager"

export function EnhancedScopesView() {
  const [scopes, setScopes] = useState<Scope[]>(predefinedScopes)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [impactFilter, setImpactFilter] = useState("all")
  const [selectedScope, setSelectedScope] = useState<Scope | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // New scope form state
  const [newScope, setNewScope] = useState<Partial<Scope>>({
    name: "",
    description: "",
    category: scopeCategories[0].id,
    impact: "low" as ScopeImpactLevel,
    permissions: [],
  })

  // Filter scopes based on search query and filters
  const filteredScopes = scopes.filter((scope) => {
    const matchesSearch =
      searchQuery === "" ||
      scope.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scope.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scope.id.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = categoryFilter === "all" || scope.category === categoryFilter
    const matchesImpact = impactFilter === "all" || scope.impact === impactFilter

    return matchesSearch && matchesCategory && matchesImpact
  })

  // Group scopes by category
  const scopesByCategory = filteredScopes.reduce(
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

  const handleCreateScope = () => {
    // Generate ID from name
    const id = `${newScope.category}.${newScope.name?.toLowerCase().replace(/\s+/g, "_")}`

    const scopeToAdd: Scope = {
      id,
      name: newScope.name || "New Scope",
      description: newScope.description || "",
      category: newScope.category || scopeCategories[0].id,
      impact: newScope.impact || "low",
      permissions: newScope.permissions || [],
      isCustom: true,
    }

    setScopes([...scopes, scopeToAdd])
    setIsCreateDialogOpen(false)
    resetNewScope()
  }

  const handleEditScope = () => {
    if (!selectedScope) return

    setScopes(scopes.map((scope) => (scope.id === selectedScope.id ? selectedScope : scope)))
    setIsViewDialogOpen(false)
  }

  const handleDeleteScope = () => {
    if (!selectedScope) return

    setScopes(scopes.filter((scope) => scope.id !== selectedScope.id))
    setIsDeleteDialogOpen(false)
    setSelectedScope(null)
  }

  const resetNewScope = () => {
    setNewScope({
      name: "",
      description: "",
      category: scopeCategories[0].id,
      impact: "low" as ScopeImpactLevel,
      permissions: [],
    })
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "user":
        return <User className="h-5 w-5" />
      case "license":
        return <Key className="h-5 w-5" />
      case "session":
        return <Activity className="h-5 w-5" />
      case "subscription":
        return <CreditCard className="h-5 w-5" />
      case "log":
        return <FileText className="h-5 w-5" />
      case "global":
        return <Globe className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  const getImpactBadge = (level: ScopeImpactLevel) => {
    const colorClass = getImpactLevelColor(level)
    return <Badge className={`${colorClass} border`}>{level.charAt(0).toUpperCase() + level.slice(1)} Impact</Badge>
  }

  const handlePermissionToggle = (permissionId: string) => {
    if (!selectedScope) return

    const updatedPermissions = selectedScope.permissions.includes(permissionId)
      ? selectedScope.permissions.filter((id) => id !== permissionId)
      : [...selectedScope.permissions, permissionId]

    setSelectedScope({
      ...selectedScope,
      permissions: updatedPermissions,
    })
  }

  const handleNewScopePermissionToggle = (permissionId: string) => {
    const currentPermissions = newScope.permissions || []

    const updatedPermissions = currentPermissions.includes(permissionId)
      ? currentPermissions.filter((id) => id !== permissionId)
      : [...currentPermissions, permissionId]

    setNewScope({
      ...newScope,
      permissions: updatedPermissions,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">OAuth Scopes</h2>
        <Button
          onClick={() => {
            resetNewScope()
            setIsCreateDialogOpen(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Scope
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search scopes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <span>Category</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {scopeCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={impactFilter} onValueChange={setImpactFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <span>Impact Level</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Impacts</SelectItem>
              <SelectItem value="low">Low Impact</SelectItem>
              <SelectItem value="medium">Medium Impact</SelectItem>
              <SelectItem value="high">High Impact</SelectItem>
              <SelectItem value="critical">Critical Impact</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(scopesByCategory).map(([categoryId, categoryScopes]) => (
          <div key={categoryId}>
            <div className="flex items-center gap-2 mb-3">
              {getCategoryIcon(categoryId)}
              <h3 className="text-lg font-semibold">
                {scopeCategories.find((c) => c.id === categoryId)?.name || categoryId}
              </h3>
            </div>
            <div className="space-y-3">
              {categoryScopes.map((scope) => (
                <Card
                  key={scope.id}
                  className={`hover:shadow-md transition-shadow cursor-pointer ${scope.isCustom ? "border-dashed" : ""}`}
                  onClick={() => {
                    setSelectedScope(scope)
                    setIsViewDialogOpen(true)
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">{scope.name}</CardTitle>
                      {getImpactBadge(scope.impact)}
                    </div>
                    <CardDescription className="text-xs font-mono">{scope.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">{scope.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        {scope.permissions.length} permission{scope.permissions.length !== 1 ? "s" : ""}
                      </Badge>
                      {scope.isCustom && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 text-xs">
                          Custom
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {categoryScopes.length === 0 && (
                <div className="text-center p-4 border rounded-lg border-dashed text-muted-foreground">
                  No scopes in this category
                </div>
              )}
            </div>
          </div>
        ))}

        {Object.keys(scopesByCategory).length === 0 && (
          <div className="col-span-full text-center p-8 border rounded-lg border-dashed text-muted-foreground">
            No scopes found matching your criteria
          </div>
        )}
      </div>

      {/* View/Edit Scope Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedScope && getCategoryIcon(selectedScope.category)}
              {selectedScope?.name}
              {selectedScope?.isCustom && (
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 ml-2">Custom</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="font-mono">{selectedScope?.id}</DialogDescription>
          </DialogHeader>

          {selectedScope && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedScope.name}
                    onChange={(e) => setSelectedScope({ ...selectedScope, name: e.target.value })}
                    disabled={!selectedScope.isCustom}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={selectedScope.category}
                    onValueChange={(value) => setSelectedScope({ ...selectedScope, category: value })}
                    disabled={!selectedScope.isCustom}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {scopeCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedScope.description}
                  onChange={(e) => setSelectedScope({ ...selectedScope, description: e.target.value })}
                  rows={3}
                  disabled={!selectedScope.isCustom}
                />
              </div>

              <div>
                <Label htmlFor="edit-impact">Impact Level</Label>
                <div className="mt-1.5">
                  <Select
                    value={selectedScope.impact}
                    onValueChange={(value: ScopeImpactLevel) => setSelectedScope({ ...selectedScope, impact: value })}
                    disabled={!selectedScope.isCustom}
                  >
                    <SelectTrigger id="edit-impact" className={getImpactLevelColor(selectedScope.impact)}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Impact</SelectItem>
                      <SelectItem value="medium">Medium Impact</SelectItem>
                      <SelectItem value="high">High Impact</SelectItem>
                      <SelectItem value="critical">Critical Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  {getImpactLevelDescription(selectedScope.impact)}
                </p>
              </div>

              <div>
                <Label className="mb-2 block">Permissions ({selectedScope.permissions.length})</Label>
                <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                  <Tabs defaultValue={permissionGroups[0].id} className="w-full">
                    <TabsList className="grid grid-cols-3 lg:grid-cols-7 mb-4">
                      {permissionGroups.map((group) => (
                        <TabsTrigger key={group.id} value={group.id} className="text-xs">
                          {group.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {permissionGroups.map((group) => (
                      <TabsContent key={group.id} value={group.id} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {group.permissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50"
                            >
                              <Checkbox
                                id={`edit-${permission.id}`}
                                checked={selectedScope.permissions.includes(permission.id)}
                                onCheckedChange={() => handlePermissionToggle(permission.id)}
                                disabled={!selectedScope.isCustom}
                              />
                              <div>
                                <Label htmlFor={`edit-${permission.id}`} className="font-normal cursor-pointer text-sm">
                                  {permission.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">{permission.id}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center">
            <div>
              {selectedScope?.isCustom && (
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
              {selectedScope?.isCustom ? (
                <Button onClick={handleEditScope}>
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

      {/* Create Scope Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Scope</DialogTitle>
            <DialogDescription>Define a new OAuth scope with specific permissions</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="new-name">Name</Label>
                <Input
                  id="new-name"
                  value={newScope.name}
                  onChange={(e) => setNewScope({ ...newScope, name: e.target.value })}
                  placeholder="e.g. Manage Users"
                />
              </div>
              <div>
                <Label htmlFor="new-category">Category</Label>
                <Select
                  value={newScope.category}
                  onValueChange={(value) => setNewScope({ ...newScope, category: value })}
                >
                  <SelectTrigger id="new-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {scopeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                value={newScope.description}
                onChange={(e) => setNewScope({ ...newScope, description: e.target.value })}
                placeholder="Describe what this scope allows"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="new-impact">Impact Level</Label>
              <div className="mt-1.5">
                <Select
                  value={newScope.impact}
                  onValueChange={(value: ScopeImpactLevel) => setNewScope({ ...newScope, impact: value })}
                >
                  <SelectTrigger id="new-impact" className={getImpactLevelColor(newScope.impact || "low")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Impact</SelectItem>
                    <SelectItem value="medium">Medium Impact</SelectItem>
                    <SelectItem value="high">High Impact</SelectItem>
                    <SelectItem value="critical">Critical Impact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                {getImpactLevelDescription(newScope.impact || "low")}
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Permissions ({newScope.permissions?.length || 0})</Label>
              <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                <Tabs defaultValue={permissionGroups[0].id} className="w-full">
                  <TabsList className="grid grid-cols-3 lg:grid-cols-7 mb-4">
                    {permissionGroups.map((group) => (
                      <TabsTrigger key={group.id} value={group.id} className="text-xs">
                        {group.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {permissionGroups.map((group) => (
                    <TabsContent key={group.id} value={group.id} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.permissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-2 p-2 rounded hover:bg-gray-50">
                            <Checkbox
                              id={`new-${permission.id}`}
                              checked={newScope.permissions?.includes(permission.id) || false}
                              onCheckedChange={() => handleNewScopePermissionToggle(permission.id)}
                            />
                            <div>
                              <Label htmlFor={`new-${permission.id}`} className="font-normal cursor-pointer text-sm">
                                {permission.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">{permission.id}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateScope} disabled={!newScope.name || (newScope.permissions?.length || 0) === 0}>
              Create Scope
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Scope</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this scope? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-3 border rounded-md bg-red-50 text-red-800 gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">Deleting this scope will remove it from any roles or applications that use it.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteScope}>
              Delete Scope
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
