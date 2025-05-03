import { ApiDocsView } from "@/components/api-docs-view"

export default function ResourcesDocsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">API Documentation</h1>
        <p className="text-muted-foreground">Explore and learn how to use our API</p>
      </div>
      <ApiDocsView />
    </div>
  )
}
