import { TYPEAHEAD_RESET_MS } from '../constants'
import { contains } from '../dom'
import { Timeout } from '../timeout'
import { isElementVisible } from './list-navigation'

type TypeaheadOptions = {
  items: Array<string | undefined | null>
  activeIndex: number
  onMatch: (index: number) => void
  enabled?: boolean
  selectedIndex?: number | null
  elements?: Array<HTMLElement | null>
  isIndexDisabled?: (index: number) => boolean
  onTyping?: (isTyping: boolean) => void
  resetMs?: number
  referenceElement?: Element | null | undefined
  floatingElement?: Element | null | undefined
  open?: boolean
}

function isItemAvailable(opts: TypeaheadOptions, idx: number): boolean {
  const element = opts.elements?.[idx]
  if (element && !isElementVisible(element)) return false
  if (element?.matches(':disabled')) return false
  return !opts.isIndexDisabled?.(idx)
}

function getMatchingIndex(opts: TypeaheadOptions, query: string, startIndex = 0): number {
  const items = opts.items
  if (items.length === 0) return -1
  const normalizedStart = ((startIndex % items.length) + items.length) % items.length
  const lower = query.toLowerCase()
  for (let offset = 0; offset < items.length; offset += 1) {
    const idx = (normalizedStart + offset) % items.length
    const text = items[idx]
    if (!text?.toLowerCase().startsWith(lower) || !isItemAvailable(opts, idx)) continue
    return idx
  }
  return -1
}

export function createTypeahead(options: () => TypeaheadOptions) {
  const timeout = new Timeout()

  let buffer = ''
  let prevIndex: number | null = null
  let matchIndex: number | null = null

  // Per-field deriveds, not one inline `options()` read: the reset below must depend on
  // `open` and `selectedIndex` alone, or any other option changing would clear a live buffer.
  const open = $derived(options().open ?? true)
  const selectedIndex = $derived(options().selectedIndex ?? null)

  $effect(timeout.disposeEffect)

  $effect.pre(() => {
    if (!open && selectedIndex !== null) return

    timeout.clear()
    matchIndex = null
    buffer = ''
  })

  return {
    matchKey: (event: KeyboardEvent) => {
      const opts = options()
      if (opts.enabled === false) return

      const items = opts.items

      if (buffer.length > 0 && event.key === ' ') {
        event.preventDefault()
        event.stopPropagation()
        opts.onTyping?.(true)
      }

      if (buffer.length > 0 && buffer[0] !== ' ') {
        if (getMatchingIndex(opts, buffer, 0) === -1 && event.key !== ' ') {
          opts.onTyping?.(false)
        }
      }

      if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) {
        return
      }

      if ((opts.open ?? true) && event.key !== ' ') {
        event.preventDefault()
        event.stopPropagation()
        opts.onTyping?.(true)
      }

      const isNewSession = buffer === ''
      if (isNewSession) {
        prevIndex = opts.selectedIndex ?? opts.activeIndex
      }

      const allowRapidSuccessionOfFirstLetter = items.every(
        (text, index) =>
          !text ||
          text[0]?.toLowerCase() !== text[1]?.toLowerCase() ||
          !isItemAvailable(opts, index)
      )

      if (allowRapidSuccessionOfFirstLetter && buffer === event.key) {
        buffer = ''
        prevIndex = matchIndex
      }

      buffer += event.key
      timeout.start(opts.resetMs ?? TYPEAHEAD_RESET_MS, () => {
        buffer = ''
        prevIndex = matchIndex
        opts.onTyping?.(false)
      })

      const startIndex = (prevIndex ?? 0) + 1
      const idx = getMatchingIndex(opts, buffer, startIndex)

      if (idx !== -1) {
        opts.onMatch(idx)
        matchIndex = idx
      } else if (event.key !== ' ') {
        buffer = ''
        opts.onTyping?.(false)
      }
    },

    resetOnFocusLeave: (event: FocusEvent) => {
      const opts = options()
      if (opts.enabled === false) return

      const next = event.relatedTarget
      const referenceElement = opts.referenceElement
      const floatingElement = opts.floatingElement

      const withinComposite = contains(referenceElement, next) || contains(floatingElement, next)

      if (withinComposite) {
        return
      }

      timeout.clear()
      buffer = ''
      prevIndex = matchIndex
      opts.onTyping?.(false)
    }
  }
}
