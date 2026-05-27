import { Composite } from '$lib/internal/floating/composite.svelte'
import type { Attachment } from 'svelte/attachments'
import type { TabsOrientation } from './tabs.svelte'

type TabsListOptions = {
  orientation: TabsOrientation
  activateOnFocus: boolean
  loopFocus: boolean
  ref: HTMLElement | null
}

export class TabsList {
  #options: () => TabsListOptions
  composite: Composite

  #observedTabs = new Set<HTMLElement>()
  #observer: ResizeObserver | null = null

  resizeVersion = $state(0)

  activateOnFocus = $derived.by(() => this.#options().activateOnFocus)
  element = $derived.by(() => this.#options().ref)

  constructor(options: () => TabsListOptions) {
    this.#options = options
    this.composite = new Composite(() => ({
      orientation: options().orientation,
      loopFocus: options().loopFocus,
      ref: options().ref,
      enableHomeAndEnd: true
    }))
  }

  observeList: Attachment<HTMLElement> = (node) => {
    const observer = new ResizeObserver(() => {
      this.resizeVersion += 1
    })
    this.#observer = observer
    observer.observe(node)
    for (const element of this.#observedTabs) observer.observe(element)
    return () => {
      observer.disconnect()
      this.#observer = null
    }
  }

  observeTab: Attachment<HTMLElement> = (element) => {
    this.#observedTabs.add(element)
    this.#observer?.observe(element)
    return () => {
      this.#observedTabs.delete(element)
      this.#observer?.unobserve(element)
    }
  }
}
