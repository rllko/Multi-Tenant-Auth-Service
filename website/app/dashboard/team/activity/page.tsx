import { ActivityView } from "@/components/activity-view"

export default function TeamActivityPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Team Activity</h1>
        <p className="text-muted-foreground">Monitor team member actions and system events</p>
      </div>
      <ActivityView />
    </div>
  )
}
