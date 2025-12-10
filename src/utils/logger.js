// Простой JSON-логгер
export function logInfo(message, meta = {}) {
  console.log(JSON.stringify({ level: 'info', message, ...meta }))
}

export function logError(message, meta = {}) {
  console.error(JSON.stringify({ level: 'error', message, ...meta }))
}

export function logDebug(message, meta = {}) {
  if (process.env.NODE_ENV === 'development') {
    console.log(JSON.stringify({ level: 'debug', message, ...meta }))
  }
}
