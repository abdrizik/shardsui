import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import BasicCombobox from './fixtures/basic-combobox.svelte'
import PopupFinalFocusCombobox from './fixtures/popup-final-focus-combobox.svelte'
import PopupInitialFocusCombobox from './fixtures/popup-initial-focus-combobox.svelte'
import TriggerCombobox from './fixtures/trigger-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.Popup />', () => {
  it('has data-open when open', () => {
    render(BasicCombobox, { open: true })
    expect(screen.getByTestId('popup')).toHaveAttribute('data-open')
  })

  it('sets role to presentation when input renders outside the popup', async () => {
    render(BasicCombobox, { open: true })
    await waitFor(() => {
      expect(screen.getByTestId('popup')).toHaveAttribute('role', 'presentation')
    })
  })

  it('sets role to dialog when input renders inside the popup', async () => {
    render(TriggerCombobox, { open: true, inputInsidePopup: true })
    const popup = await screen.findByTestId('popup')
    await waitFor(() => expect(popup).toHaveAttribute('role', 'dialog'))
  })

  it('focuses the popup instead of its input when opened by touch', async () => {
    render(PopupInitialFocusCombobox, { initialFocus: undefined })

    const trigger = screen.getByTestId('trigger')
    await fireEvent.pointerDown(trigger, { pointerType: 'touch' })
    await fireEvent.mouseDown(trigger)
    await fireEvent.click(trigger, { detail: 1 })

    await waitFor(() => expect(screen.getByTestId('popup')).toHaveFocus())
    expect(screen.getByTestId('input')).not.toHaveFocus()
  })

  it('honors initialFocus={false}', async () => {
    render(PopupInitialFocusCombobox, { initialFocus: false })

    const trigger = screen.getByTestId('trigger')
    trigger.focus()
    fireEvent.click(trigger)

    await screen.findByTestId('input')
    expect(trigger).toHaveFocus()
  })

  it('returns focus to an explicitly provided element when the popup closes', async () => {
    const user = userEvent.setup()
    render(PopupFinalFocusCombobox, {})

    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.getByRole('button', { name: 'final focus' })).toHaveFocus())
  })
})
