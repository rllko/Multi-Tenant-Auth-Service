// Define the base API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL
import { withTimeout, handleApiError } from "./api-timeout"

// Default timeout in milliseconds (10 seconds)
const DEFAULT_TIMEOUT = 10000

// Error handling utility
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API Error: ${response.status}`)
  }
  return response.json()
}

// Generic fetch function with error handling and timeout
async function fetchApi<T>(endpoint: string, options: RequestInit = {}, timeout: number = DEFAULT_TIMEOUT): Promise<T> {
  try {
    const url = `${API_URL}${endpoint}`
    const fetchPromise = fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API Error: ${response.status}`)
      }
      return response.json()
    })

    // Add timeout to the fetch promise
    return await withTimeout(fetchPromise, timeout)
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error)
    const apiError = handleApiError(error)

    // Rethrow with additional context
    if (apiError.isTimeout) {
      throw new Error("Request timed out. Please check your connection and try again.")
    }
    throw error
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return fetchApi("/auth/tenant/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },
  register: async (email: string, password: string, name: string) => {
    return fetchApi("/auth/tenant/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    })
  },
  logout: async () => {
    return fetchApi("/auth/tenant/logout", { method: "POST" })
  },
  getCurrentUser: async () => {
    return fetchApi("/auth/me")
  },
}

// Teams API
export const teamsApi = {
  getTeams: async () => {
    return fetchApi("/teams")
  },
  getTeam: async (teamId: string) => {
    return fetchApi(`/teams/${teamId}`)
  },
  createTeam: async (name: string) => {
    return fetchApi("/teams", {
      method: "POST",
      body: JSON.stringify({ name }),
    })
  },
  updateTeam: async (teamId: string, data: any) => {
    return fetchApi(`/teams/${teamId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  deleteTeam: async (teamId: string) => {
    return fetchApi(`/teams/${teamId}`, { method: "DELETE" })
  },
  getTeamMembers: async (teamId: string) => {
    return fetchApi(`/teams/${teamId}/members`)
  },
  inviteTeamMember: async (teamId: string, email: string, role: string) => {
    return fetchApi(`/teams/${teamId}/members`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    })
  },
  removeTeamMember: async (teamId: string, userId: string) => {
    return fetchApi(`/teams/${teamId}/members/${userId}`, { method: "DELETE" })
  },
  updateTeamMember: async (teamId: string, userId: string, role: string) => {
    return fetchApi(`/teams/${teamId}/members/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    })
  },
}

// Applications API
export const appsApi = {
  getApps: async (teamId: string) => {
    return fetchApi(`/teams/${teamId}/apps`)
  },
  getApp: async (teamId: string, appId: string) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}`)
  },
  createApp: async (teamId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/apps`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  updateApp: async (teamId: string, appId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  deleteApp: async (teamId: string, appId: string) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}`, { method: "DELETE" })
  },
}

// Licenses API
export const licensesApi = {
  getLicenses: async (teamId: string, appId: string) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/licenses`)
  },
  createLicense: async (teamId: string, appId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/licenses`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  updateLicense: async (teamId: string, appId: string, licenseId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/licenses/${licenseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  deleteLicense: async (teamId: string, appId: string, licenseId: string) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/licenses/${licenseId}`, { method: "DELETE" })
  },
}

// Sessions API
export const sessionsApi = {
  getSessions: async (teamId: string, appId: string) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/sessions`)
  },
  terminateSession: async (teamId: string, appId: string, sessionId: string) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/sessions/${sessionId}`, { method: "DELETE" })
  },
}

// OAuth Clients API
export const oauthApi = {
  getClients: async (teamId: string, appId: string) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/oauth/clients`)
  },
  createClient: async (teamId: string, appId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/oauth/clients`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  updateClient: async (teamId: string, appId: string, clientId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/oauth/clients/${clientId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  deleteClient: async (teamId: string, appId: string, clientId: string) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/oauth/clients/${clientId}`, { method: "DELETE" })
  },
}

// Roles API
export const rolesApi = {
  getRoles: async (teamId: string) => {
    return fetchApi(`/teams/${teamId}/roles`)
  },
  getRole: async (teamId: string, roleId: string) => {
    return fetchApi(`/teams/${teamId}/roles/${roleId}`)
  },
  createRole: async (teamId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/roles`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  updateRole: async (teamId: string, roleId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/roles/${roleId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  deleteRole: async (teamId: string, roleId: string) => {
    return fetchApi(`/teams/${teamId}/roles/${roleId}`, { method: "DELETE" })
  },
}

// Permissions API
export const permissionsApi = {
  getPermissions: async (teamId: string) => {
    return fetchApi(`/teams/${teamId}/permissions`)
  },
  assignPermission: async (teamId: string, roleId: string, permissionId: string) => {
    return fetchApi(`/teams/${teamId}/roles/${roleId}/permissions`, {
      method: "POST",
      body: JSON.stringify({ permissionId }),
    })
  },
  removePermission: async (teamId: string, roleId: string, permissionId: string) => {
    return fetchApi(`/teams/${teamId}/roles/${roleId}/permissions/${permissionId}`, { method: "DELETE" })
  },
}

// Activity API
export const activityApi = {
  getActivity: async (teamId: string, filters?: any) => {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
    return fetchApi(`/teams/${teamId}/activity${queryParams}`)
  },
}

// Analytics API
export const analyticsApi = {
  getStats: async (teamId: string, appId?: string, period?: string) => {
    let endpoint = `/teams/${teamId}/analytics`
    if (appId) {
      endpoint = `/teams/${teamId}/apps/${appId}/analytics`
    }
    if (period) {
      endpoint += `?period=${period}`
    }
    return fetchApi(endpoint)
  },
}

// Settings API
export const settingsApi = {
  getSettings: async (teamId: string) => {
    return fetchApi(`/teams/${teamId}/settings`)
  },
  updateSettings: async (teamId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/settings`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
}

// Tenants API
export const tenantsApi = {
  getTenants: async (teamId: string) => {
    return fetchApi(`/teams/${teamId}/tenants`)
  },
  createTenant: async (teamId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/tenants`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  updateTenant: async (teamId: string, tenantId: string, data: any) => {
    return fetchApi(`/teams/${teamId}/tenants/${tenantId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  deleteTenant: async (teamId: string, tenantId: string) => {
    return fetchApi(`/teams/${teamId}/tenants/${tenantId}`, { method: "DELETE" })
  },
}

// Files API
export const filesApi = {
  getFiles: async (teamId: string, appId: string) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/files`)
  },
  uploadFile: async (teamId: string, appId: string, formData: FormData) => {
    return fetch(`${API_URL}/teams/${teamId}/apps/${appId}/files`, {
      method: "POST",
      body: formData,
    }).then(handleResponse)
  },
  deleteFile: async (teamId: string, appId: string, fileId: string) => {
    return fetchApi(`/teams/${teamId}/apps/${appId}/files/${fileId}`, { method: "DELETE" })
  },
}

// Export all APIs
export const apiService = {
  auth: authApi,
  teams: teamsApi,
  apps: appsApi,
  licenses: licensesApi,
  sessions: sessionsApi,
  oauth: oauthApi,
  roles: rolesApi,
  permissions: permissionsApi,
  activity: activityApi,
  analytics: analyticsApi,
  settings: settingsApi,
  tenants: tenantsApi,
  files: filesApi,
}

export default apiService
