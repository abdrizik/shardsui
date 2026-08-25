import {
  SelectItemRegistry,
  type SelectItemRegistryOptions
} from '$lib/components/select/item-registry.svelte'
import { flushSync } from 'svelte'
import { expect, it } from 'vitest'
import { isJSDOM } from '../test-utils'
function makeContainer(count: number, tag = 'button') {
  const container = document.createElement('div')
  const elements = Array.from({ length: count }, () => {
    const element = document.createElement(tag)
    container.append(element)
    return element
  })
  document.body.append(container)
  return { container, elements }
}

function defaults(overrides: Partial<SelectItemRegistryOptions> = {}): SelectItemRegistryOptions {
  return {
    isItemEqualToValue: (a, b) => Object.is(a, b),
    scroller: null,
    ...overrides
  }
}

describe('SelectItemRegistry', () => {
  afterEach(() => {
    document.body.replaceChildren()
  })

  it('starts empty', () => {
    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      expect(registry.items).toEqual([])
      expect(registry.count).toBe(0)
      expect(registry.highlightedIndex).toBe(-1)
      expect(registry.firstIndex()).toBe(-1)
      expect(registry.stepIndex(0, 1)).toBe(-1)
      expect(registry.findByValue('a')).toBe(-1)
      expect(registry.labels()).toEqual([])
    })

    cleanup()
  })

  it('reports -1 from lastIndex when there are no items', () => {
    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      expect(registry.lastIndex()).toBe(-1)
    })

    cleanup()
  })

  it('keeps registered items in document order regardless of registration order', () => {
    const { elements } = makeContainer(3)

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      registry.registerItem(elements[2], { value: 'c' })
      registry.registerItem(elements[0], { value: 'a' })
      registry.registerItem(elements[1], { value: 'b' })
      flushSync()

      expect(registry.items.map((it) => it.value)).toEqual(['a', 'b', 'c'])
      expect(registry.count).toBe(3)
      expect(registry.indexOf(elements[1])).toBe(1)
      expect(registry.indexOf(document.createElement('div'))).toBe(-1)
      expect(registry.firstIndex()).toBe(0)
      expect(registry.lastIndex()).toBe(2)
    })

    cleanup()
  })

  it('removes an item through the disposer without touching the highlight', () => {
    const { elements } = makeContainer(3)

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      registry.registerItem(elements[0], { value: 'a' })
      const removeB = registry.registerItem(elements[1], { value: 'b' })
      registry.registerItem(elements[2], { value: 'c' })
      flushSync()

      registry.highlightedIndex = 2
      removeB()
      flushSync()

      expect(registry.items.map((it) => it.value)).toEqual(['a', 'c'])
      expect(registry.count).toBe(2)
      expect(registry.highlightedIndex).toBe(2)
    })

    cleanup()
  })

  it('reads labels from the element text, including text set after registration', () => {
    const { elements } = makeContainer(3)
    elements[0].textContent = '  from text  '
    elements[1].textContent = 'before rename'
    elements[2].textContent = ''

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      registry.registerItem(elements[0], { value: 'a' })
      registry.registerItem(elements[1], { value: 'b' })
      registry.registerItem(elements[2], { value: 'c' })
      flushSync()

      elements[1].textContent = 'after rename'

      expect(registry.labels()).toEqual(['from text', 'after rename', ''])
    })

    cleanup()
  })

  it('reads the value at an index', () => {
    const { elements } = makeContainer(2)

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      registry.registerItem(elements[0], { value: 1 })
      registry.registerItem(elements[1], { value: 2 })
      flushSync()

      expect(registry.getValueAtIndex(0)).toBe(1)
      expect(registry.getValueAtIndex(9)).toBeUndefined()
    })

    cleanup()
  })

  it('treats disabled and aria-disabled elements as disabled', () => {
    const { elements } = makeContainer(3)
    elements[1].setAttribute('disabled', '')
    elements[2].setAttribute('aria-disabled', 'true')

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      for (const [i, element] of elements.entries()) {
        registry.registerItem(element, { value: i })
      }
      flushSync()

      expect(registry.isItemDisabled(0)).toBe(false)
      expect(registry.isItemDisabled(1)).toBe(true)
      expect(registry.isItemDisabled(2)).toBe(true)
    })

    cleanup()
  })

  it('reports an out-of-range index as disabled', () => {
    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      expect(registry.isItemDisabled(0)).toBe(true)
    })

    cleanup()
  })

  it('clamps stepIndex at both ends and never loops', () => {
    const { elements } = makeContainer(3)

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      for (const [i, element] of elements.entries()) {
        registry.registerItem(element, { value: i })
      }
      flushSync()

      expect(registry.stepIndex(0, 1)).toBe(1)
      expect(registry.stepIndex(2, -1)).toBe(1)
      expect(registry.stepIndex(2, 1)).toBe(2)
      expect(registry.stepIndex(0, -1)).toBe(0)
    })

    cleanup()
  })

  it('lands on a disabled item because stepIndex ignores disabled state', () => {
    const { elements } = makeContainer(3)
    elements[1].setAttribute('disabled', '')

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      for (const [i, element] of elements.entries()) {
        registry.registerItem(element, { value: i })
      }
      flushSync()

      expect(registry.stepIndex(0, 1)).toBe(1)
    })

    cleanup()
  })

  it('finds an item by value through the supplied comparer', () => {
    const { elements } = makeContainer(3)

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() =>
        defaults({
          isItemEqualToValue: (a, b) =>
            a instanceof Object && b instanceof Object && 'id' in a && 'id' in b && a.id === b.id
        })
      )
      flushSync()

      registry.registerItem(elements[0], { value: { id: 1 } })
      registry.registerItem(elements[1], { value: { id: 2 } })
      registry.registerItem(elements[2], { value: { id: 3 } })
      flushSync()

      expect(registry.findByValue({ id: 2 })).toBe(1)
      expect(registry.findByValue({ id: 9 })).toBe(-1)
    })

    cleanup()
  })

  it('matches null values by identity without calling the comparer', () => {
    const { elements } = makeContainer(2)
    let calls = 0

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() =>
        defaults({
          isItemEqualToValue: () => {
            calls += 1
            return true
          }
        })
      )
      flushSync()

      registry.registerItem(elements[0], { value: null })
      registry.registerItem(elements[1], { value: 'a' })
      flushSync()

      expect(registry.findByValue(null)).toBe(0)
      expect(calls).toBe(0)
    })

    cleanup()
  })

  it('focuses an item', () => {
    const { elements } = makeContainer(2)

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      registry.registerItem(elements[0], { value: 'a' })
      registry.registerItem(elements[1], { value: 'b' })
      flushSync()

      registry.focusItemElement(1)

      expect(document.activeElement).toBe(elements[1])
    })

    cleanup()
  })

  it('ignores focusItemElement for an out-of-range index', () => {
    const { elements } = makeContainer(1)

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults())
      flushSync()

      registry.registerItem(elements[0], { value: 'a' })
      flushSync()

      registry.focusItemElement(5)

      expect(registry.highlightedIndex).toBe(-1)
      expect(document.activeElement).not.toBe(elements[0])
    })

    cleanup()
  })

  it.skipIf(isJSDOM)('scrolls a focused item below the fold into the scroller', () => {
    const { container, elements } = makeContainer(2)
    container.style.cssText = 'overflow: auto; height: 100px'
    elements[0].style.cssText = 'display: block; height: 100px'
    elements[1].style.cssText = 'display: block; height: 100px'

    const cleanup = $effect.root(() => {
      const registry = new SelectItemRegistry(() => defaults({ scroller: container }))
      flushSync()

      registry.registerItem(elements[0], { value: 'a' })
      registry.registerItem(elements[1], { value: 'b' })
      flushSync()

      registry.focusItemElement(1)

      expect(container.scrollTop).toBeGreaterThan(0)
    })

    cleanup()
  })
})
