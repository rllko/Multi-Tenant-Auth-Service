import {z} from "zod";

export const RoleSchema = z.object({
    roleId: z.number(),
    teamId: z.string(),
    roleName: z.string(),
    description: z.string(),
    slug: z.string(),
    roleType: z.string(),
});

export type Role = z.infer<typeof RoleSchema>;

export const UpdateRoleSchema = z.object({
    roleName: z.string(),
    slug: z.string(),
    description: z.string(),
    roleType: z.number(),
    createdByTeam: z.string().uuid(),
});

export type UpdateRoleDto = z.infer<typeof UpdateRoleSchema>;