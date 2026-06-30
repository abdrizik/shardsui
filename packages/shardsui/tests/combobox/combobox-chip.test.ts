import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import ChipsCombobox from './fixtures/chips-combobox.svelte'
import Chips from './fixtures/chips.svelte'
import R2ChipsHighlightCombobox from './fixtures/r2-chips-highlight-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.Chip />', () => {
  it('renders aria-disabled=true when root is disabled', () => {
    render(ChipsCombobox, { value: ['apple'], chips: ['apple'], disabled: true })
    const chip = screen.getByTestId('chip-apple')
    expect(chip).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders aria-readonly=true when root is readOnly', () => {
    render(ChipsCombobox, { value: ['apple'], chips: ['apple'], readOnly: true })
    const chip = screen.getByTestId('chip-apple')
    expect(chip).toHaveAttribute('aria-readonly', 'true')
  })

  it('removes chip via Backspace key when enabled', async () => {
    const onValueChange = vi.fn()
    render(ChipsCombobox, {
      value: ['apple', 'banana'],
      chips: ['apple', 'banana'],
      onValueChange
    })

    const chipApple = screen.getByTestId('chip-apple')
    chipApple.focus()
    fireEvent.keyDown(chipApple, { key: 'Backspace', code: 'Backspace' })

    await waitFor(() => {
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toEqual(['banana'])
    })
  })

  it('does not remove chip on Backspace when disabled', async () => {
    const onValueChange = vi.fn()
    render(ChipsCombobox, {
      value: ['apple', 'banana'],
      chips: ['apple', 'banana'],
      disabled: true,
      onValueChange
    })

    const chipApple = screen.getByTestId('chip-apple')
    chipApple.focus()
    fireEvent.keyDown(chipApple, { key: 'Backspace', code: 'Backspace' })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('does not remove chip on Backspace when readOnly', async () => {
    const onValueChange = vi.fn()
    render(ChipsCombobox, {
      value: ['apple', 'banana'],
      chips: ['apple', 'banana'],
      readOnly: true,
      onValueChange
    })

    const chipApple = screen.getByTestId('chip-apple')
    chipApple.focus()
    fireEvent.keyDown(chipApple, { key: 'Backspace', code: 'Backspace' })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('ArrowRight navigates to next chip', async () => {
    render(ChipsCombobox, {
      value: ['apple', 'banana'],
      chips: ['apple', 'banana']
    })

    const chipApple = screen.getByTestId('chip-apple')
    const chipBanana = screen.getByTestId('chip-banana')
    chipApple.focus()

    fireEvent.keyDown(chipApple, { key: 'ArrowRight', code: 'ArrowRight' })

    await waitFor(() => {
      expect(chipBanana).toHaveFocus()
    })
  })

  it('ArrowRight from last chip focuses the input', async () => {
    render(ChipsCombobox, {
      value: ['apple', 'banana'],
      chips: ['apple', 'banana']
    })

    const chipBanana = screen.getByTestId('chip-banana')
    const input = screen.getByTestId('input')
    chipBanana.focus()

    fireEvent.keyDown(chipBanana, { key: 'ArrowRight', code: 'ArrowRight' })

    await waitFor(() => {
      expect(input).toHaveFocus()
    })
  })

  it('ArrowLeft from first chip focuses the input', async () => {
    render(ChipsCombobox, {
      value: ['apple', 'banana'],
      chips: ['apple', 'banana']
    })

    const chipApple = screen.getByTestId('chip-apple')
    const input = screen.getByTestId('input')
    chipApple.focus()

    fireEvent.keyDown(chipApple, { key: 'ArrowLeft', code: 'ArrowLeft' })

    await waitFor(() => {
      expect(input).toHaveFocus()
    })
  })

  describe('prop: disabled', () => {
    it('prevents keyboard navigation when disabled', async () => {
      const user = userEvent.setup()
      render(Chips, { value: ['apple', 'banana'], disabled: true, withPopup: false })
      const chipApple = screen.getByTestId('chip-apple')
      chipApple.focus()
      await user.keyboard('{ArrowRight}')
      expect(chipApple).toHaveFocus()
    })

    it('prevents mouse interactions when disabled (does not focus input)', async () => {
      const user = userEvent.setup()
      render(Chips, { value: ['apple'], chips: ['apple'], disabled: true, withPopup: false })
      await user.click(screen.getByTestId('chip-apple'))
      expect(screen.getByTestId('input')).not.toHaveFocus()
    })

    it('prevents focus when disabled', async () => {
      const user = userEvent.setup()
      render(Chips, { value: ['apple'], chips: ['apple'], disabled: true, withPopup: false })
      const chip = screen.getByTestId('chip-apple')
      await user.click(chip)
      expect(chip).not.toHaveFocus()
    })
  })

  describe('prop: readOnly', () => {
    it('can receive focus when readOnly', async () => {
      const user = userEvent.setup()
      render(Chips, { value: ['apple'], chips: ['apple'], readOnly: true, withPopup: false })
      const chip = screen.getByTestId('chip-apple')
      await user.click(chip)
      expect(chip).toHaveFocus()
    })

    it('prevents navigation and deletion when readOnly', async () => {
      const user = userEvent.setup()
      render(Chips, { value: ['apple', 'banana'], readOnly: true, withPopup: false })
      const chipApple = screen.getByTestId('chip-apple')
      chipApple.focus()
      await user.keyboard('{ArrowRight}')
      expect(chipApple).toHaveFocus()
      await user.keyboard('{Delete}')
      expect(screen.getByTestId('chip-banana')).not.toBeNull()
    })
  })

  describe('interaction behavior', () => {
    it('closes the popup when a chip receives focus', async () => {
      const user = userEvent.setup()
      render(Chips, { value: ['apple', 'banana'], open: true })
      const input = screen.getByTestId('input')
      expect(screen.getByRole('listbox')).not.toBeNull()
      await user.click(input)
      screen.getByTestId('chip-apple').focus()
      await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
    })

    it('focuses input on mouse down when enabled', async () => {
      const user = userEvent.setup()
      render(Chips, { value: ['apple'], chips: ['apple'] })
      await user.click(screen.getByTestId('chip-apple'))
      expect(screen.getByTestId('input')).toHaveFocus()
    })

    it('returns focus to the input for activation, vertical navigation, and text entry', async () => {
      const user = userEvent.setup()
      render(Chips, { value: ['apple'], chips: ['apple'] })

      const chip = screen.getByTestId('chip-apple')
      const input = screen.getByTestId('input')

      chip.focus()
      await user.keyboard('{Enter}')
      expect(input).toHaveFocus()

      chip.focus()
      await user.keyboard(' ')
      expect(input).toHaveFocus()

      chip.focus()
      await user.keyboard('{ArrowDown}')
      expect(input).toHaveFocus()
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.keyboard('{Escape}')
      chip.focus()
      await user.keyboard('{ArrowUp}')
      expect(input).toHaveFocus()
      await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

      await user.keyboard('{Escape}')
      chip.focus()
      await user.keyboard('a')
      expect(input).toHaveFocus()
    })

    it('leaves focus on a chip for modified printable keys', async () => {
      const user = userEvent.setup()
      render(Chips, { value: ['apple'], chips: ['apple'], withPopup: false })

      const chip = screen.getByTestId('chip-apple')
      chip.focus()

      await user.keyboard('{Control>}a{/Control}')
      expect(chip).toHaveFocus()

      await user.keyboard('{Meta>}a{/Meta}')
      expect(chip).toHaveFocus()

      await user.keyboard('{Alt>}a{/Alt}')
      expect(chip).toHaveFocus()
    })

    it('handles Delete as a chip removal key', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(Chips, {
        value: ['apple', 'banana'],
        chips: ['apple', 'banana'],
        withPopup: false,
        onValueChange
      })

      screen.getByTestId('chip-apple').focus()
      await user.keyboard('{Delete}')

      expect(onValueChange).toHaveBeenCalledWith(['banana'])
    })

    it('mirrors chip keyboard navigation in RTL mode', async () => {
      const user = userEvent.setup()
      render(Chips, {
        value: ['apple', 'banana'],
        direction: 'rtl',
        inputFirst: false,
        withPopup: false
      })
      const chipApple = screen.getByTestId('chip-apple')
      const chipBanana = screen.getByTestId('chip-banana')
      const input = screen.getByTestId('input') as HTMLInputElement

      input.focus()
      input.setSelectionRange(0, 0)

      await user.keyboard('{ArrowRight}')
      expect(chipBanana).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expect(chipApple).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expect(input).toHaveFocus()

      chipApple.focus()
      await user.keyboard('{ArrowLeft}')
      expect(chipBanana).toHaveFocus()

      await user.keyboard('{ArrowLeft}')
      expect(input).toHaveFocus()
    })
  })

  describe('reordered chip list', () => {
    it('removes the chip that was clicked after a keyed reorder', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const props = { withRemove: true, withPopup: false, onValueChange }
      const { rerender } = render(Chips, {
        ...props,
        value: ['apple', 'banana'],
        chips: ['apple', 'banana']
      })

      await rerender({
        ...props,
        value: ['cherry', 'apple', 'banana'],
        chips: ['cherry', 'apple', 'banana']
      })

      expect(
        Array.from(screen.getByTestId('chips').querySelectorAll('[data-testid^="chip-"]')).map(
          (el) => el.getAttribute('data-testid')
        )
      ).toEqual(['chip-cherry', 'chip-apple', 'chip-banana'])

      await user.click(screen.getByTestId('remove-cherry'))
      expect(onValueChange).toHaveBeenCalledWith(['apple', 'banana'])
    })

    it('removes the chip that was clicked after two chips swap places', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      const props = { withRemove: true, withPopup: false, onValueChange }
      const { rerender } = render(Chips, {
        ...props,
        value: ['apple', 'banana'],
        chips: ['apple', 'banana']
      })

      await rerender({ ...props, value: ['banana', 'apple'], chips: ['banana', 'apple'] })

      await user.click(screen.getByTestId('remove-banana'))
      expect(onValueChange).toHaveBeenCalledWith(['apple'])
    })

    it('navigates to the adjacent chip after a keyed reorder', async () => {
      const user = userEvent.setup()
      const props = { withPopup: false }
      const { rerender } = render(Chips, {
        ...props,
        value: ['apple', 'banana'],
        chips: ['apple', 'banana']
      })

      await rerender({
        ...props,
        value: ['cherry', 'apple', 'banana'],
        chips: ['cherry', 'apple', 'banana']
      })

      screen.getByTestId('chip-cherry').focus()
      await user.keyboard('{ArrowRight}')
      expect(screen.getByTestId('chip-apple')).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expect(screen.getByTestId('chip-banana')).toHaveFocus()

      await user.keyboard('{ArrowLeft}')
      expect(screen.getByTestId('chip-apple')).toHaveFocus()
    })
  })

  describe('popup interaction', () => {
    it('does not dismiss the popup when clicking a chip', async () => {
      const user = userEvent.setup()
      render(ChipsCombobox, {
        open: true,
        value: ['apple', 'banana'],
        chips: ['apple', 'banana']
      })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      await user.click(screen.getByTestId('chip-apple'))

      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })
  })

  describe('navigation across unrendered values', () => {
    it('skips selected values that have no chip rendered for them', async () => {
      const user = userEvent.setup()
      render(Chips, {
        value: ['apple', 'banana', 'cherry'],
        chips: ['apple', 'banana'],
        withPopup: false
      })
      const chipBanana = screen.getByTestId('chip-banana')
      const input = screen.getByTestId('input') as HTMLInputElement

      input.focus()
      input.setSelectionRange(0, 0)

      await user.keyboard('{ArrowLeft}')
      expect(chipBanana).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expect(input).toHaveFocus()

      chipBanana.focus()

      await user.keyboard('{ArrowRight}')
      expect(input).toHaveFocus()
    })
  })

  it('drops the highlight when the highlighted chip is removed while filtering', async () => {
    const user = userEvent.setup()
    render(R2ChipsHighlightCombobox, { open: true, value: ['apple'], autoHighlight: true })

    const input = screen.getByTestId('input')

    await waitFor(() => expect(screen.getByRole('listbox')).not.toBeNull())

    await user.type(input, 'a')
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant'))

    await user.click(screen.getByTestId('remove-apple'))

    await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'))
  })

  it('drops the highlight when the chip for the highlighted item is removed', async () => {
    const user = userEvent.setup()
    render(R2ChipsHighlightCombobox, { open: true, value: ['apple', 'banana'] })

    const input = screen.getByTestId('input')
    const apple = screen.getByRole('option', { name: 'apple' })

    fireEvent.mouseMove(apple, { pointerType: 'mouse' })
    await waitFor(() => expect(input).toHaveAttribute('aria-activedescendant', apple.id))

    await user.click(screen.getByTestId('remove-apple'))

    await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'))
  })
})
