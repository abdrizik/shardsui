import { render, screen, waitFor } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AnchorWidthCombobox from './fixtures/anchor-width-combobox.svelte'
import ArrowOutsidePositioner from './fixtures/arrow-outside-positioner.svelte'
import CappedHeightCombobox from './fixtures/capped-height-combobox.svelte'
import MultipleCombobox from './fixtures/multiple-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.Positioner />', () => {
  it('throws a descriptive error when a required consumer is outside the positioner', () => {
    expect(() => render(ArrowOutsidePositioner)).toThrow(
      'ShardsUI: this part must be rendered inside <Combobox.Positioner>.'
    )
  })

  it('leaves the document scrollable while a controlled empty multi-select stays closed', async () => {
    document.body.removeAttribute('style')
    document.documentElement.removeAttribute('style')

    render(MultipleCombobox, { value: [] })

    await waitFor(() => expect(screen.getByRole('combobox')).toBeInTheDocument())

    expect(document.body.style.overflowX).not.toBe('hidden')
    expect(document.body.style.overflowY).not.toBe('hidden')
    expect(document.documentElement.style.overflowX).not.toBe('hidden')
    expect(document.documentElement.style.overflowY).not.toBe('hidden')
  })

  it.skipIf(isJSDOM)('stays on the preferred side when the capped list fits below', async () => {
    render(CappedHeightCombobox, {})

    await waitFor(() => {
      expect(screen.getByTestId('positioner')).toHaveAttribute('data-side', 'bottom')
    })
  })

  describe.skipIf(isJSDOM)('default anchor', () => {
    it('measures the input when no input group is rendered', async () => {
      const inputWidth = 120
      const triggerWidth = 240
      let anchorWidth = 0

      render(AnchorWidthCombobox, {
        inputWidth,
        triggerWidth,
        onAnchorWidth: (width: number) => (anchorWidth = width)
      })

      const input = screen.getByTestId('input')

      await waitFor(() => {
        expect(anchorWidth).toBeCloseTo(input.getBoundingClientRect().width, 0)
      })
      expect(anchorWidth).not.toBeCloseTo(triggerWidth, 0)
    })

    it('measures the input group when one is rendered', async () => {
      const inputGroupWidth = 240
      let anchorWidth = 0

      render(AnchorWidthCombobox, {
        withInputGroup: true,
        inputGroupWidth,
        inputWidth: 120,
        onAnchorWidth: (width: number) => (anchorWidth = width)
      })

      await waitFor(() => {
        expect(anchorWidth).toBeCloseTo(inputGroupWidth, 0)
      })
    })
  })
})
