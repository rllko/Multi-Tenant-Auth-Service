"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface TimeoutErrorProps {
  onRetry: () => void
  message?: string
}

export function TimeoutError({
  onRetry,
  message = "The request timed out. Please check your connection and try again.",
}: TimeoutErrorProps) {
  return (
    <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-4 border border-amber-200 dark:border-amber-800">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 dark:text-amber-400">Connection Timeout</h3>
          <div className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            <p>{message}</p>
          </div>
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="bg-white dark:bg-amber-900 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-800"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
