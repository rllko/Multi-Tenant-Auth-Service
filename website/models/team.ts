import {z} from 'zod';

export type Team = {
    id: string;
    name: string;
    created_by: string;
    created_at?: string;
    updated_at?: string | null;
};

const TeamTenant = z.object({
    id: z.number(),
    invitedBy: z.string().uuid().nullable(),
    tenant: z.string().uuid().nullable(),
    team: z.string().uuid().nullable(),
    role: z.number().nullable(),
    createdAt: z.number(),
});

export type UpdateRoleDto = z.infer<typeof TeamTenant>;

export type TeamTenant = {
    name?: string;
    updated_at?: string;
};

export type CreateTeamDto = {
    name: string;
    created_by: string; // tenant ID
};

export type UpdateTeamDto = {
    name?: string;
    updated_at?: string;
};