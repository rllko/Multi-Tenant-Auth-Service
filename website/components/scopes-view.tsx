"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EnhancedScopesView } from "./enhanced-scopes-view"
import { RoleBasedAccessControl } from "./role-based-access-control"
import { OrganizationSelector } from "./organization-selector"
import { Card, CardContent } from "@/components/ui/card"
import { Building } from "lucide-react"

const organizations = [
  { id: "org_1", name: "Acme Inc.", members: 12 },
  { id: "org_2", name: "Globex Corporation", members: 8 },
  { id: "org_3", name: "Initech", members: 5 },
]

export function ScopesView() {
  const [selectedOrganization, setSelectedOrganization] = useState(organizations[0])

  const handleOrganizationChange = (org) => {
    setSelectedOrganization(org)
  }

  return (
    <div className="space-y-6">
      <OrganizationSelector
        organizations={organizations}
        selectedOrganization={selectedOrganization}
        onOrganizationChange={handleOrganizationChange}
      />

      <Card className="bg-primary/5 border-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Building className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">Organization Context</h3>
              <p className="text-sm text-muted-foreground">
                Managing OAuth scopes for <span className="font-medium">{selectedOrganization.name}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="scopes" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 bg-white border">
          <TabsTrigger value="scopes">OAuth Scopes</TabsTrigger>
          <TabsTrigger value="roles">Role Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="scopes" className="mt-6 space-y-6">
          <EnhancedScopesView selectedOrganization={selectedOrganization} />
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <RoleBasedAccessControl selectedOrganization={selectedOrganization} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
