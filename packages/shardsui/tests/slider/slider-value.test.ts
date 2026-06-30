import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicSlider from './fixtures/basic-slider.svelte'
import MultiThumbSlider from './fixtures/multi-thumb-slider.svelte'
import RangeSlider from './fixtures/range-slider.svelte'
import ValueSnippet from './fixtures/value-snippet.svelte'

describe('<Slider.Value />', () => {
  it('renders single value text', () => {
    render(BasicSlider, { value: 40 })
    expect(screen.getByTestId('value')).toHaveTextContent('40')
  })

  it('renders range values joined with an en dash', () => {
    render(RangeSlider, { value: [40, 65] })
    expect(screen.getByTestId('value')).toHaveTextContent('40 – 65')
  })

  it('associates the output with every thumb input', () => {
    render(RangeSlider, { value: [40, 65] })

    const thumbIds = screen.getAllByRole('slider').map((thumb) => thumb.id)

    expect(thumbIds).not.toContain('')
    expect(new Set(thumbIds).size).toBe(thumbIds.length)
    expect(screen.getByTestId('value')).toHaveAttribute('for', thumbIds.join(' '))
  })

  it('recomputes the formatted output when the format option changes', async () => {
    const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
    const { rerender } = render(BasicSlider, { value: 40 })

    expect(screen.getByTestId('value')).toHaveTextContent('40')

    await rerender({ value: 40, format })

    expect(screen.getByTestId('value')).toHaveTextContent(
      new Intl.NumberFormat(undefined, format).format(40)
    )
  })

  describe('multiple thumbs', () => {
    it('renders all thumb values joined with an en dash', () => {
      render(MultiThumbSlider, { value: [40, 60, 80, 95] })
      expect(screen.getByTestId('value')).toHaveTextContent('40 – 60 – 80 – 95')
    })
  })

  describe('prop: children, snippet', () => {
    it('accepts a children snippet receiving [formattedValues] and [rawValues]', () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      const fmt = (v: number) => new Intl.NumberFormat(undefined, format).format(v)
      render(ValueSnippet, { value: [40, 60], format })

      expect(JSON.parse(screen.getByTestId('formatted').textContent!)).toEqual([fmt(40), fmt(60)])
      expect(JSON.parse(screen.getByTestId('raw').textContent!)).toEqual([40, 60])
    })
  })
})
