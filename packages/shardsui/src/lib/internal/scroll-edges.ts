import { clamp } from './clamp'

export const SCROLL_EDGE_TOLERANCE_PX = 1

export function getMaxScrollOffset(scrollSize: number, clientSize: number) {
  return Math.max(0, scrollSize - clientSize)
}

export function normalizeScrollOffset(value: number, max: number) {
  if (max <= 0) return 0

  const clamped = clamp(value, 0, max)
  const toEnd = max - clamped
  const atStart = clamped <= SCROLL_EDGE_TOLERANCE_PX
  const atEnd = toEnd <= SCROLL_EDGE_TOLERANCE_PX

  if (atStart && atEnd) return clamped <= toEnd ? 0 : max
  if (atStart) return 0
  if (atEnd) return max

  return clamped
}
