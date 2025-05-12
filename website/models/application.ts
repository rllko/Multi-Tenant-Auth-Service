import {z} from "zod";


export const ApplicationSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string()
})

export type Application = z.infer<typeof ApplicationSchema>;

export type CreateApplicationDto = {
    name: string;
    description?: string;
    default_key_schema?: string;
};

export const CreateApplicationDto = z.object({
    name: z.string(),
    description: z.string().nullable(),
    default_key_schema: z.custom()
})

export type UpdateApplicationDto = {
    name?: string;
    description?: string;
    scopes: string[];
    default_key_schema?: string;
};