"use client"

import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api-service"

// Generic hook for fetching data
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  initialData: T | null = null,
  errorMessage = "Failed to fetch data",
) {
  const [data, setData] = useState<T | null>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isTimeout, setIsTimeout] = useState(false)
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setIsTimeout(false)
    try {
      const result = await fetchFn()
      setData(result)
      setError(null)
    } catch (err) {
      console.error("API Error:", err)
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)

      // Check if it's a timeout error
      const isTimeoutError = error.message.includes("timed out")
      setIsTimeout(isTimeoutError)

      toast({
        title: isTimeoutError ? "Request Timeout" : "Error",
        description: isTimeoutError
          ? "The request timed out. Please check your connection and try again."
          : errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn, errorMessage, toast])

  useEffect(() => {
    fetchData()
  }, [...dependencies, fetchData])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, isTimeout, refetch }
}

// Hook for mutations (create, update, delete)
export function useMutation<T, P>(
  mutationFn: (params: P) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void
    onError?: (error: Error) => void
    successMessage?: string
    errorMessage?: string
  } = {},
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [isTimeout, setIsTimeout] = useState(false)
  const [data, setData] = useState<T | null>(null)
  const { toast } = useToast()

  const mutate = async (params: P) => {
    setIsLoading(true)
    setIsTimeout(false)
    try {
      const result = await mutationFn(params)
      setData(result)
      setError(null)
      if (options.successMessage) {
        toast({
          title: "Success",
          description: options.successMessage,
        })
      }
      if (options.onSuccess) {
        options.onSuccess(result)
      }
      return result
    } catch (err) {
      console.error("API Error:", err)
      const error = err instanceof Error ? err : new Error(String(err))
      setError(error)

      // Check if it's a timeout error
      const isTimeoutError = error.message.includes("timed out")
      setIsTimeout(isTimeoutError)

      toast({
        title: isTimeoutError ? "Request Timeout" : "Error",
        description: isTimeoutError
          ? "The request timed out. Please check your connection and try again."
          : options.errorMessage || error.message,
        variant: "destructive",
      })
      if (options.onError) {
        options.onError(error)
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return { mutate, isLoading, error, isTimeout, data }
}

// Specific API hooks
export function useTeams() {
  return useFetch(() => apiService.teams.getTeams(), [], [], "Failed to fetch teams")
}

export function useTeam(teamId: string | null) {
  return useFetch(
    () => (teamId ? apiService.teams.getTeam(teamId) : Promise.resolve(null)),
    [teamId],
    null,
    "Failed to fetch team details",
  )
}

export function useTeamMembers(teamId: string | null) {
  return useFetch(
    () => (teamId ? apiService.teams.getTeamMembers(teamId) : Promise.resolve([])),
    [teamId],
    [],
    "Failed to fetch team members",
  )
}

export function useApps(teamId: string | null) {
  return useFetch(
    () => (teamId ? apiService.apps.getApps(teamId) : Promise.resolve([])),
    [teamId],
    [],
    "Failed to fetch applications",
  )
}

export function useApp(teamId: string | null, appId: string | null) {
  return useFetch(
    () => (teamId && appId ? apiService.apps.getApp(teamId, appId) : Promise.resolve(null)),
    [teamId, appId],
    null,
    "Failed to fetch application details",
  )
}

export function useLicenses(teamId: string | null, appId: string | null) {
  return useFetch(
    () => (teamId && appId ? apiService.licenses.getLicenses(teamId, appId) : Promise.resolve([])),
    [teamId, appId],
    [],
    "Failed to fetch licenses",
  )
}

export function useSessions(teamId: string | null, appId: string | null) {
  return useFetch(
    () => (teamId && appId ? apiService.sessions.getSessions(teamId, appId) : Promise.resolve([])),
    [teamId, appId],
    [],
    "Failed to fetch sessions",
  )
}

export function useOAuthClients(teamId: string | null, appId: string | null) {
  return useFetch(
    () => (teamId && appId ? apiService.oauth.getClients(teamId, appId) : Promise.resolve([])),
    [teamId, appId],
    [],
    "Failed to fetch OAuth clients",
  )
}

export function useRoles(teamId: string | null) {
  return useFetch(
    () => (teamId ? apiService.roles.getRoles(teamId) : Promise.resolve([])),
    [teamId],
    [],
    "Failed to fetch roles",
  )
}

export function usePermissions(teamId: string | null) {
  return useFetch(
    () => (teamId ? apiService.permissions.getPermissions(teamId) : Promise.resolve([])),
    [teamId],
    [],
    "Failed to fetch permissions",
  )
}

export function useActivity(teamId: string | null, filters?: any) {
  return useFetch(
    () => (teamId ? apiService.activity.getActivity(teamId, filters) : Promise.resolve([])),
    [teamId, JSON.stringify(filters)],
    [],
    "Failed to fetch activity logs",
  )
}

export function useAnalytics(teamId: string | null, appId?: string | null, period?: string) {
  return useFetch(
    () => (teamId ? apiService.analytics.getStats(teamId, appId || undefined, period) : Promise.resolve({})),
    [teamId, appId, period],
    {},
    "Failed to fetch analytics data",
  )
}

export function useSettings(teamId: string | null) {
  return useFetch(
    () => (teamId ? apiService.settings.getSettings(teamId) : Promise.resolve({})),
    [teamId],
    {},
    "Failed to fetch settings",
  )
}

export function useTenants(teamId: string | null) {
  return useFetch(
    () => (teamId ? apiService.tenants.getTenants(teamId) : Promise.resolve([])),
    [teamId],
    [],
    "Failed to fetch tenants",
  )
}

export function useFiles(teamId: string | null, appId: string | null) {
  return useFetch(
    () => (teamId && appId ? apiService.files.getFiles(teamId, appId) : Promise.resolve([])),
    [teamId, appId],
    [],
    "Failed to fetch files",
  )
}

export function useCurrentUser() {
  return useFetch(() => apiService.auth.getCurrentUser(), [], null, "Failed to fetch user profile")
}
