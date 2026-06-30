import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicMeter from './fixtures/basic-meter.svelte'

function formatPercent(value: number) {
  return value.toLocaleString(undefined, { style: 'percent' })
}

describe('<Meter.Root />', () => {
  it('renders a custom as element', () => {
    render(BasicMeter, { rootAs: 'section' })
    expect(screen.getByRole('meter').tagName.toLowerCase()).toBe('section')
  })

  describe('ARIA attributes', () => {
    it('sets the correct aria attributes', () => {
      render(BasicMeter, { value: 30, label: 'Battery Level' })

      const meter = screen.getByRole('meter')

      expect(meter).toHaveAttribute('aria-valuenow', '30')
      expect(meter).toHaveAttribute('aria-valuemin', '0')
      expect(meter).toHaveAttribute('aria-valuemax', '100')
      expect(meter).toHaveAttribute('aria-valuetext', formatPercent(0.3))
      expect(meter.getAttribute('aria-labelledby')).toBe(
        screen.getByText('Battery Level').getAttribute('id')
      )
    })

    it('defaults aria-valuetext to the localized formatted value, matching Meter.Value', () => {
      // German percent formatting inserts a narrow no-break space before `%`.
      const expected = new Intl.NumberFormat('de-DE', { style: 'percent' }).format(0.3)

      render(BasicMeter, { value: 30, locale: 'de-DE' })

      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-valuetext', expected)
      expect(meter.getAttribute('aria-valuetext')).toBe(screen.getByTestId('value').textContent)
    })

    it('rounds the default aria-valuetext like the displayed value', () => {
      const expected = formatPercent(0.33333)

      render(BasicMeter, { value: 33.333 })

      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-valuetext', expected)
      expect(meter.getAttribute('aria-valuetext')).toBe(screen.getByTestId('value').textContent)
    })

    it('refreshes aria-valuenow, aria-valuetext, the value text, and the indicator when value changes', async () => {
      const fiftyPercent = formatPercent(0.5)
      const seventySevenPercent = formatPercent(0.77)

      const { rerender } = render(BasicMeter, { value: 50 })
      const meter = screen.getByRole('meter')
      const value = screen.getByTestId('value')
      const indicator = screen.getByTestId('indicator')

      expect(meter).toHaveAttribute('aria-valuenow', '50')
      expect(meter).toHaveAttribute('aria-valuetext', fiftyPercent)
      expect(value.textContent).toBe(fiftyPercent)
      expect(indicator.style.width).toBe('50%')

      await rerender({ value: 77 })

      expect(meter).toHaveAttribute('aria-valuenow', '77')
      expect(meter).toHaveAttribute('aria-valuetext', seventySevenPercent)
      expect(value.textContent).toBe(seventySevenPercent)
      expect(indicator.style.width).toBe('77%')
    })
  })

  describe('range', () => {
    it('formats the value as its position within a custom range and keeps the indicator in sync', () => {
      const expected = formatPercent(0.5)

      render(BasicMeter, { value: 0.5, min: 0, max: 1 })

      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-valuenow', '0.5')
      expect(meter).toHaveAttribute('aria-valuetext', expected)
      expect(screen.getByTestId('value').textContent).toBe(expected)
      expect(screen.getByTestId('indicator').style.width).toBe('50%')
    })

    it('formats the value relative to a non-zero min', () => {
      const expected = formatPercent(0.5)

      render(BasicMeter, { value: 30, min: 20, max: 40 })

      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', expected)
      expect(screen.getByTestId('value').textContent).toBe(expected)
    })

    it('keeps range attributes, formatted text, and the indicator synchronized on rerender', async () => {
      const initialValue = formatPercent(0.5)
      const updatedValue = formatPercent(0.75)

      const { rerender } = render(BasicMeter, { value: 20, min: 10, max: 30 })

      const meter = screen.getByRole('meter')
      const value = screen.getByTestId('value')
      const indicator = screen.getByTestId('indicator')

      expect(meter).toHaveAttribute('aria-valuemin', '10')
      expect(meter).toHaveAttribute('aria-valuemax', '30')
      expect(meter).toHaveAttribute('aria-valuenow', '20')
      expect(meter).toHaveAttribute('aria-valuetext', initialValue)
      expect(value).toHaveTextContent(initialValue)
      expect(indicator.style.width).toBe('50%')

      await rerender({ value: 50, min: 20, max: 60 })

      expect(meter).toHaveAttribute('aria-valuemin', '20')
      expect(meter).toHaveAttribute('aria-valuemax', '60')
      expect(meter).toHaveAttribute('aria-valuenow', '50')
      expect(meter).toHaveAttribute('aria-valuetext', updatedValue)
      expect(value).toHaveTextContent(updatedValue)
      expect(indicator.style.width).toBe('75%')
    })

    it.each([
      {
        label: 'value exceeds max',
        props: { value: 150 },
        ariaValueNow: '100',
        ariaValueText: formatPercent(1)
      },
      {
        label: 'value is below min',
        props: { value: -10 },
        ariaValueNow: '0',
        ariaValueText: formatPercent(0)
      },
      {
        label: 'min equals max',
        props: { value: 5, min: 5, max: 5 },
        ariaValueNow: '5',
        ariaValueText: formatPercent(0)
      },
      {
        label: 'value is NaN',
        props: { value: Number.NaN },
        ariaValueNow: '0',
        ariaValueText: formatPercent(0)
      }
    ])('normalizes aria attributes when $label', ({ props, ariaValueNow, ariaValueText }) => {
      render(BasicMeter, props)

      const meter = screen.getByRole('meter')
      expect(meter).toHaveAttribute('aria-valuenow', ariaValueNow)
      expect(meter).toHaveAttribute('aria-valuetext', ariaValueText)
    })
  })

  describe('prop: format', () => {
    it('formats the value', () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      const expected = new Intl.NumberFormat(undefined, format).format(30)

      render(BasicMeter, { value: 30, format })

      expect(screen.getByTestId('value').textContent).toBe(expected)
      expect(screen.getByRole('meter')).toHaveAttribute('aria-valuetext', expected)
    })

    it('formats the clamped value while clamping range attributes and indicator width', () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      const expected = new Intl.NumberFormat(undefined, format).format(100)
      render(BasicMeter, { value: 150, format })

      const meter = screen.getByRole('meter')
      expect(screen.getByTestId('value').textContent).toBe(expected)
      expect(meter).toHaveAttribute('aria-valuenow', '100')
      expect(meter).toHaveAttribute('aria-valuetext', expected)
      expect(screen.getByTestId('indicator').style.width).toBe('100%')
    })
  })

  describe('prop: locale', () => {
    it('sets the locale when formatting the value', () => {
      const format: Intl.NumberFormatOptions = {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
      const expected = new Intl.NumberFormat('de-DE', format).format(86.49)

      render(BasicMeter, { value: 86.49, format, locale: 'de-DE' })

      expect(screen.getByTestId('value').textContent).toBe(expected)
    })
  })
})
