// Default timeout in milliseconds (10 seconds)
export const DEFAULT_TIMEOUT = 10000

/**
 * Creates a promise that rejects after a specified timeout
 * @param ms Timeout in milliseconds
 * @returns A promise that rejects after the specified timeout
 */
export const createTimeoutPromise = (ms: number = DEFAULT_TIMEOUT): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`))
    }, ms)
  })
}

/**
 * Wraps a promise with a timeout
 * @param promise The promise to wrap
 * @param ms Timeout in milliseconds
 * @returns A promise that resolves with the original promise or rejects with a timeout error
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  ms: number = DEFAULT_TIMEOUT
): Promise<T> => {
  return Promise.race([promise, createTimeoutPromise(ms)])
}

/**
 * Error type for API errors
 */
export type ApiError = {
  message: string
  status?: number
  isTimeout?: boolean
}

/**
 * Creates an API error object
 * @param message Error message
 * @param status HTTP status code
 * @param isTimeout Whether the error is a timeout error
 * @returns An ApiError object
 */
export const createApiError = (
  message: string,
  status?: number,
  isTimeout: boolean = false
): ApiError => {
  return {
    message,
    status,
    isTimeout,
  }
}

/**
 * Handles API errors
 * @param error The error to handle
 * @returns An ApiError object
 */
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    // Check if it's a timeout error
    if (error.message.includes('timed out')) {
      return createApiError(
        'Request timed out. Please check your connection and try again.',
        undefined,
        true
      )
    }
    return createApiError(error.message)
  }
  return createApiError('An unknown error occurred')
}
