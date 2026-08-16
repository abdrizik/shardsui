import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import type { PreventableEvent } from '$lib'
import ChipsCombobox from './fixtures/chips-combobox.svelte'
import ChipsPopupInputCombobox from './fixtures/chips-popup-input-combobox.svelte'
import Chips from './fixtures/chips.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.Chips />', () => {
  it('does not set role="toolbar" when there are no chips', () => {
    render(ChipsCombobox, { chips: [] })
    expect(screen.getByTestId('chips')).not.toHaveAttribute('role')
  })

  it('sets role="toolbar" when there is at least one chip', () => {
    render(ChipsCombobox, { value: ['apple'], chips: ['apple'] })
    expect(screen.getByTestId('chips')).toHaveAttribute('role', 'toolbar')
  })

  it('focuses the input when clicking anywhere in the Chips area', () => {
    render(ChipsCombobox, { value: ['apple'], chips: ['apple'] })
    const input = screen.getByTestId('input')

    expect(document.activeElement).not.toBe(input)
    fireEvent.mouseDown(screen.getByTestId('chips'))
    expect(input).toHaveFocus()

    input.blur()
    expect(document.activeElement).not.toBe(input)
    fireEvent.mouseDown(screen.getByTestId('chip-apple'))
    expect(input).toHaveFocus()
  })

  it('lets onMouseDown prevent the built-in focus and open behavior', () => {
    const handleMouseDown = vi.fn((event: MouseEvent & PreventableEvent) => {
      event.preventShardsUIHandler()
    })
    render(Chips, { value: ['apple'], chips: ['apple'], onChipsMouseDown: handleMouseDown })

    fireEvent.mouseDown(screen.getByTestId('chips'))

    expect(handleMouseDown).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('input')).not.toHaveFocus()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('does not focus or open when readOnly', () => {
    render(ChipsCombobox, { value: ['apple'], chips: ['apple'], readOnly: true })

    fireEvent.mouseDown(screen.getByTestId('chips'))

    expect(screen.getByTestId('input')).not.toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not treat chip remove presses as chips-area presses', () => {
    render(Chips, { value: ['apple'], chips: ['apple'], withRemove: true })

    fireEvent.mouseDown(screen.getByTestId('remove-apple'))

    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('does not focus or open when disabled by Field.Root', () => {
    render(Chips, { value: ['apple'], chips: ['apple'], withField: true })

    fireEvent.mouseDown(screen.getByTestId('chips'))

    expect(screen.getByTestId('input')).not.toHaveFocus()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('opens and focuses an input rendered inside the popup when the chips area is pressed', async () => {
    const user = userEvent.setup()
    render(ChipsPopupInputCombobox)

    await user.click(screen.getByTestId('chips'))

    expect(await screen.findByRole('dialog')).not.toBeNull()
    await waitFor(() => expect(screen.getByTestId('input')).toHaveFocus())
  })

  it('clears the highlighted chip when the popup opens', async () => {
    const user = userEvent.setup()
    render(Chips, { value: ['apple'], chips: ['apple'] })

    const input = screen.getByTestId('input') as HTMLInputElement
    input.focus()
    input.setSelectionRange(0, 0)
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByTestId('chip-apple')).toHaveFocus()

    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

    input.focus()
    input.setSelectionRange(0, 0)
    await user.keyboard('{ArrowLeft}')
    expect(screen.getByTestId('chip-apple')).toHaveFocus()
  })
})
