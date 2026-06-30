import { render, screen } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import BasicMeter from './fixtures/basic-meter.svelte'
import MeterValueSnippet from './fixtures/meter-value-snippet.svelte'

function formatPercent(value: number) {
  return value.toLocaleString(undefined, { style: 'percent' })
}

describe('<Meter.Value />', () => {
  it('renders a custom as element', () => {
    render(BasicMeter, { valueAs: 'p' })
    expect(screen.getByTestId('value').tagName.toLowerCase()).toBe('p')
  })

  describe('prop: children', () => {
    it('renders the value when children is not provided', () => {
      render(BasicMeter, { value: 30 })
      expect(screen.getByTestId('value').textContent).toBe(formatPercent(0.3))
    })

    it('renders a formatted value when a format is provided', () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }

      render(BasicMeter, { value: 30, format })

      expect(screen.getByTestId('value').textContent).toBe(
        new Intl.NumberFormat(undefined, format).format(30)
      )
    })

    it('accepts a children snippet', () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      const onRender = vi.fn()

      render(MeterValueSnippet, { value: 30, format, onRender })

      expect(onRender).toHaveBeenLastCalledWith(
        new Intl.NumberFormat(undefined, format).format(30),
        30
      )
    })

    it('passes updated arguments to the children snippet when value changes', async () => {
      const onRender = vi.fn()

      const { rerender } = render(MeterValueSnippet, { value: 30, onRender })
      expect(onRender).toHaveBeenLastCalledWith(formatPercent(0.3), 30)

      await rerender({ value: 60 })
      expect(onRender).toHaveBeenLastCalledWith(formatPercent(0.6), 60)
    })
  })
})
