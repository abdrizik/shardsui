import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import ComboboxWithStatus from './fixtures/combobox-with-status.svelte'
import StatusRenderCombobox from './fixtures/status-render-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

const LIVE_REGION_MARKER = '\u2060'

describe('<Combobox.Status />', () => {
  it('renders only when open', async () => {
    const user = userEvent.setup()
    render(ComboboxWithStatus, {})

    expect(screen.queryByTestId('status')).not.toBeInTheDocument()

    await user.click(screen.getByTestId('input'))
    await waitFor(() => expect(screen.getByTestId('status')).toBeInTheDocument())
  })

  describe('a11y', () => {
    it('removes the live-region marker after the reset delay', () => {
      vi.useFakeTimers()
      try {
        render(ComboboxWithStatus, { open: true, statusText: 'Searching…' })
        const status = screen.getByTestId('status')
        expect(screen.getByRole('status')).toBe(status)
        expect(status.textContent).toBe(`Searching…${LIVE_REGION_MARKER}`)

        vi.advanceTimersByTime(200)

        expect(status.textContent).toBe('Searching…')
      } finally {
        vi.useRealTimers()
      }
    })

    it('updates content immediately after the live region has mounted', async () => {
      const { rerender } = render(StatusRenderCombobox, { open: true, statusText: '' })
      const status = screen.getByTestId('status')
      expect(status).toHaveTextContent('')

      await rerender({ open: true, statusText: 'Searching…' })
      expect(status).toHaveTextContent('Searching…')
    })

    it('preserves a custom element passed through as', () => {
      vi.useFakeTimers()
      try {
        render(StatusRenderCombobox, { open: true, statusText: 'Searching…', as: 'p' })
        const status = screen.getByTestId('status')
        expect(status.tagName).toBe('P')
        expect(screen.getByRole('status')).toBe(status)
        expect(status.textContent).toBe(`Searching…${LIVE_REGION_MARKER}`)

        vi.advanceTimersByTime(200)
        expect(status.textContent).toBe('Searching…')
      } finally {
        vi.useRealTimers()
      }
    })

    it('restores the marker before unmounting during the reset delay', () => {
      vi.useFakeTimers()
      try {
        const { unmount } = render(StatusRenderCombobox, { open: true, statusText: 'Searching…' })
        const status = screen.getByTestId('status')
        expect(status.textContent).toBe(`Searching…${LIVE_REGION_MARKER}`)

        unmount()
        expect(status.textContent).toBe('Searching…')
      } finally {
        vi.useRealTimers()
      }
    })
  })
})
