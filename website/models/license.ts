import {z} from "zod";

export type CreateLicenseDto = {
    username: string;
    application: string;
    email?: string;
    password?: string;
    max_sessions?: number;
};

export type UpdateLicenseDto = {
    username?: string;
    email?: string;
    password?: string;
    max_sessions?: number;
    activated?: boolean;
    paused?: boolean;
};

export const LicenseSchema = z.object({
    id: z.number().int(),
    value: z.string(),
    creationDate: z.number().int(),
    activated: z.boolean(),
    paused: z.boolean(),
    expirationDate: z.number().int(),
    email: z.string().email().nullable(),
    discord: z.number().int().nullable(),
});

export type License = z.infer<typeof LicenseSchema>;