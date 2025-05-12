export type Team = {
    id: string;
    name: string;
    created_by: string;
    created_at?: string;
    updated_at?: string | null;
};


export type CreateTeamDto = {
    name: string;
    created_by: string; // tenant ID
};

export type UpdateTeamDto = {
    name?: string;
    updated_at?: string;
};