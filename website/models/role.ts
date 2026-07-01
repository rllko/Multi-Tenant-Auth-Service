import {z} from "zod";

// Matches the backend RoleDto (Server/Models/Entities/Role.cs)
export const RoleSchema = z.object({
    roleId: z.number(),
    roleName: z.string(),
    description: z.string(),
    createdBy: z.string().uuid().nullable().optional(),
    scopes: z.array(z.number()).optional(),
});

export type Role = z.infer<typeof RoleSchema>;

// Matches the backend CreateRoleDto — roleType and slug are derived server-side
export const CreateRoleSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    slug: z.string().optional(),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;

export const UpdateRoleSchema = z.object({
    roleName: z.string(),
    slug: z.string(),
    description: z.string(),
    roleType: z.number(),
});

export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;

// Matches UpdateRoleScopesDto — PATCH /teams/{teamId}/roles/{roleId}/permissions
export type UpdateRoleScopesDto = {
    scopes: number[];
};
