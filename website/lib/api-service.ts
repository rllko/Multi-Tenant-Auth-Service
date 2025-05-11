import {CONSTANTS} from '@/app/const'

import {DEFAULT_TIMEOUT, handleApiError, withTimeout} from "./api-timeout"
import {Team} from "@/lib/schemas";
import {Tenant} from "@/models/tenant";
import {Role} from "@/models/role";
import {Application, UpdateApplicationDto} from "@/models/application";


const API_URL = process.env.NEXT_PUBLIC_API_URL

const getAuthHeader = () => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem(CONSTANTS.TOKEN_NAME)
        if (token) {
            return {Authorization: `Bearer ${token}`}
        }
        throw new Error("No token provided")
    }
    return {}
}

export const isAuthenticated = () => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem(CONSTANTS.TOKEN_NAME)
        if (!token) return false
        return true
    }
    return false
}

export const refreshToken = async () => {
    type refresh = {
        token: string
    }

    try {
        const data: refresh = await fetchApi(`${API_URL}/auth/tenant/refresh`, {
            method: "POST"
        })

        if (data.token && typeof window !== "undefined") {
            localStorage.setItem(CONSTANTS.TOKEN_NAME, data.token)
            return true
        }

        return false
    } catch {
        return false
    }
}

const handleResponse = async (response: Response) => {
    if (response.status === 401) {
        const refreshed = await refreshToken()

        if (!refreshed && typeof window !== "undefined") {
            localStorage.removeItem(CONSTANTS.TOKEN_NAME)
            window.location.href = "/login"
            throw new Error("Authentication failed. Please log in again.")
        }

        throw new Error("Token refreshed. Please retry your request.")
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API Error: ${response.status}`)
    }

    return response.json()
}

export async function fetchApi<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = DEFAULT_TIMEOUT,
): Promise<T> {
    try {
        const templateMatch = endpoint.match(/\${([^}]+)}/)
        if (templateMatch) {
            const variableName = templateMatch[1]
            throw new Error(`API endpoint contains uninterpolated template: ${variableName} is undefined`)
        }

        const url = `${API_URL}${endpoint}`

        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        } as { [key: string]: string }

        const needsAuth = [
            "/teams",
            "/auth/tenant/me",
            "/apps",
            "/settings",
        ].some(path => endpoint.startsWith(path) || endpoint.includes(path))

        if (needsAuth) {
            const authHeaders = getAuthHeader()

            if (authHeaders?.Authorization) {
                headers["Authorization"] = authHeaders.Authorization
            }
        }

        const fetchPromise = fetch(url, {
            ...options,
            headers,
        }).then(handleResponse)

        return await withTimeout(fetchPromise, timeout)
    } catch (error) {
        const apiError = handleApiError(error)
        if (apiError.isTimeout) {
            throw new Error("Request timed out. Please check your connection and try again.")
        }
        throw apiError
    }
}

// Auth API
export const authApi = {
    login: async (email: string, password: string) => {
        return fetchApi("/auth/tenant/login", {
            method: "POST",
            body: JSON.stringify({email, password}),
        })
    },
    register: async (email: string, password: string, name: string) => {
        return fetchApi("/auth/tenant/register", {
            method: "POST",
            body: JSON.stringify({email, password, name}),
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
    getTeams: async (): Promise<Team[]> => {
        return fetchApi("/teams")
    },
    getTeam: async (teamId: string): Promise<Team> => {
        return fetchApi(`/teams/${teamId}`)
    },
    createTeam: async (name: string): Promise<Team> => {
        return fetchApi("/teams", {
            method: "POST",
            body: JSON.stringify({name}),
        })
    },
    updateTeam: async (teamId: string, data: object): Promise<void> => {
        return fetchApi(`/teams/${teamId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },
    deleteTeam: async (teamId: string) => {
        return fetchApi(`/teams/${teamId}`, {method: "DELETE"})
    },
    getTeamMembers: async (teamId: string) => {
        return fetchApi(`/teams/${teamId}/members`)
    },
    getTeamMember: async (teamId: string, tenantId: string) => {
        return fetchApi(`/teams/${teamId}/members/${tenantId}`)
    },
    inviteTeamMember: async (teamId: string, email: string, role: string) => {
        return fetchApi(`/teams/${teamId}/members`, {
            method: "POST",
            body: JSON.stringify({email, role}),
        })
    },
    removeTeamMember: async (teamId: string, userId: string) => {
        return fetchApi(`/teams/${teamId}/members/${userId}`, {method: "DELETE"})
    },
    updateTeamMember: async (teamId: string, userId: string, roleId: string) => {
        return fetchApi(`/teams/${teamId}/members/${userId}`, {
            method: "PATCH",
            body: JSON.stringify({roleId}),
        })
    },
}

// Applications API
export const appsApi = {
    getApps: async (teamId: string): Promise<Application[]> => {
        return fetchApi(`/teams/${teamId}/apps`)
    },
    getApp: async (teamId: string, appId: string): Promise<Application> => {
        return fetchApi(`/teams/${teamId}/apps/${appId}`)
    },
    createApp: async (teamId: string, data: object): Promise<Application> => {
        return fetchApi(`/teams/${teamId}/apps`, {
            method: "POST",
            body: JSON.stringify(data),
        })
    },
    updateApp: async (teamId: string, appId: string, data: UpdateApplicationDto): Promise<void> => {
        return fetchApi(`/teams/${teamId}/apps/${appId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },
    deleteApp: async (teamId: string, appId: string) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}`, {method: "DELETE"})
    },
}

// Licenses API
export const licensesApi = {
    getLicenses: async (teamId: string, appId: string) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}/licenses`)
    },
    createLicense: async (teamId: string, appId: string, data: object) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}/licenses`, {
            method: "POST",
            body: JSON.stringify(data),
        })
    },
    updateLicense: async (teamId: string, appId: string, licenseId: string, data: object) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}/licenses/${licenseId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },
    deleteLicense: async (teamId: string, appId: string, licenseId: string) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}/licenses/${licenseId}`, {method: "DELETE"})
    },
}

// Sessions API
export const sessionsApi = {
    getSessions: async (teamId: string, appId: string) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}/sessions`)
    },
    terminateSession: async (teamId: string, appId: string, sessionId: string) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}/sessions/${sessionId}`, {method: "DELETE"})
    },
}

// OAuth Clients API
export const oauthApi = {
    getClients: async (teamId: string, appId: string) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}/oauth/clients`)
    },
    createClient: async (teamId: string, appId: string, data: object) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}/oauth/clients`, {
            method: "POST",
            body: JSON.stringify(data),
        })
    },
    updateClient: async (teamId: string, appId: string, clientId: string, data: object) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}/oauth/clients/${clientId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },
    deleteClient: async (teamId: string, appId: string, clientId: string) => {
        return fetchApi(`/teams/${teamId}/apps/${appId}/oauth/clients/${clientId}`, {method: "DELETE"})
    },
}

// Roles API
export const rolesApi = {
    getRoles: async (teamId: string) => {
        if (!teamId) {
            throw new Error("Team ID is required to fetch roles")
        }
        return fetchApi(`/teams/${teamId}/roles`)
    },
    getRole: async (teamId: string, roleId: string) => {
        if (!teamId) {
            throw new Error("Team ID is required to fetch role details")
        }
        return fetchApi(`/teams/${teamId}/roles/${roleId}`)
    },
    createRole: async (teamId: string, data: Role) => {
        if (!teamId) {
            throw new Error("Team ID is required to create a role")
        }
        return fetchApi(`/teams/${teamId}/roles`, {
            method: "POST",
            body: JSON.stringify(data),
        })
    },
    updateRole: async (teamId: string, roleId: string, data: object) => {
        if (!teamId) {
            throw new Error("Team ID is required to update a role")
        }
        return fetchApi(`/teams/${teamId}/roles/${roleId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        })
    },
    deleteRole: async (teamId: string, roleId: string) => {
        if (!teamId) {
            throw new Error("Team ID is required to delete a role")
        }
        return fetchApi(`/teams/${teamId}/roles/${roleId}`, {method: "DELETE"})
    },
}

