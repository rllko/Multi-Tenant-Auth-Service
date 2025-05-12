import {z} from "zod"

export const ApiErrorSchema = z.object({
    code: z.string(),
    message: z.string(),
    details: z.array(z.unknown()).optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
    z.object({
        success: z.boolean(),
        data: dataSchema.optional(),
        error: ApiErrorSchema.optional(),
    })
