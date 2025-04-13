"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RolesTable } from "./roles-table"
import { PermissionsTable } from "./permissions-table"
import { RolePermissionsManager } from "./role-permissions-manager"
import { PermissionsManager } from "./permissions-manager"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Building } from "lucide-react"

export function RolesPermissionsView({ selectedOrganization }) {
  const [selectedRole, setSelectedRole] = useState(null)
  const [apiPermissionsOpen, setApiPermissionsOpen] = useState(false)

  const handleManageApiPermissions = (role) => {
    setSelectedRole(role)
    setApiPermissionsOpen(true)
  }

  const handleSaveApiPermissions = (permissions) => {
    // In a real app, this would call an API to save the permissions
    console.log("Saving API permissions for role:", selectedRole?.name, permissions)
    setApiPermissionsOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Organization Context Banner */}
      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Organization Context</h3>
              <p className="text-sm text-muted-foreground">
                Managing roles and permissions for <span className="font-medium">{selectedOrganization.name}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="roles" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 bg-white border">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">UI Permissions</TabsTrigger>
          <TabsTrigger value="api-permissions">API Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <RolesTable
              onManageApiPermissions={handleManageApiPermissions}
              selectedOrganization={selectedOrganization}
            />
            <RolePermissionsManager selectedOrganization={selectedOrganization} />
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="mt-6">
          <PermissionsTable selectedOrganization={selectedOrganization} />
        </TabsContent>

        <TabsContent value="api-permissions" className="mt-6">
          <PermissionsManager onSave={handleSaveApiPermissions} selectedOrganization={selectedOrganization} />
        </TabsContent>
      </Tabs>

      <Dialog open={apiPermissionsOpen} onOpenChange={setApiPermissionsOpen} className="max-w-4xl">
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage API Permissions for {selectedRole?.name}</DialogTitle>
            <DialogDescription>Configure which API endpoints this role can access.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto">
            <PermissionsManager
              selectedEntity={selectedRole}
              onSave={handleSaveApiPermissions}
              selectedOrganization={selectedOrganization}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
