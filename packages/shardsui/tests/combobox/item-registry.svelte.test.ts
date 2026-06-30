import {
  ComboboxItemRegistry,
  type ComboboxItemRegistryOptions
} from '$lib/components/combobox/item-registry.svelte'
import { waitFor } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import { expect, it } from 'vitest'
function makeContainer(count: number) {
  const container = document.createElement('div')
  const elements = Array.from({ length: count }, () => {
    const element = document.createElement('div')
    container.append(element)
    return element
  })
  document.body.append(container)
  return { container, elements }
}

function defaults(
  overrides: Partial<ComboboxItemRegistryOptions> = {}
): ComboboxItemRegistryOptions {
  return {
    loopFocus: false,
    autoHighlight: false,
    virtualized: false,
    grid: false,
    itemCount: 0,
    container: null,
    ...overrides
  }
}

describe('ComboboxItemRegistry', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('keeps registered items in document order regardless of registration order', () => {
    const { elements } = makeContainer(3)

    const cleanup = $effect.root(() => {
      const registry = new ComboboxItemRegistry(() => defaults())
      flushSync()

      registry.registerItem(elements[2], { value: 'c' })
      registry.registerItem(elements[0], { value: 'a' })
      registry.registerItem(elements[1], { value: 'b' })
      flushSync()

      expect(registry.items.map((it) => it.value)).toEqual(['a', 'b', 'c'])
      expect(registry.indexOf(elements[0])).toBe(0)
      expect(registry.indexOf(elements[1])).toBe(1)
      expect(registry.indexOf(elements[2])).toBe(2)
      expect(registry.firstIndex()).toBe(0)
    })

    cleanup()
  })

  describe('virtualized', () => {
    it('clears a highlight left past the item count when the list shrinks', () => {
      let itemCount = $state(11)

      const cleanup = $effect.root(() => {
        const registry = new ComboboxItemRegistry(() => defaults({ virtualized: true, itemCount }))
        flushSync()

        registry.setHighlightedIndex(10, 'keyboard')
        flushSync()
        expect(registry.highlightedIndex).toBe(10)

        itemCount = 3
        flushSync()

        expect(registry.highlightedIndex).toBe(-1)
        expect(registry.lastHighlightReason).toBe('none')
      })

      cleanup()
    })

    it('ignores a stale teardown when a different element holds the index', () => {
      const { elements } = makeContainer(2)

      const cleanup = $effect.root(() => {
        const registry = new ComboboxItemRegistry(() =>
          defaults({ virtualized: true, itemCount: 10 })
        )
        flushSync()

        const unregister = registry.registerVirtualItem(3, elements[1])
        registry.registerVirtualItem(3, elements[0])
        unregister()
        flushSync()

        expect(registry.getItemElement(3)).toBe(elements[0])
      })

      cleanup()
    })
  })

  describe('document-order re-sorting', () => {
    it('re-sorts recorded indices when a node moves inside the popup', async () => {
      const { container, elements } = makeContainer(3)
      let registry!: ComboboxItemRegistry

      const cleanup = $effect.root(() => {
        registry = new ComboboxItemRegistry(() => defaults({ container }))
        flushSync()

        for (const [i, element] of elements.entries()) {
          registry.registerItem(element, { value: i })
        }
        flushSync()

        container.append(elements[0])
      })

      await waitFor(() => {
        expect(registry.items.map((it) => it.value)).toEqual([1, 2, 0])
      })

      expect(registry.indexOf(elements[0])).toBe(2)
      expect(registry.indexOf(elements[1])).toBe(0)

      cleanup()
    })
  })
})
