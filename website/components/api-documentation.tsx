"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { permissionGroups } from "./permissions-manager"

export function ApiDocumentation() {
  const [searchQuery, setSearchQuery] = useState("")

  const filterEndpoints = (endpoints) => {
    if (!searchQuery) return endpoints
    return endpoints.filter((endpoint) => endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">API Documentation</h2>
      </div>

      <div className="relative w-full max-w-md mb-6">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search endpoints..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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
            <Card>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>API endpoints for {group.name.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filterEndpoints(group.permissions).map((endpoint) => (
                    <div key={endpoint.id} className="border-b pb-4 last:border-0">
                      <h3 className="text-lg font-medium mb-2">{endpoint.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Endpoint</p>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            GET /api/v1/{endpoint.id.replace(".", "/")}
                          </code>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Permission</p>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{endpoint.id}</code>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Required Scope</p>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                            {endpoint.id.split(".")[0]}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filterEndpoints(group.permissions).length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No endpoints found matching your search.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
