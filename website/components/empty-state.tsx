import type { ReactNode } from "react"

interface EmptyStateProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
      <div className="flex flex-col items-center justify-center text-center p-8 border rounded-lg bg-muted/10">
        {icon && <div className="text-muted-foreground mb-4">{icon}</div>}
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-muted-foreground mt-1 mb-4 max-w-md">{description}</p>
        {action}
      </div>
  )
}
