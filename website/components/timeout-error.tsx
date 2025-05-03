import { ApiError } from "./api-error"

interface TimeoutErrorProps {
  message?: string
  onRetry: () => void
  isRetrying?: boolean
}

export function TimeoutError({
  message = "The request timed out. Please check your connection and try again.",
  onRetry,
  isRetrying = false,
}: TimeoutErrorProps) {
  return (
    <ApiError
      message={message}
      onRetry={onRetry}
      isRetrying={isRetrying}
      className="min-h-[200px] rounded-lg border bg-card p-8 shadow-sm"
    />
  )
}
