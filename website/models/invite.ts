// Matches the backend TenantInviteDto (Server/Models/Entities/TenantInvite.cs)
export type TenantInvite = {
    inviteToken: string;
    createdBy: string;
    createdByEmail: string;
    teamName: string;
    status: string;
    createdAt: string;
    expiresAt: string;
};

// Matches TenantInviteCreateDto — POST /teams/{teamId}/members
export type CreateTenantInviteDto = {
    email: string;
    inviteMessage: string;
};
