import { resolveIndex } from '$lib/internal/floating/list-navigation'
import { isElementDisabled } from '$lib/internal/is-element-disabled'
import { compareItemEquality } from '$lib/internal/item-equality'
import { ItemList } from '$lib/internal/item-list.svelte'
import type { SelectItem } from './context'

export type SelectItemRegistryOptions = {
  isItemEqualToValue: (a: unknown, b: unknown) => boolean
  scroller: HTMLElement | null
}

export class SelectItemRegistry extends ItemList<Omit<SelectItem, 'element'>> {
  #options: () => SelectItemRegistryOptions

  highlightedIndex = $state(-1)

  count = $derived(this.items.length)

  constructor(options: () => SelectItemRegistryOptions) {
    super(() => ({ container: options().scroller }))
    this.#options = options
  }

  labels = (): string[] => {
    return this.items.map((item) => item.element.textContent?.trim() ?? '')
  }

  getValueAtIndex = (index: number): unknown => {
    return this.items[index]?.value
  }

  isItemDisabled = (index: number): boolean => {
    return isElementDisabled(this.items[index]?.element ?? null)
  }

  stepIndex = (start: number, dir: 1 | -1): number => {
    return resolveIndex(dir === 1 ? 'next' : 'previous', {
      count: this.items.length,
      current: start
    })
  }

  firstIndex = (): number => {
    return this.items.length > 0 ? 0 : -1
  }

  lastIndex = (): number => {
    return this.items.length - 1
  }

  findByValue = (value: unknown): number => {
    return this.items.findIndex((item) =>
      compareItemEquality(item.value, value, this.#options().isItemEqualToValue)
    )
  }

  focusItemElement = (index: number, scroll = true): void => {
    const item = this.items[index]
    if (!item) return
    item.element.focus({ preventScroll: true })
    if (!scroll) return
    const scroller = this.#options().scroller
    if (scroller) scrollItemIntoScroller(scroller, item.element)
  }
}

function scrollItemIntoScroller(scroller: HTMLElement, item: HTMLElement): void {
  const itemRect = item.getBoundingClientRect()
  const scrollerRect = scroller.getBoundingClientRect()
  if (itemRect.top < scrollerRect.top) {
    scroller.scrollTop += itemRect.top - scrollerRect.top
  } else if (itemRect.bottom > scrollerRect.bottom) {
    scroller.scrollTop += itemRect.bottom - scrollerRect.bottom
  }
}
