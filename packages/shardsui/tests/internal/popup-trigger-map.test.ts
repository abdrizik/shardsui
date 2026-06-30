import { PopupTriggerMap } from '$lib/internal/popup-trigger-map'
import { describe, expect, it } from 'vitest'

describe('PopupTriggerMap', () => {
  it('adds and retrieves elements by id', () => {
    const map = new PopupTriggerMap()
    const button = document.createElement('button')

    map.add('trigger', button)

    expect(map.getById('trigger')).toBe(button)
    expect(map.hasElement(button)).toBe(true)
    expect(map.containsNode(button)).toBe(true)
    expect(map.size).toBe(1)
  })

  it('replaces an existing element when the id is reused', () => {
    const map = new PopupTriggerMap()
    const first = document.createElement('button')
    const second = document.createElement('button')

    map.add('trigger', first)
    map.add('trigger', second)

    expect(map.getById('trigger')).toBe(second)
    expect(map.hasElement(first)).toBe(false)
    expect(map.hasElement(second)).toBe(true)
    expect(map.size).toBe(1)
  })

  it('deletes elements by id', () => {
    const map = new PopupTriggerMap()
    const button = document.createElement('button')

    map.add('trigger', button)
    map.delete('trigger')

    expect(map.getById('trigger')).toBeUndefined()
    expect(map.hasElement(button)).toBe(false)
    expect(map.containsNode(button)).toBe(false)
    expect(map.size).toBe(0)
  })

  it('does not duplicate when the same element is added twice with the same id', () => {
    const map = new PopupTriggerMap()
    const button = document.createElement('button')

    map.add('trigger', button)
    map.add('trigger', button)

    expect(map.getById('trigger')).toBe(button)
    expect(map.size).toBe(1)
  })

  it('throws when the same element is registered under multiple ids', () => {
    const map = new PopupTriggerMap()
    const button = document.createElement('button')

    map.add('first', button)
    expect(() => map.add('second', button)).toThrow(
      'ShardsUI: A trigger element cannot be registered under multiple IDs in PopupTriggerMap.'
    )
  })

  it('allows re-registering an element under a new id after it was deleted', () => {
    const map = new PopupTriggerMap()
    const button = document.createElement('button')

    map.add('first', button)
    map.delete('first')

    expect(() => map.add('second', button)).not.toThrow()
    expect(map.getById('second')).toBe(button)
    expect(map.size).toBe(1)
  })

  it('keeps an unrelated element claim when another id is deleted', () => {
    const map = new PopupTriggerMap()
    const first = document.createElement('button')
    const second = document.createElement('button')

    map.add('first', first)
    map.add('second', second)
    map.delete('second')

    expect(() => map.add('other', first)).toThrow(
      'ShardsUI: A trigger element cannot be registered under multiple IDs in PopupTriggerMap.'
    )
  })

  it('allows an element evicted by id reuse to register under a new id', () => {
    const map = new PopupTriggerMap()
    const first = document.createElement('button')
    const second = document.createElement('button')

    map.add('trigger', first)
    map.add('trigger', second)

    expect(() => map.add('other', first)).not.toThrow()
    expect(map.getById('other')).toBe(first)
    expect(map.getById('trigger')).toBe(second)
    expect(map.size).toBe(2)
  })

  it('removes its own registration through the returned disposer', () => {
    const map = new PopupTriggerMap<{ label: string }>()
    const button = document.createElement('button')

    const dispose = map.add('trigger', button, () => ({ label: 'a' }))
    dispose()

    expect(map.getById('trigger')).toBeUndefined()
    expect(map.hasElement(button)).toBe(false)
    expect(map.getTriggerBindingsById('trigger')).toBeUndefined()
    expect(map.size).toBe(0)
  })

  it('ignores a stale disposer after the id was re-registered with a new element', () => {
    const map = new PopupTriggerMap<{ label: string }>()
    const first = document.createElement('button')
    const second = document.createElement('button')

    const disposeFirst = map.add('trigger', first, () => ({ label: 'first' }))
    map.add('trigger', second, () => ({ label: 'second' }))
    disposeFirst()

    expect(map.getById('trigger')).toBe(second)
    expect(map.getTriggerBindingsById('trigger')).toEqual({ label: 'second' })
    expect(map.size).toBe(1)
  })

  it('keeps both registrations when two triggers swap ids and run their stale disposers', () => {
    const map = new PopupTriggerMap()
    const a = document.createElement('button')
    const b = document.createElement('button')

    const disposeAX = map.add('x', a)
    const disposeBY = map.add('y', b)
    disposeAX()
    map.add('y', a)
    disposeBY()
    map.add('x', b)

    expect(map.getById('y')).toBe(a)
    expect(map.getById('x')).toBe(b)
    expect(map.size).toBe(2)
  })

  it('still throws when a re-added element is registered under a second id', () => {
    const map = new PopupTriggerMap()
    const button = document.createElement('button')

    map.add('first', button)
    map.add('first', button)

    expect(() => map.add('second', button)).toThrow(
      'ShardsUI: A trigger element cannot be registered under multiple IDs in PopupTriggerMap.'
    )
  })
})
