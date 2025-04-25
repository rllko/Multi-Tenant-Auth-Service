// API Service functions for the KeyAuth dashboard
import type { z } from "zod"
import {
  AppSchema,
  TeamMemberSchema,
  ActivityLogSchema,
  DashboardStatsSchema,
  ApiModelSchema,
  OAuthClientSchema,
  LicenseKeySchema,
  SessionSchema,
  RoleSchema,
  PermissionSchema,
  TenantSchema,
} from "./schemas"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.keyauth.io/v1"

// Error handling helper\
const handleApiResponse = async <T>(response: Response)
: Promise<T> =>
{
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API error: ${response.status}`)
  }
  return response.json()
}

// Authentication header helper
const getAuthHeaders = () => {
  // In a real app, you would get this from your auth context/store
  const token = typeof window !== "undefined" ? localStorage.getItem("keyauth_token") : null
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  }
}

// Generic API request function
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}, 
  schema?: z.ZodType<T>
)
: Promise<T> =>
{
  try {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await handleApiResponse<T>(response)

    // Validate response with schema if provided
    if (schema) {
      return schema.parse(data)
    }

    return data
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error)
    throw error
  }
}

// Pagination parameters interface
interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  order?: "asc" | "desc"
}

// Filter parameters interface
interface FilterParams {
  [key: string]: string | number | boolean | undefined
}

// Build query string from parameters
const buildQueryString = (pagination?: PaginationParams, filters?: FilterParams): string => {
  const params = new URLSearchParams()

  if (pagination) {
    if (pagination.page) params.append("page", pagination.page.toString())
    if (pagination.limit) params.append("limit", pagination.limit.toString())
    if (pagination.sort) params.append("sort", pagination.sort)
    if (pagination.order) params.append("order", pagination.order)
  }

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString())
      }
    })
  }

  const queryString = params.toString()
  return queryString ? `?${queryString}` : ""
}

// Apps API
export const fetchApps = async (
  pagination?: PaginationParams,
  filters?: FilterParams,
): Promise<z.infer<typeof AppSchema>[]> => {
  const queryString = buildQueryString(pagination, filters)
  return apiRequest<z.infer<typeof AppSchema>[]>(`/apps${queryString}`, {}, AppSchema.array())
}

export const fetchAppById = async (appId: string): Promise<z.infer<typeof AppSchema>> => {
  return apiRequest<z.infer<typeof AppSchema>>(`/apps/${appId}`, {}, AppSchema)
}

export const createApp = async (appData: Omit<z.infer<typeof AppSchema>, "id">): Promise<z.infer<typeof AppSchema>> => {
  return apiRequest<z.infer<typeof AppSchema>>(
    "/apps",
    {
      method: "POST",
      body: JSON.stringify(appData),
    },
    AppSchema,
  )
}

export const updateApp = async (
  appId: string,
  appData: Partial<z.infer<typeof AppSchema>>,
): Promise<z.infer<typeof AppSchema>> => {
  return apiRequest<z.infer<typeof AppSchema>>(
    `/apps/${appId}`,
    {
      method: "PUT",
      body: JSON.stringify(appData),
    },
    AppSchema,
  )
}

export const deleteApp = async (appId: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/apps/${appId}`, {
    method: "DELETE",
  })
}

// Team Members API
export const fetchTeamMembers = async (
  pagination?: PaginationParams,
  filters?: FilterParams,
): Promise<z.infer<typeof TeamMemberSchema>[]> => {
  const queryString = buildQueryString(pagination, filters)
  return apiRequest<z.infer<typeof TeamMemberSchema>[]>(`/team/members${queryString}`, {}, TeamMemberSchema.array())
}

export const fetchTeamMemberById = async (memberId: string): Promise<z.infer<typeof TeamMemberSchema>> => {
  return apiRequest<z.infer<typeof TeamMemberSchema>>(`/team/members/${memberId}`, {}, TeamMemberSchema)
}

