import { render, screen } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import BasicProgress from './fixtures/basic-progress.svelte'
import ProgressValueSnippet from './fixtures/progress-value-snippet.svelte'

describe('<Progress.Value />', () => {
  describe('prop: children', () => {
    it('renders the value when children is not provided', () => {
      render(BasicProgress, { value: 30 })
      const expected = (0.3).toLocaleString(undefined, { style: 'percent' })
      expect(screen.getByTestId('value')).toHaveTextContent(expected)
    })

    it('renders a formatted value when a format is provided', () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      render(BasicProgress, { value: 30, format })
      const expected = new Intl.NumberFormat(undefined, format).format(30)
      expect(screen.getByTestId('value')).toHaveTextContent(expected)
    })

    describe('it accepts a children snippet', () => {
      it('numerical value', () => {
        const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
        const spy = vi.fn()
        render(ProgressValueSnippet, { value: 30, format, onRender: spy })
        expect(spy).toHaveBeenLastCalledWith(
          new Intl.NumberFormat(undefined, format).format(30),
          30
        )
      })

      it.each([null, Number.NaN])('indeterminate value %s', (value) => {
        const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
        const spy = vi.fn()
        render(ProgressValueSnippet, { value, format, onRender: spy })
        expect(spy).toHaveBeenLastCalledWith('indeterminate', value)
      })
    })
  })
})
