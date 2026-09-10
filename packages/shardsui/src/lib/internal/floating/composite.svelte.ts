import { isHTMLElement } from '@floating-ui/utils/dom'
import { untrack } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'
import type { ModifierKey } from '../composite'
import { scrollIntoViewIfNeeded } from '../composite'
import { DirectionContext } from '../direction-context'
import { observeDocumentOrder } from '../document-order.svelte'
import { sortByDocumentPosition } from '../document-position'
import { getTarget } from '../dom'
import { isElementDisabled } from '../is-element-disabled'
import type { Orientation } from '../types'
import { resolveIndex, type IndexAction } from './list-navigation'

export type CompositeOrientation = Orientation | 'both'

function isNativeInput(
  element: EventTarget
): element is HTMLElement & (HTMLInputElement | HTMLTextAreaElement) {
  if (!isHTMLElement(element)) return false
  if (element.tagName === 'TEXTAREA') return true
  return (
    element.tagName === 'INPUT' && 'selectionStart' in element && element.selectionStart != null
  )
}

type Item = { element: HTMLElement; disabled: boolean; active: boolean }

type CompositeOptions = {
  orientation: CompositeOrientation
  loopFocus: boolean
  ref: HTMLElement | null
  enableHomeAndEnd?: boolean
  highlightItemOnHover?: boolean
  modifierKeys?: ModifierKey[]
}

export class Composite {
  #options: () => CompositeOptions
  #items = new SvelteMap<HTMLElement, Item>()
  #direction = DirectionContext.get()

  highlightedIndex = $state(0)
  #hasSetDefaultIndex = false

  constructor(options: () => CompositeOptions) {
    this.#options = options

    observeDocumentOrder(() => ({
      container: this.#ref,
      items: this.#sorted,
      elementOf: (item: Item) => item.element,
      reorder: () => {
        this.#order += 1
      }
    }))

    $effect(() => {
      const sorted = this.#sorted
      if (sorted.length === 0) return

      if (!this.#hasSetDefaultIndex) {
        this.#hasSetDefaultIndex = true
        const activeIndex = sorted.findIndex((item) => item.active)
        if (activeIndex !== -1) {
          this.setHighlightedIndex(activeIndex, true)
          return
        }
      }

      if (this.#isNavTarget(sorted[this.highlightedIndex])) return
      const firstNavTargetIndex = this.#navTargetIndex('first')
      if (firstNavTargetIndex >= 0) {
        this.setHighlightedIndex(firstNavTargetIndex)
      }
    })
  }

  highlightItemOnHover = $derived.by(() => this.#options().highlightItemOnHover ?? false)

  #orientation = $derived.by(() => this.#options().orientation)
  #ref = $derived.by(() => this.#options().ref)
  #loopFocus = $derived.by(() => this.#options().loopFocus)
  #enableHomeAndEnd = $derived.by(() => this.#options().enableHomeAndEnd ?? false)
  #modifierKeys = $derived.by(() => this.#options().modifierKeys ?? [])

  // A DOM move leaves the registration set untouched, so the sort needs an explicit signal.
  #order = $state(0)

  // `compareDocumentPosition` orders disconnected nodes inconsistently.
  #sorted = $derived.by(() => {
    void this.#order
    return Array.from(this.#items.values())
      .filter((item) => item.element.isConnected)
      .sort((a, b) => sortByDocumentPosition(a.element, b.element))
  })
  #indexMap = $derived(
    new Map(this.#sorted.map((item, i): [HTMLElement, number] => [item.element, i]))
  )

  #isNavTarget(item: Item | undefined): boolean {
    if (!item) return false
    return item.element.isConnected && !item.disabled
  }

