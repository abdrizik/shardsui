import { positionerStyle } from '$lib/internal/floating/positioner-style'
import { flushSync } from 'svelte'
import { expect, it } from 'vitest'

describe('positionerStyle', () => {
  it('applies every property from the record', () => {
    const el = document.createElement('div')
    const attach = positionerStyle(() => ({
      position: 'fixed',
      top: '0',
      left: '0',
      transform: 'translate(10px, 20px)'
    }))

    attach(el)

    expect(el.style.position).toBe('fixed')
    expect(el.style.top).toBe('0px')
    expect(el.style.left).toBe('0px')
    expect(el.style.transform).toBe('translate(10px, 20px)')
  })

  it('removes properties it managed once they leave the record', () => {
    const el = document.createElement('div')
    let styles = $state<Record<string, string>>({ position: 'fixed', top: '4px' })
    const attach = positionerStyle(() => styles)

    attach(el)
    expect(el.style.top).toBe('4px')

    styles = { position: 'fixed' }
    attach(el)

    expect(el.style.top).toBe('')
    expect(el.style.position).toBe('fixed')
  })

  it('reapplies when the tracked styles change inside an effect', () => {
    const cleanup = $effect.root(() => {
      const el = document.createElement('div')
      let side = $state('bottom')
      const attach = positionerStyle(() => ({
        position: 'absolute',
        ...(side === 'bottom' ? { top: '100%' } : { bottom: '100%' })
      }))

      $effect(() => attach(el))
      flushSync()

      expect(el.style.top).toBe('100%')
      expect(el.style.bottom).toBe('')

      side = 'top'
      flushSync()

      expect(el.style.top).toBe('')
      expect(el.style.bottom).toBe('100%')
    })

    cleanup()
  })
})
