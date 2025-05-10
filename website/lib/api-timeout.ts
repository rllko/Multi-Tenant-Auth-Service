export const DEFAULT_TIMEOUT = 10000

export function createTimeoutPromise(ms = DEFAULT_TIMEOUT) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`))
    }, ms)
  })
}

export function withTimeout(promise, ms = DEFAULT_TIMEOUT) {
  return Promise.race([promise, createTimeoutPromise(ms)])
}

export interface ApiError {
  message: string
  status?: number
  isTimeout?: boolean
}

export function createApiError(message: string, status?: number, isTimeout = false): ApiError {
  return {
    message,
    status,
    isTimeout,
  }
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    if (error.message.includes("timed out")) {
      return createApiError("Request timed out. Please check your connection and try again.", undefined, true)
    }
    return createApiError(error.message)
  }
  return createApiError("An unknown error occurred")
}
