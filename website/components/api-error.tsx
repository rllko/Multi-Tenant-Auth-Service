"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ApiErrorProps {
  message: string
  onRetry: () => void
  isRetrying?: boolean
  className?: string
}

export function ApiError({ message, onRetry, isRetrying = false, className }: ApiErrorProps) {
  return (
    <div
      className={cn("rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/50", className)}
    >
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400 mt-0.5 mr-3" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Connection Error</h3>
          <div className="mt-1 text-sm text-red-700 dark:text-red-400">
            <p>{message}</p>
          </div>
          <div className="mt-3">
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              size="sm"
              variant="outline"
              className="bg-white dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Connection
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
