import { AnimationFrame } from '$lib/internal/animation-frame.svelte'
import { isElementVisible, resolveIndex } from '$lib/internal/floating/list-navigation'
import { ItemList } from '$lib/internal/item-list.svelte'

type MenuItemRegistryOptions = {
  loopFocus: boolean
  container: HTMLElement | null
}

function scrollIntoView(element: HTMLElement) {
  element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
}

export class MenuItemRegistry extends ItemList<{ label: string }> {
  #options: () => MenuItemRegistryOptions
  #queuedFocusFrame = new AnimationFrame()

  highlightedIndex = $state(-1)

  count = $derived(this.items.length)

  constructor(options: () => MenuItemRegistryOptions) {
    super(() => ({ container: options().container }), false)
    this.#options = options

    const register = this.registerItem
    this.registerItem = (element, item) => {
      const unregister = register(element, item)
      return () => {
        unregister()
        if (this.highlightedIndex >= this.items.length) {
          this.highlightedIndex = this.items.length - 1
        }
      }
    }
  }

  focusItem = (i: number, scrollIntoViewIfNeeded = true): void => {
    const item = this.items[i]
    if (!item) return
    this.#queuedFocusFrame.cancel()
    this.highlightedIndex = i
    item.element.focus({ preventScroll: true })
    if (scrollIntoViewIfNeeded) scrollIntoView(item.element)
  }

  #isNativelyDisabled(i: number): boolean {
    const el = this.items[i]?.element
    return !!el && el.matches(':disabled')
  }

  #isHidden(i: number): boolean {
    const el = this.items[i]?.element
    return !!el && !isElementVisible(el)
  }

  #isSkipped(i: number): boolean {
    return this.#isNativelyDisabled(i) || this.#isHidden(i)
  }

  stepIndex = (start: number, dir: 1 | -1): number => {
    return resolveIndex(dir === 1 ? 'next' : 'previous', {
      count: this.items.length,
      current: start,
      isSkipped: (i) => this.#isSkipped(i),
      loop: this.#options().loopFocus
    })
  }

  firstIndex = (): number => {
    if (this.items.length === 0) return -1
    for (let i = 0; i < this.items.length; i++) if (!this.#isSkipped(i)) return i
    return 0
  }

  lastIndex = (): number => {
    if (this.items.length === 0) return -1
    for (let i = this.items.length - 1; i >= 0; i--) if (!this.#isSkipped(i)) return i
    return this.items.length - 1
  }

  clearQueuedFocus = (): void => {
    this.#queuedFocusFrame.cancel()
  }

  applyPendingFocus = (pendingFocus: 'first' | 'last'): void => {
    if (this.items.length === 0) return
    const i = pendingFocus === 'first' ? this.firstIndex() : this.lastIndex()
    if (i === -1) return
    this.highlightedIndex = i
    const element = this.items[i].element
    // Focus must land synchronously where it can, or the next keystroke of the keydown that set
    // `pendingFocus` reaches the still-focused parent menu. An unpositioned popup is not
    // focusable, so fall back to the frame there.
    this.#queuedFocusFrame.cancel()
    element.focus({ preventScroll: true })
    if (element.ownerDocument.activeElement !== element) {
      this.#queuedFocusFrame.request(() => {
        element.focus({ preventScroll: true })
        scrollIntoView(element)
      })
    } else {
      scrollIntoView(element)
    }
  }

  elements = (): HTMLElement[] => {
    return this.items.map((it) => it.element)
  }

  labels = (): string[] => {
    return this.items.map((it) => it.label)
  }
}
