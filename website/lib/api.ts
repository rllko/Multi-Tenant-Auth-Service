import { z } from "zod"

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.keyauth.com/v1"

// API error schema
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.array(z.unknown()).optional(),
})

export type ApiError = z.infer<typeof ApiErrorSchema>

// Generic API response wrapper
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
  })

// API client with error handling
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
      // Try to parse as API error
      const parsedError = ApiErrorSchema.safeParse(data)
      if (parsedError.success) {
        throw new Error(parsedError.data.message)
      }
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    // Validate response against schema
    const parsedData = schema.safeParse(data)
    if (!parsedData.success) {
      console.error("API response validation error:", parsedData.error)
      throw new Error("Invalid API response format")
    }

    return parsedData.data
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}
