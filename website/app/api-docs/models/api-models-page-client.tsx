"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchApiModels } from "@/lib/api-service"
import type { ApiModelSchema } from "@/lib/schemas"
import type { z } from "zod"
import { AlertCircle, Search } from "lucide-react"

export function ApiModelsPageClient() {
  const [models, setModels] = useState<z.infer<typeof ApiModelSchema>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedModel, setSelectedModel] = useState<z.infer<typeof ApiModelSchema> | null>(null)

  useEffect(() => {
    const loadApiModels = async () => {
      try {
        setIsLoading(true)
        const apiModels = await fetchApiModels()
        setModels(apiModels)
        if (apiModels.length > 0) {
          setSelectedModel(apiModels[0])
        }
        setError(null)
      } catch (err) {
        console.error("Failed to fetch API models:", err)
        setError("Failed to load API models. Please try again.")
        // Set fallback data
        const fallbackModels = [
          {
            name: "User",
            description: "User model representing an authenticated user",
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                email: { type: "string", format: "email" },
                name: { type: "string" },
                role: { type: "string", enum: ["admin", "user", "guest"] },
                createdAt: { type: "string", format: "date-time" },
              },
              required: ["id", "email", "role"],
            },
            endpoints: [
              {
                path: "/users",
                method: "GET",
                description: "List all users",
              },
              {
                path: "/users/{id}",
                method: "GET",
                description: "Get a user by ID",
                parameters: [
                  {
                    name: "id",
                    type: "string",
                    required: true,
                    description: "User ID",
                  },
                ],
              },
            ],
            examples: [
              {
                title: "User object",
                code: JSON.stringify(
                  {
                    id: "123e4567-e89b-12d3-a456-426614174000",
                    email: "user@example.com",
                    name: "John Doe",
                    role: "admin",
                    createdAt: "2023-01-01T00:00:00Z",
                  },
                  null,
                  2,
                ),
                language: "json",
              },
            ],
          },
          {
            name: "Application",
            description: "Application model representing an OAuth client",
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                name: { type: "string" },
                clientId: { type: "string" },
                clientSecret: { type: "string" },
                redirectUris: { type: "array", items: { type: "string" } },
                createdAt: { type: "string", format: "date-time" },
              },
              required: ["id", "name", "clientId", "clientSecret"],
            },
            endpoints: [
              {
                path: "/applications",
                method: "GET",
                description: "List all applications",
              },
              {
                path: "/applications/{id}",
                method: "GET",
                description: "Get an application by ID",
                parameters: [
                  {
                    name: "id",
                    type: "string",
                    required: true,
                    description: "Application ID",
                  },
                ],
              },
            ],
          },
        ]
        setModels(fallbackModels)
        setSelectedModel(fallbackModels[0])
      } finally {
        setIsLoading(false)
      }
    }

    loadApiModels()
  }, [])

  const filteredModels = models.filter((model) => model.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>API Models</CardTitle>
              <CardDescription>Browse available data models in the API</CardDescription>
              <div className="mt-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search models..."
                  className="pl-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded-md animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                      <button
                        key={model.name}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                          selectedModel?.name === model.name ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                        }`}
                        onClick={() => setSelectedModel(model)}
                      >
                        {model.name}
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No models found</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:w-2/3">
          {isLoading ? (
            <Card>
              <CardHeader className="animate-pulse bg-muted h-24 rounded-t-lg"></CardHeader>
              <CardContent className="animate-pulse bg-muted/50 h-96 rounded-b-lg"></CardContent>
            </Card>
          ) : selectedModel ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedModel.name}</CardTitle>
                <CardDescription>{selectedModel.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="schema">
                  <TabsList className="mb-4">
                    <TabsTrigger value="schema">Schema</TabsTrigger>
                    <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                    {selectedModel.examples && selectedModel.examples.length > 0 && (
                      <TabsTrigger value="examples">Examples</TabsTrigger>
                    )}
                  </TabsList>

                  <TabsContent value="schema">
                    <div className="rounded-md bg-muted p-4">
                      <pre className="text-sm overflow-auto max-h-[500px]">
                        {JSON.stringify(selectedModel.schema, null, 2)}
                      </pre>
                    </div>
                  </TabsContent>

                  <TabsContent value="endpoints">
                    {selectedModel.endpoints && selectedModel.endpoints.length > 0 ? (
                      <div className="space-y-4">
                        {selectedModel.endpoints.map((endpoint, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2 py-1 text-xs font-bold rounded ${
                                  endpoint.method === "GET"
                                    ? "bg-blue-100 text-blue-800"
                                    : endpoint.method === "POST"
                                      ? "bg-green-100 text-green-800"
                                      : endpoint.method === "PUT"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : endpoint.method === "DELETE"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {endpoint.method}
                              </span>
                              <code className="text-sm font-mono">{endpoint.path}</code>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{endpoint.description}</p>

                            {endpoint.parameters && endpoint.parameters.length > 0 && (
                              <div className="mt-2">
                                <h4 className="text-sm font-medium mb-1">Parameters:</h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                  {endpoint.parameters.map((param, pIndex) => (
                                    <li key={pIndex}>
                                      <code>{param.name}</code> ({param.type})
                                      {param.required && <span className="text-red-500">*</span>}
                                      {param.description && ` - ${param.description}`}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">No endpoints defined</div>
                    )}
                  </TabsContent>

                  {selectedModel.examples && selectedModel.examples.length > 0 && (
                    <TabsContent value="examples">
                      <div className="space-y-4">
                        {selectedModel.examples.map((example, index) => (
                          <div key={index}>
                            <h4 className="text-sm font-medium mb-2">{example.title}</h4>
                            <div className="rounded-md bg-muted p-4">
                              <pre className="text-sm overflow-auto max-h-[300px]">{example.code}</pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  )}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-64 border rounded-lg">
              <p className="text-muted-foreground">Select a model to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
