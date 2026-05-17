export function mergeStyle(...parts: (string | false | null | undefined)[]): string | undefined {
  let merged = ''
  for (const part of parts) {
    if (!part) continue
    const declarations = part.trim().replace(/;+$/, '')
    if (!declarations) continue
    merged = merged ? `${merged};${declarations}` : declarations
  }
  return merged || undefined
}
