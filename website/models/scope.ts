import {z} from "zod";

export const ScopeSchema = z.object({
    scope_id: z.number(),
    scope_name: z.string(),
    scope_type: z.number(),
    slug: z.string(),
    created_by: z.string().uuid().optional(),
    impact_level_id: z.number().optional(),
    category_id: z.number().optional(),
});

export type Scope = z.infer<typeof ScopeSchema>;