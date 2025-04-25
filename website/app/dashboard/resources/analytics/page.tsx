import { AnalyticsView } from "@/components/analytics-view"

export default function ResourcesAnalyticsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Monitor usage patterns and performance metrics</p>
      </div>
      <AnalyticsView />
    </div>
  )
}
