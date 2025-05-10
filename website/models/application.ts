export type Application = {
    id: string;
    name: string;
    description?: string;
};

export type CreateApplicationDto = {
    name: string;
    description?: string;
    default_key_schema?: string;
};

export type UpdateApplicationDto = {
    name?: string;
    description?: string;
    default_key_schema?: string;
};