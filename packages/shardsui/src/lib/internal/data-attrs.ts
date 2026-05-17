export function dataAttrs<
  State extends Record<string, boolean | string | number | null | undefined>
>(state: State): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const key in state) {
    const value = state[key]
    const attr = `data-${key.toLowerCase()}`
    if (value === true) {
      out[attr] = ''
    } else if (value === false || value == null || value === '') {
      out[attr] = undefined
    } else {
      out[attr] = String(value)
    }
  }
  return out
}
