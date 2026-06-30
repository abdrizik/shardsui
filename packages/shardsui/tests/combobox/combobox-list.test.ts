import { act, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import BasicCombobox from './fixtures/basic-combobox.svelte'
import MultipleCombobox from './fixtures/multiple-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

async function dispatchEnter(list: HTMLElement) {
  const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
  await act(() => {
    list.dispatchEvent(event)
  })
  return event
}

describe('<Combobox.List />', () => {
  it('sets role=listbox and aria-multiselectable in multiple mode', async () => {
    render(MultipleCombobox, { open: true })
    await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
  })

  it('does not prevent Enter when no item is highlighted', async () => {
    render(BasicCombobox, { open: true })

    const event = await dispatchEnter(await screen.findByRole('listbox'))

    expect(event.defaultPrevented).toBe(false)
  })

  it('selects the highlighted item with Enter', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(BasicCombobox, { open: true, onValueChange })

    await user.click(screen.getByRole('combobox'))
    await user.keyboard('{ArrowDown}')

    await dispatchEnter(screen.getByRole('listbox'))

    expect(onValueChange).toHaveBeenCalledWith('apple')
  })

  it.each([{ disabled: true }, { readOnly: true }])(
    'ignores Enter when interaction is disabled: %o',
    async (rootProps) => {
      const onValueChange = vi.fn()
      render(BasicCombobox, { open: true, onValueChange, ...rootProps })

      await dispatchEnter(await screen.findByRole('listbox'))

      expect(onValueChange).not.toHaveBeenCalled()
    }
  )
})
