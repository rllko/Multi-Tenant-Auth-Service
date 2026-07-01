// Matches the backend TenantDto (Server/Models/Entities/Tenant.cs)
export type Tenant = {
    id: string;
    discordId?: string | null;
    email: string;
    role: string;
    name: string;
};

export type UpdateTenantDto = {
    name?: string;
    discordId?: number;
    email?: string;
    password?: string;
};
