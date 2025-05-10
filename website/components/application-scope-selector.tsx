"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Info, Shield } from "lucide-react"
import {
  type Role,
  type Scope,
  type ScopeImpactLevel,
  getImpactLevelColor,
  predefinedRoles,
  predefinedScopes,
  scopeCategories,
} from "./scope-models"

interface ApplicationScopeSelectorProps {
  selectedScopes: string[]
  onScopesChange: (scopes: string[]) => void
  onCancel: () => void
  onSave: () => void
}

export function ApplicationScopeSelector({
  selectedScopes,
  onScopesChange,
  onCancel,
  onSave,
}: ApplicationScopeSelectorProps) {
  const [scopes] = useState<Scope[]>(predefinedScopes)
  const [roles] = useState<Role[]>(predefinedRoles)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [showRoleWarning, setShowRoleWarning] = useState(false)

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

  const handleScopeToggle = (scopeId: string) => {
    const updatedScopes = selectedScopes.includes(scopeId)
      ? selectedScopes.filter((id) => id !== scopeId)
      : [...selectedScopes, scopeId]

    onScopesChange(updatedScopes)
  }

  const handleApplyRole = () => {
    if (!selectedRole) return

    const role = roles.find((r) => r.id === selectedRole)
    if (!role) return

    if (selectedScopes.length > 0 && !showRoleWarning) {
      setShowRoleWarning(true)
      return
    }

    onScopesChange(role.scopes)
    setShowRoleWarning(false)
    setSelectedRole("")
  }

  const getHighestImpact = (): ScopeImpactLevel => {
    const selectedScopeObjects = scopes.filter((scope) => selectedScopes.includes(scope.id))
    if (selectedScopeObjects.some((scope) => scope.impact === "critical")) return "critical"
    if (selectedScopeObjects.some((scope) => scope.impact === "high")) return "high"
    if (selectedScopeObjects.some((scope) => scope.impact === "medium")) return "medium"
    return "low"
  }

  return (
    <Card className="shadow-sm border-border bg-white">
      <CardHeader className="flex flex-row items-center justify-between border-b">
        <div className="space-y-1.5">
          <CardTitle>Configure OAuth Scopes</CardTitle>
          <CardDescription>Select the scopes this application will have access to</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {selectedScopes.length > 0 && (
            <Badge className={getImpactLevelColor(getHighestImpact())}>
              {getHighestImpact().charAt(0).toUpperCase() + getHighestImpact().slice(1)} Impact
            </Badge>
          )}
          <Badge variant="outline">
            {selectedScopes.length} scope{selectedScopes.length !== 1 ? "s" : ""} selected
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Apply Role Template</Label>
            <div className="flex gap-2">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a role template" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        {role.name}
                        <span className="text-xs text-muted-foreground ml-2">({role.scopes.length} scopes)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleApplyRole} disabled={!selectedRole}>
                Apply
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              Role templates provide predefined sets of scopes for common use cases
            </p>
          </div>

          {showRoleWarning && (
            <div className="flex items-center p-3 border rounded-md bg-amber-50 text-amber-800 gap-2">
              <AlertCircle className="h-5 w-5" />
              <div className="flex-1">
                <p className="text-sm font-medium">This will replace your current scope selection</p>
                <p className="text-xs">Applying a role template will override any scopes you've already selected.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 hover:bg-amber-100"
                onClick={() => setShowRoleWarning(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-amber-600 hover:bg-amber-700"
                onClick={() => {
                  handleApplyRole()
                  setShowRoleWarning(false)
                }}
              >
                Continue
              </Button>
            </div>
          )}

          <div>
            <Label className="mb-2 block">Available Scopes</Label>
            <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
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
                              id={`scope-${scope.id}`}
                              checked={selectedScopes.includes(scope.id)}
                              onCheckedChange={() => handleScopeToggle(scope.id)}
                            />
                            <div>
                              <Label
                                htmlFor={`scope-${scope.id}`}
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
                                id={`impact-${scope.id}`}
                                checked={selectedScopes.includes(scope.id)}
                                onCheckedChange={() => handleScopeToggle(scope.id)}
                              />
                              <div>
                                <Label htmlFor={`impact-${scope.id}`} className="font-normal cursor-pointer text-sm">
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={onSave}>Save Scopes</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
