import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import InputGroupChips from './fixtures/input-group-chips.svelte'
import InputGroupCombobox from './fixtures/input-group-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.InputGroup />', () => {
  it('has role="group"', () => {
    render(InputGroupCombobox, {})
    expect(screen.getByTestId('group')).toHaveAttribute('role', 'group')
  })

  it('does not dismiss the popup when clicking inside the input group', async () => {
    const user = userEvent.setup()
    render(InputGroupChips, { value: ['a'], open: true })

    expect(await screen.findByRole('listbox')).not.toBeNull()
    await user.click(screen.getByTestId('group'))
    expect(screen.queryByRole('listbox')).not.toBeNull()
  })

  it('focuses the input and opens when clicking the group padding around chips', async () => {
    render(InputGroupChips, { value: ['a'] })
    const input = screen.getByTestId('input')

    fireEvent.mouseDown(screen.getByTestId('group'))

    expect(input).toHaveFocus()
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeNull())
  })

  it('does not handle chip presses a second time when chips are nested inside the input group', () => {
    const onOpenChange = vi.fn()
    render(InputGroupChips, { value: ['a'], onOpenChange })

    fireEvent.mouseDown(screen.getByTestId('chip'))

    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })

  it('focuses the input without opening when openOnInputClick is false', () => {
    render(InputGroupCombobox, { openOnInputClick: false })
    const input = screen.getByTestId('input')

    fireEvent.mouseDown(screen.getByTestId('pad'))

    expect(input).toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not focus or open when disabled by Field.Root', () => {
    render(InputGroupCombobox, { withField: true, fieldDisabled: true })
    const input = screen.getByTestId('input')

    fireEvent.mouseDown(screen.getByTestId('group'))

    expect(input).not.toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('does not focus or open when readOnly', () => {
    render(InputGroupCombobox, { readOnly: true })
    const input = screen.getByTestId('input')

    fireEvent.mouseDown(screen.getByTestId('pad'))

    expect(input).not.toHaveFocus()
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
