import {z} from "zod";

// Matches the backend ScopeDto (Server/Models/Entities/Scope.cs),
// returned by GET /teams/{teamId}/permissions and /apps/{appId}/permissions
export const PermissionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdBy: z.string().nullable().optional(),
    impact: z.string().optional(),
    resource: z.string().optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;
