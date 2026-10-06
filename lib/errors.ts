export class AppError extends Error {
  statusCode: number

  constructor(message: string, statusCode = 500) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      status: error.statusCode,
    }
  }

  return {
    error: error instanceof Error ? error.message : 'An unexpected error occurred.',
    status: 500,
  }
}
