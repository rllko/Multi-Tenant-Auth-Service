import { z } from "zod"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.keyauth.com/v1"

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

export async function apiClient<T extends z.ZodType>(
  endpoint: string,
  options: RequestInit = {},
  schema: T,
): Promise<z.infer<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("keyauth_token")}`,
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      const parsedError = ApiErrorSchema.safeParse(data)
      if (parsedError.success) {
        throw new Error(parsedError.data.message)
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const parsedData = schema.safeParse(data)
    if (!parsedData.success) {
      throw new Error("Invalid API response format")
    }

    return parsedData.data
  } catch (error) {
    throw error
  }
}
