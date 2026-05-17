let idCounter = 0

export function generateId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Math.random().toString(36).slice(2, 6)}-${idCounter}`
}
