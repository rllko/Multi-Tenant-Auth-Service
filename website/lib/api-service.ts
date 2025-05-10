// Define the base API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Import the timeout utilities
import { withTimeout, handleApiError, DEFAULT_TIMEOUT } from "./api-timeout"

// Update the getAuthHeader function to be more robust
const getAuthHeader = () => {
  if (typeof window !== "undefined") {
    // Try both possible token keys to ensure we find the token
    const token = localStorage.getItem("token") || localStorage.getItem("authToken")

    if (token) {
      // Log that we found a token (without revealing the actual token)
      console.log("Auth token found in localStorage")
      return { Authorization: `Bearer ${token}` }
    } else {
      // Log that no token was found
      console.log("No auth token found in localStorage")
      return {}
    }
  }
  return {}
}

// Add a function to check if the token exists and is valid
export const isAuthenticated = () => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (!token) return false

    // Optional: Add JWT token validation logic here
    // For example, check if the token is expired by decoding it
    // This is a simple check - you might want to add more validation

    return true
  }
  return false
}

// Add a function to handle token refresh if needed
export const refreshToken = async () => {
  try {
    // Call your refresh token endpoint
    const response = await fetch(`${API_URL}/auth/tenant/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
    })

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }

    const data = await response.json()

    // Save the new token
    if (data.token && typeof window !== "undefined") {
      localStorage.setItem("token", data.token)
      return true
    }

    return false
  } catch (error) {
    console.error("Token refresh failed:", error)
    return false
  }
}

// Update the handleResponse function to handle 401 errors and attempt token refresh
const handleResponse = async (response: Response) => {
  if (response.status === 401) {
    // Try to refresh the token
    const refreshed = await refreshToken()

    if (!refreshed && typeof window !== "undefined") {
      // If refresh failed, redirect to login
      localStorage.removeItem("token")
      window.location.href = "/login"
      throw new Error("Authentication failed. Please log in again.")
    }

    // If token was refreshed successfully, the next request should work
    // The caller will need to retry the request
    throw new Error("Token refreshed. Please retry your request.")
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `API Error: ${response.status}`)
  }

  return response.json()
}

// Update the fetchApi function to ensure auth headers are always included for team endpoints
export async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = DEFAULT_TIMEOUT,
): Promise<T> {
  try {
    // Replace any template literals that weren't properly interpolated
    // This is a safeguard against ${teamId} showing up in the URL
    if (endpoint.includes("${")) {
      console.error("Template literal not properly interpolated in endpoint:", endpoint)
      // Try to extract the variable name for better error messages
      const match = endpoint.match(/\${([^}]+)}/)
      const variableName = match ? match[1] : "unknown"
      throw new Error(`API endpoint contains uninterpolated template: ${variableName} is undefined`)
    }

    const url = `${API_URL}${endpoint}`

    // Create a new headers object
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    // ALWAYS include auth headers for team-related endpoints
    if (
        endpoint.includes("/teams") ||
        endpoint.includes("/auth/tenant/me") ||
        endpoint.startsWith("/apps") ||
        endpoint.includes("/settings")
    ) {
      const authHeaders = getAuthHeader()
      // Ensure we're adding the Authorization header if a token exists
      if (authHeaders.Authorization) {
        headers.Authorization = authHeaders.Authorization
      }
    }

    // Log the request for debugging
    console.log(`API Request: ${endpoint}`, {
      headers: { ...headers, Authorization: headers.Authorization ? "Bearer [REDACTED]" : "None" },
    })

    const fetchPromise = fetch(url, {
      ...options,
      headers,
    }).then(handleResponse)

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
    return fetchApi("/auth/tenant/", {
      method: "DELETE",
    })
  },
  getCurrentUser: async () => {
    return fetchApi("/auth/tenant/me", {
      method: "GET",
    })
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
  updateTeamMember: async (teamId: string, userId: string, roleId: string) => {
    return fetchApi(`/teams/${teamId}/members/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ roleId }),
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
    if (!teamId) {
      console.error("getRoles called with undefined teamId")
      throw new Error("Team ID is required to fetch roles")
    }
    console.log(`Fetching roles for team ID: ${teamId}`)
    return fetchApi(`/teams/${teamId}/roles`)
  },
  getRole: async (teamId: string, roleId: string) => {
    if (!teamId) {
      console.error("getRole called with undefined teamId")
      throw new Error("Team ID is required to fetch role details")
    }
    return fetchApi(`/teams/${teamId}/roles/${roleId}`)
  },
  createRole: async (teamId: string, data: { name: string; description?: string; scopes?: string[] }) => {
    if (!teamId) {
      console.error("createRole called with undefined teamId")
      throw new Error("Team ID is required to create a role")
    }
    return fetchApi(`/teams/${teamId}/roles`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  updateRole: async (teamId: string, roleId: string, data: any) => {
    if (!teamId) {
      console.error("updateRole called with undefined teamId")
      throw new Error("Team ID is required to update a role")
    }
    return fetchApi(`/teams/${teamId}/roles/${roleId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },
  deleteRole: async (teamId: string, roleId: string) => {
    if (!teamId) {
      console.error("deleteRole called with undefined teamId")
      throw new Error("Team ID is required to delete a role")
    }
    return fetchApi(`/teams/${teamId}/roles/${roleId}`, { method: "DELETE" })
  },
}

// Permissions API
export const permissionsApi = {
  getPermissions: async (teamId: string) => {
    if (!teamId) {
      console.error("getPermissions called with undefined teamId")
      throw new Error("Team ID is required to fetch permissions")
    }
    console.log(`Fetching permissions for team ID: ${teamId}`)
    return fetchApi(`/teams/${teamId}/permissions`)
  },
  createPermission: async (
      teamId: string,
      data: {
        id: string
        name: string
        description?: string
        resource: string
        action: string
        impact?: string
      },
  ) => {
    if (!teamId) {
      console.error("createPermission called with undefined teamId")
      throw new Error("Team ID is required to create a permission")
    }
    return fetchApi(`/teams/${teamId}/permissions`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  assignPermission: async (teamId: string, roleId: string, permissionId: string) => {
    if (!teamId) {
      console.error("assignPermission called with undefined teamId")
      throw new Error("Team ID is required to assign a permission")
    }
    return fetchApi(`/teams/${teamId}/roles/${roleId}/permissions`, {
      method: "POST",
      body: JSON.stringify({ permissionId }),
    })
  },
  removePermission: async (teamId: string, roleId: string, permissionId: string) => {
    if (!teamId) {
      console.error("removePermission called with undefined teamId")
      throw new Error("Team ID is required to remove a permission")
    }
    return fetchApi(`/teams/${teamId}/roles/${roleId}/permissions/${permissionId}`, { method: "DELETE" })
  },
}

// Activity API
export const activityApi = {
  getActivity: async (teamId: string, filters?: any) => {
    if (!teamId) {
      console.error("getActivity called with undefined teamId")
      throw new Error("Team ID is required to fetch activity logs")
    }
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
    return fetchApi(`/teams/${teamId}/activity${queryParams}`)
  },
}

// Analytics API
export const analyticsApi = {
  getStats: async (teamId: string, appId?: string, period?: string) => {
    if (!teamId) {
      console.error("getStats called with undefined teamId")
      throw new Error("Team ID is required to fetch analytics data")
    }
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
    if (!teamId) {
      console.error("getSettings called with undefined teamId")
      throw new Error("Team ID is required to fetch settings")
    }
    return fetchApi(`/teams/${teamId}/settings`)
  },
  updateSettings: async (teamId: string, data: any) => {
    if (!teamId) {
      console.error("updateSettings called with undefined teamId")
      throw new Error("Team ID is required to update settings")
    }
    return fetchApi(`/teams/${teamId}/settings`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
}

// Tenants API
export const tenantsApi = {
  getTenants: async (teamId: string) => {
    if (!teamId) {
      console.error("getTenants called with undefined teamId")
      throw new Error("Team ID is required to fetch tenants")
    }
    return fetchApi(`/teams/${teamId}/tenants`)
  },
  createTenant: async (teamId: string, data: any) => {
    if (!teamId) {
      console.error("createTenant called with undefined teamId")
      throw new Error("Team ID is required to create a tenant")
    }
    return fetchApi(`/teams/${teamId}/tenants`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  },
  updateTenant: async (teamId: string, tenantId: string, data: any) => {
    if (!teamId) {
      console.error("updateTenant called with undefined teamId")
      throw new Error("Team ID is required to update a tenant")
    }
    return fetchApi(`/teams/${teamId}/tenants/${tenantId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },
  deleteTenant: async (teamId: string, tenantId: string) => {
    if (!teamId) {
      console.error("deleteTenant called with undefined teamId")
      throw new Error("Team ID is required to delete a tenant")
    }
    return fetchApi(`/teams/${teamId}/tenants/${tenantId}`, { method: "DELETE" })
  },
}

// Files API
export const filesApi = {
  getFiles: async (teamId: string, appId: string) => {
    if (!teamId || !appId) {
      console.error("getFiles called with undefined teamId or appId")
      throw new Error("Team ID and App ID are required to fetch files")
    }
    return fetchApi(`/teams/${teamId}/apps/${appId}/files`)
  },
  // Update the file upload function to include auth headers
  uploadFile: async (teamId: string, appId: string, formData: FormData) => {
    if (!teamId || !appId) {
      console.error("uploadFile called with undefined teamId or appId")
      throw new Error("Team ID and App ID are required to upload a file")
    }

    // Special case for file uploads - we need to handle multipart/form-data differently
    return fetch(`${API_URL}/teams/${teamId}/apps/${appId}/files`, {
      method: "POST",
      body: formData,
      headers: {
        ...getAuthHeader(),
        // Don't set Content-Type here, let the browser set it with the boundary
      },
    }).then(handleResponse)
  },
  deleteFile: async (teamId: string, appId: string, fileId: string) => {
    if (!teamId || !appId || !fileId) {
      console.error("deleteFile called with undefined parameters")
      throw new Error("Team ID, App ID, and File ID are required to delete a file")
    }
    return fetchApi(`/teams/${teamId}/apps/${appId}/files/${fileId}`, { method: "DELETE" })
  },
}

// Export all APIs as a single service object
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