// Permissions API
export const permissionsApi = {
    getPermission: async (teamId: string, permissionID: string) => {
        if (!teamId) {
            throw new Error("Team ID is required to fetch permissions")
        }
        return fetchApi(`/teams/${teamId}/permissions/${permissionID}`)
    },
    getPermissions: async (teamId: string) => {
        if (!teamId) {
            throw new Error("Team ID is required to fetch permissions")
        }
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
            throw new Error("Team ID is required to create a permission")
        }
        return fetchApi(`/teams/${teamId}/permissions`, {
            method: "POST",
            body: JSON.stringify(data),
        })
    },
    assignPermission: async (teamId: string, roleId: string, permissionId: string) => {
        if (!teamId) {
            throw new Error("Team ID is required to assign a permission")
        }
        return fetchApi(`/teams/${teamId}/roles/${roleId}/permissions`, {
            method: "POST",
            body: JSON.stringify({permissionId}),
        })
    },
    removePermission: async (teamId: string, roleId: string, permissionId: string) => {
        if (!teamId) {
            throw new Error("Team ID is required to remove a permission")
        }
        return fetchApi(`/teams/${teamId}/roles/${roleId}/permissions/${permissionId}`, {method: "DELETE"})
    },
}

// Activity API
export const activityApi = {
    getActivity: async (teamId: string, filters?: Record<string, string>) => {
        if (!teamId) {
            throw new Error("Team ID is required to fetch activity logs")
        }
        const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : ""
        return fetchApi(`/teams/${teamId}/activity${queryParams}`)
    },
}

export const dashboardApi = {
    getDashboard: async (teamId: string) => {
        if (!teamId) {
            throw new Error("Team ID is required to fetch activity logs")
        }
        return fetchApi(`/teams/${teamId}/dashboard`)
    },
}

// Analytics API
export const analyticsApi = {
    getStats: async (teamId: string, appId?: string, period?: string) => {
        if (!teamId) {
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
            throw new Error("Team ID is required to fetch settings")
        }
        return fetchApi(`/teams/${teamId}/settings`)
    },
    updateSettings: async (teamId: string, data: object) => {
        if (!teamId) {
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
    getTenants: async (teamId: string): Promise<Tenant[]> => {
        if (!teamId) {
            throw new Error("Team ID is required to fetch tenants")
        }
        return fetchApi(`/teams/${teamId}/tenants`)
    },
    createTenant: async (teamId: string, data: object): Promise<Tenant> => {
        if (!teamId) {
            throw new Error("Team ID is required to create a tenant")
        }
        return fetchApi(`/teams/${teamId}/tenants`, {
            method: "POST",
            body: JSON.stringify(data),
        })
    },
    updateTenant: async (teamId: string, tenantId: string, data: object): Promise<Tenant> => {
        if (!teamId) {
            throw new Error("Team ID is required to update a tenant")
        }
        return fetchApi(`/teams/${teamId}/tenants/${tenantId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },
    deleteTenant: async (teamId: string, tenantId: string): Promise<void> => {
        if (!teamId) {
            throw new Error("Team ID is required to delete a tenant")
        }
        return fetchApi(`/teams/${teamId}/tenants/${tenantId}`, {method: "DELETE"})
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
}

export default apiService
