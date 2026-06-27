"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      setError(error.error || new Error("An unknown error occurred"))
      setHasError(true)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(event.reason || new Error("An unhandled promise rejection occurred"))
      setHasError(true)
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])

  if (hasError) {
    if (fallback) {
      return <>{fallback}</>
    }

    const isTimeout = error?.message.includes("timed out")

    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h2 className="text-lg font-semibold">{isTimeout ? "Request Timeout" : "Something went wrong"}</h2>
          </div>
          <p className="mt-3 text-muted-foreground">
            {isTimeout
              ? "The request timed out. Please check your connection and try again."
              : "An unexpected error occurred. Please try again later."}
          </p>
          {error && <div className="mt-4 rounded-md bg-muted p-3 text-sm font-mono">{error.message}</div>}
          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setHasError(false)
                setError(null)
              }}
            >
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
