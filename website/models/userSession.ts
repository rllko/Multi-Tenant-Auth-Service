export type UserSession = {
    id: string;
    session_token: string;
    license_id: number;
    ip_address?: string;
    created_at: number;
    refreshed_at?: number | null;
    is_active?: boolean;
    application: string;
};