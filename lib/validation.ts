import { z } from 'zod'

export async function parseRequestBody<T>(schema: z.ZodType<T>, body: unknown) {
  try {
    return schema.parse(body) as T
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => `${issue.path.join('.') || 'value'}: ${issue.message}`)
      throw new Error(`Validation failed: ${issues.join('; ')}`)
    }

    throw error
  }
}

export function requireText(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} is required.`)
  }

  return value.trim()
}
