import { render, screen, waitFor } from '@testing-library/svelte'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import DrawerSnapPointsCase from './fixtures/drawer-snap-points-case.svelte'

const STUBBED_HEIGHTS: Record<string, number> = { popup: 300, viewport: 400 }

function readOffset() {
  return screen.getByTestId('snap-point-probe').textContent
}

function readOffsetVar() {
  return screen.getByTestId('popup').style.getPropertyValue('--drawer-snap-point-offset')
}

describe('Drawer snap point composition', () => {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get(this: HTMLElement) {
        const testid = this.getAttribute('data-testid')
        return (testid && STUBBED_HEIGHTS[testid]) ?? original.get!.call(this)
      }
    })
  })

  afterEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original)
  })

  it('resolves supported units, filters invalid values, clamps heights, and keeps the last duplicate', async () => {
    const previousFontSize = document.documentElement.style.fontSize
    document.documentElement.style.fontSize = '20px'

    try {
      render(DrawerSnapPointsCase, {
        snapPoints: [
          Number.NaN,
          'invalid',
          'invalidpx',
          'invalidrem',
          -1,
          '2rem',
          '100px',
          200,
          200.5,
          800
        ],
        snapPoint: 200
      })

      await waitFor(() => expect(readOffset()).toBe('99.5'))
      expect(readOffsetVar()).toBe('99.5px')
    } finally {
      document.documentElement.style.fontSize = previousFontSize
    }
  })

  it('resolves rem against the root font size', async () => {
    const previousFontSize = document.documentElement.style.fontSize
    document.documentElement.style.fontSize = '20px'

    try {
      render(DrawerSnapPointsCase, { snapPoints: ['2rem', '100px'], snapPoint: '2rem' })

      await waitFor(() => expect(readOffset()).toBe('260'))
    } finally {
      document.documentElement.style.fontSize = previousFontSize
    }
  })

  it('uses fractional and pixel snap points and resolves null or invalid active values as closed', async () => {
    const { rerender } = render(DrawerSnapPointsCase, {
      snapPoints: [0.5, 200, '2rem'],
      snapPoint: 200
    })

    await waitFor(() => expect(readOffset()).toBe('100'))

    await rerender({ snapPoints: [0.5, 200, '2rem'], snapPoint: null })
    await waitFor(() => expect(readOffset()).toBe('null'))
    expect(readOffsetVar()).toBe('0px')

    await rerender({ snapPoints: [0.5, 200, '2rem'], snapPoint: 'invalid' })
    await waitFor(() => expect(readOffset()).toBe('null'))
  })

  it('produces no resolved snap point when the list is empty', async () => {
    render(DrawerSnapPointsCase, { snapPoints: [] })

    await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())
    expect(readOffset()).toBe('null')
  })

  it('resolves a single snap point without a deduplication pass', async () => {
    render(DrawerSnapPointsCase, { snapPoints: ['100px'], snapPoint: '100px' })

    await waitFor(() => expect(readOffset()).toBe('200'))
  })
})
