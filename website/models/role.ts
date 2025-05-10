export type Role = {
    role_id: number;
    role_name: string;
    description?: string
    slug: string;
    role_type: number;
    created_by: string;
    is_default: boolean
    scopes?: string[]
    isSystemRole?: boolean;
};

export type CreateRoleDto = {
    role_name: string;
    slug: string;
    role_type: number;
    impact: string
    created_by: string;
    is_default: boolean;
};

export type UpdateRoleDto = {
    role_name: string;
    slug: string;
    role_type: number;
    created_by: string;
    is_default: boolean;
};