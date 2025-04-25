import { z } from "zod"

// Base schemas
export const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.string(),
  status: z.enum(["active", "inactive", "pending"]),
  joinedAt: z.string().optional(),
  lastActive: z.string().optional(),
  avatar: z.string().url().optional(),
  tenants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().optional(),
      }),
    )
    .default([]),
  permissions: z.array(z.string()).optional(),
})

export const AppSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "development", "maintenance"]),
  type: z.enum(["web", "spa", "native", "service"]),
  icon: z.string().optional(),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUris: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  ownerId: z.string().optional(),
  teamId: z.string().optional(),
  logoUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  privacyPolicyUrl: z.string().url().optional(),
  termsOfServiceUrl: z.string().url().optional(),
  allowedOrigins: z.array(z.string()).optional(),
  sessionCount: z.number().optional(),
  userCount: z.number().optional(),
})

export const ActivityLogSchema = z.object({
  id: z.string(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  userId: z.string(),
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
  timestamp: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  details: z.record(z.any()).optional(),
  status: z.enum(["success", "error", "warning", "info"]).optional(),
})

export const DashboardStatsSchema = z.object({
  totalApps: z.number(),
  totalUsers: z.number(),
  totalSessions: z.number(),
  activeKeys: z.number(),
  apiRequests: z.object({
    today: z.number(),
    thisWeek: z.number(),
    thisMonth: z.number(),
  }),
  newUsers: z.object({
    today: z.number(),
    thisWeek: z.number(),
    thisMonth: z.number(),
  }),
  recentActivity: z.array(ActivityLogSchema).optional(),
})

export const ApiModelSchema = z.object({
  name: z.string(),
  description: z.string(),
  schema: z.record(z.any()),
  endpoints: z
    .array(
      z.object({
        path: z.string(),
        method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
        description: z.string(),
        parameters: z
          .array(
            z.object({
              name: z.string(),
              type: z.string(),
              required: z.boolean().optional(),
              description: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
  examples: z
    .array(
      z.object({
        title: z.string(),
        code: z.string(),
        language: z.string().optional(),
      }),
    )
    .optional(),
})

export const OAuthClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUris: z.array(z.string()),
  allowedScopes: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
  applicationType: z.enum(["web", "native", "spa", "service"]),
  tokenEndpointAuthMethod: z.enum(["client_secret_basic", "client_secret_post", "none"]).optional(),
  grantTypes: z.array(z.enum(["authorization_code", "client_credentials", "refresh_token", "implicit"])).optional(),
  responseTypes: z.array(z.enum(["code", "token", "id_token"])).optional(),
  lastUsed: z.string().optional(),
  lastIp: z.string().optional(),
})

export const LicenseKeySchema = z.object({
  id: z.string(),
  key: z.string(),
  status: z.enum(["active", "inactive", "revoked", "expired"]),
  plan: z.string(),
  createdAt: z.string(),
  expiresAt: z.string().optional(),
  revokedAt: z.string().optional(),
  createdBy: z.string().optional(),
  assignedTo: z.string().nullable().optional(),
  assignedToEmail: z.string().email().optional(),
  usageCount: z.number().optional(),
  maxUsages: z.number().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  applicationId: z.string(),
})

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
  clientId: z.string().optional(),
  clientName: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  device: z.string().optional(),
  location: z.string().optional(),
  createdAt: z.string(),
  expiresAt: z.string().optional(),
  lastActive: z.string().optional(),
  status: z.enum(["active", "expired", "revoked"]),
})

export const RoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  isDefault: z.boolean().optional(),
  isSystem: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  createdBy: z.string().optional(),
})

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  resource: z.string(),
  action: z.string(),
  isSystem: z.boolean().optional(),
})

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().optional(),
  domain: z.string().optional(),
  plan: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  ownerId: z.string().optional(),
  settings: z.record(z.any()).optional(),
  features: z.array(z.string()).optional(),
  userCount: z.number().optional(),
  appCount: z.number().optional(),
  logoUrl: z.string().url().optional(),
})

// Response schemas
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema),
    pagination: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      pages: z.number(),
    }),
  })

export const ApiResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: schema,
    meta: z.record(z.any()).optional(),
  })

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
})

// Export types
export type TeamMember = z.infer<typeof TeamMemberSchema>
export type App = z.infer<typeof AppSchema>
export type ActivityLog = z.infer<typeof ActivityLogSchema>
export type DashboardStats = z.infer<typeof DashboardStatsSchema>
export type ApiModel = z.infer<typeof ApiModelSchema>
export type OAuthClient = z.infer<typeof OAuthClientSchema>
export type LicenseKey = z.infer<typeof LicenseKeySchema>
export type Session = z.infer<typeof SessionSchema>
export type Role = z.infer<typeof RoleSchema>
export type Permission = z.infer<typeof PermissionSchema>
export type Tenant = z.infer<typeof TenantSchema>
