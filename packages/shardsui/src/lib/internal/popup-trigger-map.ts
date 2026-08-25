import { contains } from '$lib/internal/dom'
import { DEV } from 'esm-env'
import { untrack } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'

export class PopupTriggerMap<TriggerBindings = Record<string, unknown>> {
  #idMap = new SvelteMap<string, HTMLElement>()
  #triggerBindingsMap = new Map<string, () => TriggerBindings>()
  add(id: string, element: HTMLElement, triggerBindings?: () => TriggerBindings): () => void {
    untrack(() => {
      if (DEV) {
        for (const [existingId, existingElement] of this.#idMap) {
          if (existingElement === element && existingId !== id) {
            throw new Error(
              'ShardsUI: A trigger element cannot be registered under multiple IDs in PopupTriggerMap.'
            )
          }
        }
      }

      if (triggerBindings) {
        this.#triggerBindingsMap.set(id, triggerBindings)
      } else {
        this.#triggerBindingsMap.delete(id)
      }
      const existingElement = this.#idMap.get(id)
      if (existingElement === element) {
        return
      }
      this.#idMap.set(id, element)
    })

    return () => {
      untrack(() => {
        if (this.#idMap.get(id) === element) {
          this.#triggerBindingsMap.delete(id)
          this.#idMap.delete(id)
        }
      })
    }
  }

  delete(id: string): void {
    untrack(() => {
      this.#triggerBindingsMap.delete(id)
      this.#idMap.delete(id)
    })
  }

  getTriggerBindingsById(id: string): TriggerBindings | undefined {
    return untrack(() => this.#triggerBindingsMap.get(id)?.())
  }

  hasElement(element: Element): boolean {
    for (const registered of this.#idMap.values()) {
      if (registered === element) {
        return true
      }
    }
    return false
  }

  containsNode(target: EventTarget | null | undefined): boolean {
    for (const element of this.#idMap.values()) {
      if (contains(element, target)) {
        return true
      }
    }
    return false
  }

  getById(id: string): HTMLElement | undefined {
    return this.#idMap.get(id)
  }

  entries(): IterableIterator<[string, HTMLElement]> {
    return this.#idMap.entries()
  }

  elements(): IterableIterator<HTMLElement> {
    return this.#idMap.values()
  }

  get size(): number {
    return this.#idMap.size
  }
}
