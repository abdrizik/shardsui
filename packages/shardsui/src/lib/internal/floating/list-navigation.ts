import { getComputedStyle } from '@floating-ui/utils/dom'

export type IndexAction = 'next' | 'previous' | 'first' | 'last'

type ResolveIndexOptions = {
  count: number
  current?: number
  isSkipped?: (index: number) => boolean
  loop?: boolean
}

export function resolveIndex(action: IndexAction, options: ResolveIndexOptions): number {
  const { count, current, isSkipped, loop = false } = options
  if (count === 0) return -1

  const forward = action === 'next' || action === 'first'
  const fromEdge = action === 'first' || action === 'last'
  const dir = forward ? 1 : -1
  const start = fromEdge ? (forward ? -1 : count) : (current ?? -1)
  const fallback = fromEdge ? -1 : start

  let i = start
  for (let attempts = 0; attempts < count; attempts += 1) {
    i += dir
    if (i < 0) {
      if (!loop) return fallback
      i = count - 1
    } else if (i >= count) {
      if (!loop) return fallback
      i = 0
    }
    if (!isSkipped?.(i)) return i
  }
  return fallback
}

export function isElementVisible(
  element: Element,
  styles: CSSStyleDeclaration = getComputedStyle(element)
): boolean {
  if (!element.isConnected) return false
  if (styles.visibility === 'hidden' || styles.visibility === 'collapse') return false
  if (typeof element.checkVisibility === 'function') {
    return element.checkVisibility()
  }
  return styles.display !== 'none' && styles.display !== 'contents'
}
