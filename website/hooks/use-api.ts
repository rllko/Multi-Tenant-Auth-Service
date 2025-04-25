"use client"

import { useState, useEffect, useCallback } from "react"

interface UseApiOptions<T> {
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  dependencies?: any[]
  autoFetch?: boolean
}

interface UseApiResult<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  setData: (data: T | ((prev: T | null) => T)) => void
}

/**
 * Custom hook for API data fetching with loading and error states
 */
export function useApi<T>(fetchFn: () => Promise<T>, options: UseApiOptions<T> = {}): UseApiResult<T> {
  const { initialData = null, onSuccess, onError, dependencies = [], autoFetch = true } = options

  const [data, setData] = useState<T | null>(initialData)
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
      if (onSuccess) onSuccess(result)
    } catch (err) {
      console.error("API error:", err)
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      if (onError) onError(error)
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn, onSuccess, onError])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [...dependencies, fetchFn])

  const updateData = useCallback((updater: T | ((prev: T | null) => T)) => {
    setData((prev) => {
      return typeof updater === "function" ? (updater as (prev: T | null) => T)(prev) : updater
    })
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData: updateData,
  }
}

interface UsePaginatedApiOptions<T> extends UseApiOptions<T> {
  pageSize?: number
  initialPage?: number
}

interface UsePaginatedApiResult<T> extends UseApiResult<T[]> {
  page: number
  totalPages: number
  totalItems: number
  hasMore: boolean
  loadMore: () => Promise<void>
  setPage: (page: number) => void
}

/**
 * Custom hook for paginated API data fetching
 */
export function usePaginatedApi<T>(
  fetchFn: (page: number, limit: number) => Promise<{ data: T[]; pagination: { total: number; pages: number } }>,
  options: UsePaginatedApiOptions<T[]> = {},
): UsePaginatedApiResult<T> {
  const {
    initialData = [],
    pageSize = 10,
    initialPage = 1,
    onSuccess,
    onError,
    dependencies = [],
    autoFetch = true,
  } = options

  const [data, setData] = useState<T[]>(initialData)
  const [page, setPage] = useState<number>(initialPage)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalItems, setTotalItems] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(autoFetch)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(
    async (pageToFetch: number = page) => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await fetchFn(pageToFetch, pageSize)

        if (pageToFetch === 1) {
          setData(result.data)
        } else {
          setData((prev) => [...prev, ...result.data])
        }

        setTotalPages(result.pagination.pages)
        setTotalItems(result.pagination.total)
        setPage(pageToFetch)

        if (onSuccess) onSuccess(result.data)
      } catch (err) {
        console.error("API error:", err)
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        if (onError) onError(error)
      } finally {
        setIsLoading(false)
      }
    },
    [fetchFn, page, pageSize, onSuccess, onError],
  )

  useEffect(() => {
    if (autoFetch) {
      fetchData(initialPage)
    }
  }, [...dependencies, fetchFn])

  const loadMore = useCallback(async () => {
    if (page < totalPages && !isLoading) {
      await fetchData(page + 1)
    }
  }, [fetchData, page, totalPages, isLoading])

  const updateData = useCallback((updater: T[] | ((prev: T[]) => T[])) => {
    setData((prev) => {
      return typeof updater === "function" ? (updater as (prev: T[]) => T[])(prev) : updater
    })
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(1),
    setData: updateData,
    page,
    totalPages,
    totalItems,
    hasMore: page < totalPages,
    loadMore,
    setPage: (newPage: number) => fetchData(newPage),
  }
}

/**
 * Custom hook for API mutations (create, update, delete)
 */
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
  } = {},
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [data, setData] = useState<TData | null>(null)

  const mutate = async (variables: TVariables) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await mutationFn(variables)
      setData(result)
      if (options.onSuccess) {
        options.onSuccess(result, variables)
      }
      return result
    } catch (err) {
      console.error("API mutation error:", err)
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)
      if (options.onError) {
        options.onError(error, variables)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutate,
    isLoading,
    error,
    data,
    reset: () => {
      setData(null)
      setError(null)
    },
  }
}
