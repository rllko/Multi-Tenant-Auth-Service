import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  title: string
  description: string
  icon: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-muted p-3 mb-4 text-muted-foreground">{icon}</div>
        <h3 className="text-lg font-medium mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">{description}</p>
        {action}
      </CardContent>
    </Card>
  )
}
