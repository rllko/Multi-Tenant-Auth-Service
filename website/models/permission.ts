import {z} from "zod";

export const PermissionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.number(),
    created_by: z.string().uuid().optional(),
    impact: z.number().optional(),
    resource: z.number().optional(),
});

export type Permission = z.infer<typeof PermissionSchema>;