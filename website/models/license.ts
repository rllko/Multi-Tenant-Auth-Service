export type License = {
    id: number;
    value: string;
    discordId?: number;
    max_sessions?: number;
    email?: string;
    username: string;
    creation_date: number;
    password?: string | null;
    activated_at?: number | null;
    expires_at: number;
    last_paused_at?: number | null;
    paused?: boolean;
    activated?: boolean;
    application: string;
};

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