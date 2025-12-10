// Базовый класс ошибок
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, 400)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(message, 404)
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500)
  }
}

// Middleware для обработки ошибок
export function errorMiddleware(err, req, res, next) {
  const status = err.statusCode || 500
  res.status(status).json({
    error: {
      name: err.name,
      message: err.message,
      statusCode: status,
    },
  })
}
