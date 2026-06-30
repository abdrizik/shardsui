import { render, screen } from '@testing-library/svelte'
import { afterEach, expect, vi } from 'vitest'
import ComboboxWithStatus from './fixtures/combobox-with-status.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return { ...actual, isIOS: true }
})

afterEach(() => {
  vi.useRealTimers()
})

describe('<Combobox.Status /> iOS', () => {
  it('never appends the live-region marker', () => {
    vi.useFakeTimers()
    render(ComboboxWithStatus, { open: true, statusText: 'Searching…' })

    const status = screen.getByTestId('status')
    expect(screen.getByRole('status')).toBe(status)
    expect(status.textContent).toBe('Searching…')

    vi.advanceTimersByTime(200)

    expect(status.textContent).toBe('Searching…')
  })
})
