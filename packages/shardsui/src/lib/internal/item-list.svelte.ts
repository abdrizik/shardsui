import { untrack } from 'svelte'
import { observeDocumentOrder } from './document-order.svelte'
import { insertInDocumentOrder } from './document-position'

type ItemListOptions = {
  container: HTMLElement | null
}

export class ItemList<Data extends object> {
  #options: () => ItemListOptions

  items = $state.raw<(Data & { element: HTMLElement })[]>([])

  #indexMap = $derived(
    new Map<Element, number>(
      this.items.map((item, index): [Element, number] => [item.element, index])
    )
  )

  constructor(options: () => ItemListOptions, observe = true) {
    this.#options = options

    if (observe) this.observeContainer()
  }

  observeContainer = (): void => {
    observeDocumentOrder(() => ({
      container: this.#options().container,
      items: this.items,
      elementOf: (item: Data & { element: HTMLElement }) => item.element,
      reorder: (sorted: (Data & { element: HTMLElement })[]) => {
        this.items = sorted
      }
    }))
  }

  registerItem = (element: HTMLElement, item: Data): (() => void) => {
    untrack(() => {
      const next = this.items.slice()
      insertInDocumentOrder(next, { ...item, element })
      this.items = next
    })

    return () => {
      const index = this.items.findIndex((registered) => registered.element === element)
      if (index !== -1) {
        const next = this.items.slice()
        next.splice(index, 1)
        this.items = next
      }
    }
  }

  indexOf = (element: Element | null): number => {
    return element ? (this.#indexMap.get(element) ?? -1) : -1
  }
}