export const inviteTeamMember = async (memberData: { email: string; role: string; message?: string }): Promise<{
  success: boolean
  inviteId: string
}> => {
  return apiRequest<{ success: boolean; inviteId: string }>("/team/invites", {
    method: "POST",
    body: JSON.stringify(memberData),
  })
}

export const updateTeamMember = async (
  memberId: string,
  memberData: Partial<z.infer<typeof TeamMemberSchema>>,
): Promise<z.infer<typeof TeamMemberSchema>> => {
  return apiRequest<z.infer<typeof TeamMemberSchema>>(
    `/team/members/${memberId}`,
    {
      method: "PUT",
      body: JSON.stringify(memberData),
    },
    TeamMemberSchema,
  )
}

export const removeTeamMember = async (memberId: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/team/members/${memberId}`, {
    method: "DELETE",
  })
}

// Activity Logs API
export const fetchActivityLogs = async (
  pagination?: PaginationParams,
  filters?: FilterParams,
): Promise<z.infer<typeof ActivityLogSchema>[]> => {
  const queryString = buildQueryString(pagination, filters)
  return apiRequest<z.infer<typeof ActivityLogSchema>[]>(`/activity${queryString}`, {}, ActivityLogSchema.array())
}

export const fetchActivityLogById = async (logId: string): Promise<z.infer<typeof ActivityLogSchema>> => {
  return apiRequest<z.infer<typeof ActivityLogSchema>>(`/activity/${logId}`, {}, ActivityLogSchema)
}

export const exportActivityLogs = async (format: "csv" | "json" = "csv", filters?: FilterParams): Promise<Blob> => {
  const queryString = buildQueryString(undefined, { ...filters, format })
  const response = await fetch(`${API_BASE_URL}/activity/export${queryString}`, {
    headers: getAuthHeaders(),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API error: ${response.status}`)
  }

  return response.blob()
}

// Dashboard Stats API
export const fetchDashboardStats = async (): Promise<z.infer<typeof DashboardStatsSchema>> => {
  return apiRequest<z.infer<typeof DashboardStatsSchema>>("/dashboard/stats", {}, DashboardStatsSchema)
}

// API Models
export const fetchApiModels = async (): Promise<z.infer<typeof ApiModelSchema>[]> => {
  return apiRequest<z.infer<typeof ApiModelSchema>[]>("/api/models", {}, ApiModelSchema.array())
}

export const fetchApiModelByName = async (modelName: string): Promise<z.infer<typeof ApiModelSchema>> => {
  return apiRequest<z.infer<typeof ApiModelSchema>>(`/api/models/${modelName}`, {}, ApiModelSchema)
}

// OAuth Clients API
export const fetchOAuthClients = async (
  pagination?: PaginationParams,
  filters?: FilterParams,
): Promise<z.infer<typeof OAuthClientSchema>[]> => {
  const queryString = buildQueryString(pagination, filters)
  return apiRequest<z.infer<typeof OAuthClientSchema>[]>(`/oauth/clients${queryString}`, {}, OAuthClientSchema.array())
}

export const fetchOAuthClientById = async (clientId: string): Promise<z.infer<typeof OAuthClientSchema>> => {
  return apiRequest<z.infer<typeof OAuthClientSchema>>(`/oauth/clients/${clientId}`, {}, OAuthClientSchema)
}

export const createOAuthClient = async (
  clientData: Omit<z.infer<typeof OAuthClientSchema>, "id" | "clientId" | "clientSecret">,
): Promise<z.infer<typeof OAuthClientSchema>> => {
  return apiRequest<z.infer<typeof OAuthClientSchema>>(
    "/oauth/clients",
    {
      method: "POST",
      body: JSON.stringify(clientData),
    },
    OAuthClientSchema,
  )
}

export const updateOAuthClient = async (
  clientId: string,
  clientData: Partial<z.infer<typeof OAuthClientSchema>>,
): Promise<z.infer<typeof OAuthClientSchema>> => {
  return apiRequest<z.infer<typeof OAuthClientSchema>>(
    `/oauth/clients/${clientId}`,
    {
      method: "PUT",
      body: JSON.stringify(clientData),
    },
    OAuthClientSchema,
  )
}

