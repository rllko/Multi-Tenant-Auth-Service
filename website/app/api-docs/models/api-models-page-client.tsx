"use client"

import { useState, useEffect } from "react"
import { fetchApiModels } from "@/lib/api-service"
import type { ApiModelSchema } from "@/lib/schemas"
import type { z } from "zod"
import { AlertCircle } from "lucide-react"

// Export both as default and named export to ensure compatibility
export function ApiModelsPageClient() {
  const [apiModels, setApiModels] = useState<z.infer<typeof ApiModelSchema>[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  useEffect(() => {
    const loadApiModels = async () => {
      try {
        setIsLoading(true)
        const models = await fetchApiModels()
        setApiModels(models)
        if (models.length > 0) {
          setSelectedModel(models[0].name)
        }
        setError(null)
      } catch (err) {
        console.error("Failed to fetch API models:", err)
        setError("Failed to load API models. Please try again.")
        // Set fallback data
        setApiModels([
          {
            name: "User",
            description: "User account model",
            schema: {
              type: "object",
              properties: {
                id: { type: "string", format: "uuid" },
                email: { type: "string", format: "email" },
                name: { type: "string" },
                role: { type: "string", enum: ["admin", "user"] },
                createdAt: { type: "string", format: "date-time" },
              },
              required: ["id", "email", "name", "role", "createdAt"],
            },
            endpoints: [
              {
                path: "/api/users",
                method: "GET",
                description: "List all users",
              },
              {
                path: "/api/users/{id}",
                method: "GET",
                description: "Get a user by ID",
              },
            ],
            examples: [
              {
                title: "User object",
                code: JSON.stringify(
                  {
                    id: "123e4567-e89b-12d3-a456-426614174000",
                    email: "john@example.com",
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
            description: "OAuth application model",
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
              required: ["id", "name", "clientId", "clientSecret", "redirectUris", "createdAt"],
            },
            endpoints: [
              {
                path: "/api/apps",
                method: "GET",
                description: "List all applications",
              },
              {
                path: "/api/apps/{id}",
                method: "GET",
                description: "Get an application by ID",
              },
            ],
            examples: [
              {
                title: "Application object",
                code: JSON.stringify(
                  {
                    id: "123e4567-e89b-12d3-a456-426614174000",
                    name: "Example App",
                    clientId: "client_123",
                    clientSecret: "secret_456",
                    redirectUris: ["https://example.com/callback"],
                    createdAt: "2023-01-01T00:00:00Z",
                  },
                  null,
                  2,
                ),
                language: "json",
              },
            ],
          },
        ])
        if (!selectedModel && apiModels.length > 0) {
          setSelectedModel(apiModels[0].name)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadApiModels()
  }, [])

  const renderSchemaProperties = (schema: any) => {
    if (!schema || !schema.properties) return null

    return (
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Properties</h3>
        <div className="border rounded-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Required
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(schema.properties).map(([key, value]: [string, any]) => (
                <tr key={key}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {value.type}
                    {value.format && <span className="text-xs ml-1 text-gray-400">({value.format})</span>}
                    {value.enum && <span className="text-xs ml-1 text-gray-400">[{value.enum.join(", ")}]</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schema.required && schema.required.includes(key) ? "Yes" : "No"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{value.description || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderEndpoints = (endpoints: z.infer<typeof ApiModelSchema>["endpoints"]) => {
    if (!endpoints || endpoints.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Endpoints</h3>
        <div className="space-y-4">
          {endpoints.map((endpoint, index) => (
            <div key={index} className="border rounded-md p-4">
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
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
                <code className="ml-2 text-sm font-mono">{endpoint.path}</code>
              </div>
              <p className="mt-2 text-sm text-gray-600">{endpoint.description}</p>

              {endpoint.parameters && endpoint.parameters.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-semibold mb-1">Parameters</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {endpoint.parameters.map((param, idx) => (
                      <li key={idx}>
                        <span className="font-mono">{param.name}</span>
                        <span className="text-gray-500"> ({param.type})</span>
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                        {param.description && <span className="ml-1">- {param.description}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderExamples = (examples: z.infer<typeof ApiModelSchema>["examples"]) => {
    if (!examples || examples.length === 0) return null

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Examples</h3>
        <div className="space-y-4">
          {examples.map((example, index) => (
            <div key={index} className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="text-sm font-semibold">{example.title}</h4>
              </div>
              <div className="p-4 bg-gray-900 text-gray-100 font-mono text-sm overflow-x-auto">
                <pre>{example.code}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const selectedModelData = apiModels.find((model) => model.name === selectedModel)

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">API Models</h1>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center mb-4">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="h-[400px] bg-muted rounded-lg animate-pulse"></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <div className="bg-gray-50 rounded-md p-4 sticky top-4">
              <h2 className="text-lg font-semibold mb-3">Models</h2>
              <ul className="space-y-1">
                {apiModels.map((model) => (
                  <li key={model.name}>
                    <button
                      onClick={() => setSelectedModel(model.name)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedModel === model.name ? "bg-blue-100 text-blue-800 font-medium" : "hover:bg-gray-100"
                      }`}
                    >
                      {model.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="md:col-span-3">
            {selectedModelData ? (
              <div className="bg-white rounded-md border p-6">
                <h2 className="text-2xl font-bold mb-2">{selectedModelData.name}</h2>
                <p className="text-gray-600 mb-6">{selectedModelData.description}</p>

                {renderSchemaProperties(selectedModelData.schema)}
                {renderEndpoints(selectedModelData.endpoints)}
                {renderExamples(selectedModelData.examples)}
              </div>
            ) : (
              <div className="bg-white rounded-md border p-6 text-center text-gray-500">
                Select a model from the sidebar to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Also export as default for compatibility
export default ApiModelsPageClient
