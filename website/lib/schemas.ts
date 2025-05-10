import { z } from "zod"

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  logo: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Team = z.infer<typeof TeamSchema>

export const TeamMemberSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  userId: z.string(),
  user: UserSchema,
  role: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type TeamMember = z.infer<typeof TeamMemberSchema>

export const ApplicationSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Application = z.infer<typeof ApplicationSchema>

export const LicenseSchema = z.object({
  id: z.string(),
  appId: z.string(),
  key: z.string(),
  name: z.string().optional(),
  status: z.enum(["active", "expired", "revoked"]),
  expiresAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type License = z.infer<typeof LicenseSchema>

export const SessionSchema = z.object({
  id: z.string(),
  appId: z.string(),
  userId: z.string().optional(),
  deviceInfo: z.string().optional(),
  ipAddress: z.string().optional(),
  lastActive: z.string().datetime(),
  createdAt: z.string().datetime(),
})

export type Session = z.infer<typeof SessionSchema>

export const OAuthClientSchema = z.object({
  id: z.string(),
  appId: z.string(),
  name: z.string(),
  clientId: z.string(),
  clientSecret: z.string(),
  redirectUris: z.array(z.string().url()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type OAuthClient = z.infer<typeof OAuthClientSchema>

export const RoleSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Role = z.infer<typeof RoleSchema>

export const PermissionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  resource: z.string(),
  action: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Permission = z.infer<typeof PermissionSchema>

export const ActivityLogSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  userId: z.string().optional(),
  user: UserSchema.optional(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
})

export type ActivityLog = z.infer<typeof ActivityLogSchema>

export const AnalyticsSchema = z.object({
  totalUsers: z.number(),
  activeUsers: z.number(),
  totalSessions: z.number(),
  activeSessions: z.number(),
  newUsers: z.number(),
  totalLicenses: z.number(),
  activeLicenses: z.number(),
  dailyStats: z.array(
    z.object({
      date: z.string(),
      users: z.number(),
      sessions: z.number(),
    }),
  ),
})

export type Analytics = z.infer<typeof AnalyticsSchema>

export const SettingsSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  theme: z.enum(["light", "dark", "system"]).optional(),
  notifications: z.record(z.boolean()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Settings = z.infer<typeof SettingsSchema>

export const TenantSchema = z.object({
  id: z.string(),
  teamId: z.string(),
  name: z.string(),
  domain: z.string().optional(),
  logo: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Tenant = z.infer<typeof TenantSchema>

export const FileSchema = z.object({
  id: z.string(),
  appId: z.string(),
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string().url(),
  createdAt: z.string().datetime(),
})

export type File = z.infer<typeof FileSchema>

export const RegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export const CreateTeamSchema = z.object({
  name: z.string().min(2, { message: "Team name must be at least 2 characters" }),
})

export const CreateApplicationSchema = z.object({
  name: z.string().min(2, { message: "Application name must be at least 2 characters" }),
  description: z.string().optional(),
})

export const CreateLicenseSchema = z.object({
  name: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
})

export const CreateOAuthClientSchema = z.object({
  name: z.string().min(2, { message: "Client name must be at least 2 characters" }),
  redirectUris: z.array(z.string().url({ message: "Please enter valid URLs" })),
})

export const CreateRoleSchema = z.object({
  name: z.string().min(2, { message: "Role name must be at least 2 characters" }),
  description: z.string().optional(),
})

export const CreateTenantSchema = z.object({
  name: z.string().min(2, { message: "Tenant name must be at least 2 characters" }),
  domain: z.string().optional(),
})