export const deleteOAuthClient = async (clientId: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/oauth/clients/${clientId}`, {
    method: "DELETE",
  })
}

export const rotateOAuthClientSecret = async (clientId: string): Promise<{ clientSecret: string }> => {
  return apiRequest<{ clientSecret: string }>(`/oauth/clients/${clientId}/rotate-secret`, {
    method: "POST",
  })
}

// License Keys API
export const fetchLicenseKeys = async (
  pagination?: PaginationParams,
  filters?: FilterParams,
): Promise<z.infer<typeof LicenseKeySchema>[]> => {
  const queryString = buildQueryString(pagination, filters)
  return apiRequest<z.infer<typeof LicenseKeySchema>[]>(`/licenses${queryString}`, {}, LicenseKeySchema.array())
}

export const fetchLicenseKeyById = async (keyId: string): Promise<z.infer<typeof LicenseKeySchema>> => {
  return apiRequest<z.infer<typeof LicenseKeySchema>>(`/licenses/${keyId}`, {}, LicenseKeySchema)
}

export const createLicenseKey = async (
  keyData: Omit<z.infer<typeof LicenseKeySchema>, "id" | "key">,
): Promise<z.infer<typeof LicenseKeySchema>> => {
  return apiRequest<z.infer<typeof LicenseKeySchema>>(
    "/licenses",
    {
      method: "POST",
      body: JSON.stringify(keyData),
    },
    LicenseKeySchema,
  )
}

export const updateLicenseKey = async (
  keyId: string,
  keyData: Partial<z.infer<typeof LicenseKeySchema>>,
): Promise<z.infer<typeof LicenseKeySchema>> => {
  return apiRequest<z.infer<typeof LicenseKeySchema>>(
    `/licenses/${keyId}`,
    {
      method: "PUT",
      body: JSON.stringify(keyData),
    },
    LicenseKeySchema,
  )
}

export const revokeLicenseKey = async (keyId: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/licenses/${keyId}/revoke`, {
    method: "POST",
  })
}

export const deleteLicenseKey = async (keyId: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/licenses/${keyId}`, {
    method: "DELETE",
  })
}

// Sessions API
export const fetchSessions = async (
  pagination?: PaginationParams,
  filters?: FilterParams,
): Promise<z.infer<typeof SessionSchema>[]> => {
  const queryString = buildQueryString(pagination, filters)
  return apiRequest<z.infer<typeof SessionSchema>[]>(`/sessions${queryString}`, {}, SessionSchema.array())
}

export const fetchSessionById = async (sessionId: string): Promise<z.infer<typeof SessionSchema>> => {
  return apiRequest<z.infer<typeof SessionSchema>>(`/sessions/${sessionId}`, {}, SessionSchema)
}

export const revokeSession = async (sessionId: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/sessions/${sessionId}/revoke`, {
    method: "POST",
  })
}

export const revokeAllSessions = async (): Promise<{ success: boolean; count: number }> => {
  return apiRequest<{ success: boolean; count: number }>("/sessions/revoke-all", {
    method: "POST",
  })
}

// Roles API
export const fetchRoles = async (
  pagination?: PaginationParams,
  filters?: FilterParams,
): Promise<z.infer<typeof RoleSchema>[]> => {
  const queryString = buildQueryString(pagination, filters)
  return apiRequest<z.infer<typeof RoleSchema>[]>(`/roles${queryString}`, {}, RoleSchema.array())
}

export const fetchRoleById = async (roleId: string): Promise<z.infer<typeof RoleSchema>> => {
  return apiRequest<z.infer<typeof RoleSchema>>(`/roles/${roleId}`, {}, RoleSchema)
}

