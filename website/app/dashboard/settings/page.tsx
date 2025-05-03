import { SettingsView } from "@/components/settings-view"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="p-6">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-[50vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <SettingsView />
      </Suspense>
    </div>
  )
}
