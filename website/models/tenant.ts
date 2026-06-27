export type Tenant = {
    id: string;
    discordId?: number;
    email?: string;
    name: string;
    creation_date?: string;
    password?: string | null;
    activated_at?: string | null;
};

export type UpdateTenantDto = {
    name?: string;
    discordId?: number;
    email?: string;
    password?: string;
};