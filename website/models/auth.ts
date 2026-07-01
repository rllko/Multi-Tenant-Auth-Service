import {z} from "zod";

export const LoginSchema = z.object({
    token: z.string(),
    expires_in: z.string(),
    token_type: z.string(),
});

export type LoginType = z.infer<typeof LoginSchema>;