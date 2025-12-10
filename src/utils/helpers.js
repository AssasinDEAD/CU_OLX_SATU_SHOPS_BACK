// валидация строк
export function requireString(value, fieldName){
   if(typeof value !== "string" || value.trim()){
      throw new Error(`${fieldName} must be a non-empty string`)
   }
   return value.trim()
}

// Валидация чисел
export function requireNumber(value, fieldName){
   if(typeof value !== "number" || isNaN(value)){
      throw new Error(`${fieldName} must be a valid number`)
   }
   return value
}

// Опциональная строка
export function optionalString(value) {
  return typeof value === 'string' ? value.trim() : null
}

// Генерация UUID (если нужно без БД)
import { randomUUID } from 'crypto'
export function generateUUID() {
  return randomUUID()
}
