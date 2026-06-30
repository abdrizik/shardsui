import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import ComboboxWithEmpty from './fixtures/combobox-with-empty.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

const LIVE_REGION_MARKER = '\u2060'

describe('<Combobox.Empty />', () => {
  it('renders when there are no filtered items', () => {
    render(ComboboxWithEmpty, { open: true, items: [] })

    expect(screen.getByTestId('empty')).toHaveTextContent('No results')
    expect(screen.getByTestId('empty')).toHaveAttribute('role', 'status')
  })

  it('does not render when there are items', () => {
    render(ComboboxWithEmpty, { open: true })

    expect(screen.getByTestId('empty')).not.toHaveTextContent('No results')
  })

  it('renders when the search query matches no items', async () => {
    const user = userEvent.setup()
    render(ComboboxWithEmpty, {})
    const input = screen.getByRole('combobox')

    await user.click(input)
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

    await user.type(input, 'zzzzz')

    await waitFor(() => {
      expect(screen.queryByRole('option')).not.toBeInTheDocument()
    })

    expect(screen.getByTestId('empty')).toHaveTextContent('No results')
  })

  it('does not render when the search query matches an item', async () => {
    const user = userEvent.setup()
    render(ComboboxWithEmpty, {})
    const input = screen.getByRole('combobox')

    await user.click(input)
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

    await user.type(input, 'app')
    await waitFor(() => expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument())

    expect(screen.getByTestId('empty')).not.toHaveTextContent('No results')
  })

  describe('a11y', () => {
    it('removes the live-region marker after the reset delay', () => {
      vi.useFakeTimers()
      try {
        render(ComboboxWithEmpty, { open: true, items: [] })
        const empty = screen.getByTestId('empty')
        expect(empty.textContent).toBe(`No results${LIVE_REGION_MARKER}`)

        vi.advanceTimersByTime(200)

        expect(empty.textContent).toBe('No results')
      } finally {
        vi.useRealTimers()
      }
    })

    it('updates the live region immediately when the empty content appears after mount', async () => {
      const { rerender } = render(ComboboxWithEmpty, { open: true, items: ['Apple'] })

      const empty = screen.getByTestId('empty')
      expect(empty.textContent).toBe('')
      expect(screen.getByRole('status')).toBe(empty)

      await rerender({ open: true, items: [] })

      await waitFor(() => expect(empty).toHaveTextContent('No results'))
    })

    it('preserves a custom element passed through as', () => {
      vi.useFakeTimers()
      try {
        render(ComboboxWithEmpty, { open: true, items: [], as: 'p' })
        const empty = screen.getByTestId('empty')

        expect(empty.tagName).toBe('P')
        expect(screen.getByRole('status')).toBe(empty)
        expect(empty.textContent).toBe(`No results${LIVE_REGION_MARKER}`)

        vi.advanceTimersByTime(200)

        expect(empty.textContent).toBe('No results')
      } finally {
        vi.useRealTimers()
      }
    })
  })
})
