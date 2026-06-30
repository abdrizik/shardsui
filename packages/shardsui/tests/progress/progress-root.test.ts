import { Progress } from '$lib/components/progress'
import { render, screen } from '@testing-library/svelte'
import { expect } from 'vitest'
import BasicProgress from './fixtures/basic-progress.svelte'

function formatPercent(value: number) {
  return value.toLocaleString(undefined, { style: 'percent' })
}

describe('<Progress.Root />', () => {
  it('prop: as renders a custom element', () => {
    const { container } = render(Progress.Root, { value: 50, as: 'section' })
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('section')
  })

  describe('ARIA attributes', () => {
    it('sets the correct aria attributes', () => {
      render(BasicProgress, { value: 30, labelText: 'Downloading' })

      const progressbar = screen.getByRole('progressbar')
      const label = screen.getByText('Downloading')

      expect(progressbar).toHaveAttribute('aria-valuenow', '30')
      expect(progressbar).toHaveAttribute('aria-valuemin', '0')
      expect(progressbar).toHaveAttribute('aria-valuemax', '100')
      expect(progressbar).toHaveAttribute(
        'aria-valuetext',
        (0.3).toLocaleString(undefined, { style: 'percent' })
      )
      expect(progressbar.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'))
    })

    it('should update aria-valuenow when value changes', async () => {
      const { rerender } = render(BasicProgress, { value: 50 })
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50')

      await rerender({ value: 77 })
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '77')
    })
  })

  describe('data attributes', () => {
    it('keeps every composed part synchronized through the status cycle', async () => {
      const { rerender } = render(BasicProgress, { value: null, labelText: 'Downloading' })

      const progressbar = screen.getByRole('progressbar')
      const value = screen.getByTestId('value')
      const indicator = screen.getByTestId('indicator')
      const parts = [
        progressbar,
        screen.getByTestId('label'),
        value,
        screen.getByTestId('track'),
        indicator
      ]

      for (const part of parts) {
        expect(part).toHaveAttribute('data-indeterminate')
        expect(part).not.toHaveAttribute('data-progressing')
        expect(part).not.toHaveAttribute('data-complete')
      }
      expect(progressbar).not.toHaveAttribute('aria-valuenow')
      expect(progressbar).toHaveAttribute('aria-valuetext', 'indeterminate progress')
      expect(value.textContent).toBe('')
      expect(indicator.style.width).toBe('')

      await rerender({ value: 50 })
      for (const part of parts) {
        expect(part).not.toHaveAttribute('data-indeterminate')
        expect(part).toHaveAttribute('data-progressing')
        expect(part).not.toHaveAttribute('data-complete')
      }
      expect(progressbar).toHaveAttribute('aria-valuenow', '50')
      expect(value.textContent).toBe(formatPercent(0.5))
      expect(indicator.style.width).toBe('50%')

      await rerender({ value: 100 })
      for (const part of parts) {
        expect(part).not.toHaveAttribute('data-indeterminate')
        expect(part).not.toHaveAttribute('data-progressing')
        expect(part).toHaveAttribute('data-complete')
      }
      expect(progressbar).toHaveAttribute('aria-valuenow', '100')
      expect(value.textContent).toBe(formatPercent(1))
      expect(indicator.style.width).toBe('100%')

      await rerender({ value: null })
      for (const part of parts) {
        expect(part).toHaveAttribute('data-indeterminate')
        expect(part).not.toHaveAttribute('data-progressing')
        expect(part).not.toHaveAttribute('data-complete')
      }
      expect(progressbar).not.toHaveAttribute('aria-valuenow')
      expect(progressbar).toHaveAttribute('aria-valuetext', 'indeterminate progress')
      expect(value.textContent).toBe('')
      expect(indicator.style.width).toBe('')
    })
  })

  describe('range', () => {
    it('normalizes the formatted value, aria-valuetext, and indicator within a custom range', () => {
      const expected = formatPercent(0.5)

      render(BasicProgress, { value: 30, min: 20, max: 40 })

      expect(screen.getByTestId('indicator').style.width).toBe('50%')
      expect(screen.getByTestId('value').textContent).toBe(expected)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', expected)
    })

    it('clamps aria-valuenow, the value text, and the indicator when the value overshoots max', () => {
      const expected = formatPercent(1)

      render(BasicProgress, { value: 50, min: 0, max: 40 })

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '40')
      expect(progressbar).toHaveAttribute('aria-valuemax', '40')
      expect(progressbar).toHaveAttribute('aria-valuetext', expected)
      expect(screen.getByTestId('value').textContent).toBe(expected)
      expect(screen.getByTestId('indicator').style.width).toBe('100%')
    })

    it('clamps aria-valuenow, the value text, and the indicator when the value undershoots min', () => {
      const expected = formatPercent(0)

      render(BasicProgress, { value: 10, min: 20, max: 40 })

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '20')
      expect(progressbar).toHaveAttribute('aria-valuemin', '20')
      expect(progressbar).toHaveAttribute('aria-valuetext', expected)
      expect(screen.getByTestId('value').textContent).toBe(expected)
      expect(screen.getByTestId('indicator').style.width).toBe('0%')
    })

    it.each([
      { value: 50, expectedValue: 40 },
      { value: 10, expectedValue: 20 }
    ])(
      'formats the clamped value $expectedValue when a custom-formatted value $value is outside the range',
      ({ value, expectedValue }) => {
        const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
        const expected = new Intl.NumberFormat(undefined, format).format(expectedValue)
        render(BasicProgress, { value, min: 20, max: 40, format })

        const progressbar = screen.getByRole('progressbar')
        expect(progressbar).toHaveAttribute('aria-valuenow', String(expectedValue))
        expect(screen.getByTestId('value')).toHaveTextContent(expected)
        expect(progressbar).toHaveAttribute('aria-valuetext', expected)
      }
    )

    it('reports complete when the value reaches or exceeds max', () => {
      render(BasicProgress, { value: 45, min: 0, max: 40 })
      expect(screen.getByRole('progressbar')).toHaveAttribute('data-complete')
    })

    it('normalizes aria attributes when min equals max', () => {
      const expected = formatPercent(0)

      render(BasicProgress, { value: 5, min: 5, max: 5 })

      const progressbar = screen.getByRole('progressbar')
      expect(progressbar).toHaveAttribute('aria-valuenow', '5')
      expect(progressbar).toHaveAttribute('aria-valuetext', expected)
      expect(screen.getByTestId('value').textContent).toBe(expected)
      expect(screen.getByTestId('indicator').style.width).toBe('0%')
    })

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
      'keeps non-finite value %s indeterminate',
      (value) => {
        render(BasicProgress, { value })

        const progressbar = screen.getByRole('progressbar')
        expect(progressbar).toHaveAttribute('data-indeterminate')
        expect(progressbar).not.toHaveAttribute('aria-valuenow')
        expect(progressbar).toHaveAttribute('aria-valuetext', 'indeterminate progress')
        expect(screen.getByTestId('value').textContent).toBe('')
        expect(screen.getByTestId('indicator').style.width).toBe('')
      }
    )
  })

  describe('prop: format', () => {
    it('formats the value', () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      const expected = new Intl.NumberFormat(undefined, format).format(30)

      render(BasicProgress, { value: 30, format })

      expect(screen.getByTestId('value')).toHaveTextContent(expected)
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', expected)
    })

    it('reflects format changes', async () => {
      const usd: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      const eur: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR' }
      const formatValue = (value: number, options: Intl.NumberFormatOptions) =>
        new Intl.NumberFormat(undefined, options).format(value)

      const { rerender } = render(BasicProgress, { value: 30, format: usd })

      const value = screen.getByTestId('value')
      expect(value.textContent).toBe(formatValue(30, usd))

      await rerender({ format: eur })
      expect(value.textContent).toBe(formatValue(30, eur))
    })
  })

  describe('prop: locale', () => {
    it('sets the locale when formatting the value', () => {
      const format: Intl.NumberFormatOptions = {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
      const expected = new Intl.NumberFormat('de-DE', format).format(70.51)

      render(BasicProgress, { value: 70.51, format, locale: 'de-DE' })

      expect(screen.getByTestId('value')).toHaveTextContent(expected)
    })
  })
})
