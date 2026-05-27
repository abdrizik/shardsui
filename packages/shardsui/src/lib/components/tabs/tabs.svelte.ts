import { dataAttrs } from '$lib/internal/data-attrs'
import { sortByDocumentPosition } from '$lib/internal/document-position'
import type { Orientation } from '$lib/internal/types'
import { SvelteMap } from 'svelte/reactivity'

export type TabsValue = string | number | null
export type TabsOrientation = Orientation
export type TabsActivationDirection = 'left' | 'right' | 'up' | 'down' | 'none'

export type TabsState = {
  orientation: TabsOrientation
  activationDirection: TabsActivationDirection
}

type TabMeta = {
  id: string
  value: TabsValue
  element: HTMLElement | null
  disabled: boolean
}

type TabsRootOptions = {
  value: TabsValue | undefined
  setValue: (value: TabsValue) => void
  orientation: TabsOrientation
  onValueChange?: (value: TabsValue) => void
}

export class TabsRoot {
  #options: () => TabsRootOptions
  #tabs = new SvelteMap<HTMLElement, TabMeta>()
  #panels = new SvelteMap<TabsValue, string>()

  #isControlled = $derived.by(() => this.#options().value !== undefined)

  #internalValue = $state<TabsValue>(0)
  #previousValue: TabsValue
  #initialNotified: boolean
  #didRegisterTabs = false

  activationDirection = $state<TabsActivationDirection>('none')

  value = $derived.by(() => {
    const { value } = this.#options()
    return value !== undefined ? value : this.#internalValue
  })
  orientation = $derived.by(() => this.#options().orientation)

  state: TabsState = $derived({
    orientation: this.orientation,
    activationDirection: this.activationDirection
  })

  #orderedTabs = $derived(
    Array.from(this.#tabs.values())
      .filter((meta): meta is TabMeta & { element: HTMLElement } => !!meta.element?.isConnected)
      .sort((a, b) => sortByDocumentPosition(a.element, b.element))
  )

  stateAttrs = $derived(
    dataAttrs({
      orientation: this.orientation,
      'activation-direction': this.activationDirection
    })
  )

  constructor(options: () => TabsRootOptions) {
    this.#options = options
    this.#previousValue = this.value
    this.#initialNotified = options().value !== undefined

    $effect(() => this.#syncSelection())
    $effect.pre(() => this.#syncActivationDirection())
  }

  #syncSelection() {
    if (this.#isControlled) return

    if (this.#tabs.size === 0) {
      if (!this.#didRegisterTabs || this.value === null) return
      this.#commitAutomaticValueChange(null)
      return
    }

    this.#didRegisterTabs = true

    if (this.value === null) return

    const currentTab = this.#getTabMetaByValue(this.value)

    if (!currentTab || currentTab.disabled) {
      const fallback = this.#orderedTabs.find((meta) => !meta.disabled)?.value ?? null

      if (this.value === fallback) {
        this.#initialNotified = true
        return
      }

      this.#commitAutomaticValueChange(fallback)
    } else if (!this.#initialNotified) {
      this.#updateValue(this.value)
      this.#options().onValueChange?.(this.value)
      this.#initialNotified = true
    }
  }

  #syncActivationDirection() {
    const value = this.value
    const previous = this.#previousValue
    if (value === previous) return

    const toElement = this.getTabElementByValue(value)

    this.activationDirection = this.#computeDirection(previous, value)

    const directionComputationIncomplete = previous != null && value != null && toElement == null
    if (!directionComputationIncomplete) this.#previousValue = value
  }

  #getTabMetaByValue(value: TabsValue): TabMeta | undefined {
    for (const meta of this.#tabs.values()) {
      if (meta.value === value) return meta
    }
    return undefined
  }

  #updateValue(next: TabsValue) {
    this.#internalValue = next
    this.#options().setValue(next)
  }

  #commitAutomaticValueChange(fallback: TabsValue) {
    this.activationDirection = 'none'
    this.#previousValue = fallback
    this.#updateValue(fallback)
    this.#options().onValueChange?.(fallback)
    this.#initialNotified = true
  }

  #computeDirection(from: TabsValue, to: TabsValue): TabsActivationDirection {
    if (from == null || to == null) return 'none'

    const fromElement = this.getTabElementByValue(from)
    const toElement = this.getTabElementByValue(to)

    if (!fromElement && !toElement) return 'none'

    const [axis, backward, forward] =
      this.orientation === 'horizontal'
        ? (['left', 'left', 'right'] as const)
        : (['top', 'up', 'down'] as const)

    if (!fromElement || !toElement) {
      if (typeof from !== typeof to) return 'none'
      return to > from ? forward : backward
    }

    const fromPosition = fromElement.getBoundingClientRect()[axis]
    const toPosition = toElement.getBoundingClientRect()[axis]

    if (toPosition < fromPosition) return backward
    if (toPosition > fromPosition) return forward
    return 'none'
  }

  setValue = (next: TabsValue) => {
    if (next === this.value) return
    this.#options().onValueChange?.(next)
    this.#updateValue(next)
  }

  registerTab = (meta: TabMeta) => {
    const element = meta.element!
    this.#tabs.set(element, meta)
    return () => {
      if (this.#tabs.get(element) === meta) this.#tabs.delete(element)
    }
  }

  registerPanel = (value: TabsValue, id: string) => {
    this.#panels.set(value, id)
    return () => {
      if (this.#panels.get(value) === id) this.#panels.delete(value)
    }
  }

  getTabIdByValue = (value: TabsValue) => this.#getTabMetaByValue(value)?.id

  getPanelIdByValue = (value: TabsValue) => this.#panels.get(value)

  getTabElementByValue = (value: TabsValue) => this.#getTabMetaByValue(value)?.element ?? null
}