export const createRole = async (
  roleData: Omit<z.infer<typeof RoleSchema>, "id">,
): Promise<z.infer<typeof RoleSchema>> => {
  return apiRequest<z.infer<typeof RoleSchema>>(
    "/roles",
    {
      method: "POST",
      body: JSON.stringify(roleData),
    },
    RoleSchema,
  )
}

export const updateRole = async (
  roleId: string,
  roleData: Partial<z.infer<typeof RoleSchema>>,
): Promise<z.infer<typeof RoleSchema>> => {
  return apiRequest<z.infer<typeof RoleSchema>>(
    `/roles/${roleId}`,
    {
      method: "PUT",
      body: JSON.stringify(roleData),
    },
    RoleSchema,
  )
}

export const deleteRole = async (roleId: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/roles/${roleId}`, {
    method: "DELETE",
  })
}

// Permissions API
export const fetchPermissions = async (
  pagination?: PaginationParams,
  filters?: FilterParams,
): Promise<z.infer<typeof PermissionSchema>[]> => {
  const queryString = buildQueryString(pagination, filters)
  return apiRequest<z.infer<typeof PermissionSchema>[]>(`/permissions${queryString}`, {}, PermissionSchema.array())
}

export const fetchPermissionById = async (permissionId: string): Promise<z.infer<typeof PermissionSchema>> => {
  return apiRequest<z.infer<typeof PermissionSchema>>(`/permissions/${permissionId}`, {}, PermissionSchema)
}

// Tenants API
export const fetchTenants = async (
  pagination?: PaginationParams,
  filters?: FilterParams,
): Promise<z.infer<typeof TenantSchema>[]> => {
  const queryString = buildQueryString(pagination, filters)
  return apiRequest<z.infer<typeof TenantSchema>[]>(`/tenants${queryString}`, {}, TenantSchema.array())
}

export const fetchTenantById = async (tenantId: string): Promise<z.infer<typeof TenantSchema>> => {
  return apiRequest<z.infer<typeof TenantSchema>>(`/tenants/${tenantId}`, {}, TenantSchema)
}

export const createTenant = async (
  tenantData: Omit<z.infer<typeof TenantSchema>, "id">,
): Promise<z.infer<typeof TenantSchema>> => {
  return apiRequest<z.infer<typeof TenantSchema>>(
    "/tenants",
    {
      method: "POST",
      body: JSON.stringify(tenantData),
    },
    TenantSchema,
  )
}

export const updateTenant = async (
  tenantId: string,
  tenantData: Partial<z.infer<typeof TenantSchema>>,
): Promise<z.infer<typeof TenantSchema>> => {
  return apiRequest<z.infer<typeof TenantSchema>>(
    `/tenants/${tenantId}`,
    {
      method: "PUT",
      body: JSON.stringify(tenantData),
    },
    TenantSchema,
  )
}

export const deleteTenant = async (tenantId: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>(`/tenants/${tenantId}`, {
    method: "DELETE",
  })
}

// Authentication API
export const login = async (credentials: { email: string; password: string }): Promise<{
  token: string
  user: z.infer<typeof TeamMemberSchema>
}> => {
  return apiRequest<{ token: string; user: z.infer<typeof TeamMemberSchema> }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  })
}

export const logout = async (): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>("/auth/logout", {
    method: "POST",
  })
}

export const getCurrentUser = async (): Promise<z.infer<typeof TeamMemberSchema>> => {
  return apiRequest<z.infer<typeof TeamMemberSchema>>("/auth/me", {}, TeamMemberSchema)
}

export const resetPassword = async (email: string): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export const verifyResetToken = async (token: string): Promise<{ valid: boolean }> => {
  return apiRequest<{ valid: boolean }>("/auth/verify-reset-token", {
    method: "POST",
    body: JSON.stringify({ token }),
  })
}

export const setNewPassword = async (data: { token: string; password: string }): Promise<{ success: boolean }> => {
  return apiRequest<{ success: boolean }>("/auth/set-password", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// Health check API
export const checkApiHealth = async (): Promise<{ status: string; version: string }> => {
  return apiRequest<{ status: string; version: string }>("/health")
}