  #navTargetIndex(action: IndexAction, current?: number): number {
    const sorted = this.#sorted
    return resolveIndex(action, {
      count: sorted.length,
      current,
      isSkipped: (i) => !this.#isNavTarget(sorted[i]),
      loop: (action === 'next' || action === 'previous') && this.#loopFocus
    })
  }

  #scrollIndexIntoView(i: number) {
    scrollIntoViewIfNeeded(
      this.#ref,
      this.#sorted[i]?.element ?? null,
      this.#direction.direction,
      this.#orientation
    )
  }

  setHighlightedIndex = (i: number, shouldScrollIntoView = false) => {
    this.highlightedIndex = i
    if (shouldScrollIntoView) this.#scrollIndexIntoView(i)
  }

  indexOfElement = (element: HTMLElement): number => {
    return this.#indexMap.get(element) ?? -1
  }

  register = (
    element: HTMLElement,
    opts: { disabled: boolean; active?: boolean }
  ): (() => void) => {
    this.#items.set(element, { element, disabled: opts.disabled, active: opts.active ?? false })
    return () => {
      this.#items.delete(element)
    }
  }

  #focusIndex = (i: number) => {
    const item = this.#sorted[i]
    if (!item || !item.element.isConnected) return
    this.setHighlightedIndex(i, true)
    item.element.focus()
  }

  onkeydown = (event: KeyboardEvent) => {
    const isRtl = this.#direction.direction === 'rtl'
    const modifierKeys = this.#modifierKeys

    if (
      (event.shiftKey && !modifierKeys.includes('Shift')) ||
      (event.ctrlKey && !modifierKeys.includes('Control')) ||
      (event.altKey && !modifierKeys.includes('Alt')) ||
      (event.metaKey && !modifierKeys.includes('Meta'))
    ) {
      return
    }

    const orientation = this.#orientation
    const horizontalNext = isRtl ? 'ArrowLeft' : 'ArrowRight'
    const horizontalPrev = isRtl ? 'ArrowRight' : 'ArrowLeft'

    const target = getTarget(event)
    if (target && isNativeInput(target) && !isElementDisabled(target)) {
      const selectionStart = target.selectionStart
      const selectionEnd = target.selectionEnd
      const value = target.value

      if (selectionStart != null) {
        if (selectionStart !== selectionEnd) return

        const forwardKey = orientation === 'vertical' ? 'ArrowDown' : horizontalNext
        const backwardKey = orientation === 'vertical' ? 'ArrowUp' : horizontalPrev

        if (event.key !== backwardKey && selectionStart < value.length) return
        if (event.key !== forwardKey && selectionStart > 0) return
      }
    }

    const allowsVertical = orientation !== 'horizontal'
    const allowsHorizontal = orientation !== 'vertical'

    const isForward =
      (allowsVertical && event.key === 'ArrowDown') ||
      (allowsHorizontal && event.key === horizontalNext)
    const isBackward =
      (allowsVertical && event.key === 'ArrowUp') ||
      (allowsHorizontal && event.key === horizontalPrev)
    const isHome = this.#enableHomeAndEnd && event.key === 'Home'
    const isEnd = this.#enableHomeAndEnd && event.key === 'End'

    if (!isForward && !isBackward && !isHome && !isEnd) return

    const newIndex = isHome
      ? this.#navTargetIndex('first')
      : isEnd
        ? this.#navTargetIndex('last')
        : this.#navTargetIndex(isForward ? 'next' : 'previous', this.highlightedIndex)

    if (newIndex !== this.highlightedIndex) {
      event.preventDefault()
      event.stopPropagation()
      this.#focusIndex(newIndex)
    }
  }

  onfocus = (event: FocusEvent) => {
    const target = getTarget(event)
    if (target == null || !isNativeInput(target)) return
    target.setSelectionRange(0, target.value.length)
  }
}

type CompositeItemOptions = {
  composite: Composite
  ref: HTMLElement | null
  disabled: boolean
  active?: boolean
}

export class CompositeItem {
  #options: () => CompositeItemOptions

  constructor(options: () => CompositeItemOptions) {
    this.#options = options

    $effect(() => {
      const el = this.#ref
      if (!el) return
      // Read untracked: the composite consumes `active` only on first registration, and a
      // tracked read would unregister/re-register this item on every selection change.
      return this.#composite.register(el, {
        disabled: this.#disabled,
        active: untrack(() => this.#active)
      })
    })
  }

  #composite = $derived.by(() => this.#options().composite)
  #ref = $derived.by(() => this.#options().ref)
  #disabled = $derived.by(() => this.#options().disabled)
  #active = $derived.by(() => this.#options().active ?? false)

  index = $derived(this.#ref ? this.#composite.indexOfElement(this.#ref) : -1)
  isHighlighted = $derived(this.index === this.#composite.highlightedIndex)
  tabindex = $derived(this.isHighlighted ? 0 : -1)

  onfocus = () => {
    if (this.index !== -1) this.#composite.setHighlightedIndex(this.index)
  }

  focusOnHover = () => {
    const element = this.#ref
    if (!element || !this.#composite.highlightItemOnHover) return
    if (!this.isHighlighted && !this.#disabled) element.focus()
  }
}
