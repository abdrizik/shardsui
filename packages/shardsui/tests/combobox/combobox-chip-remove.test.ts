import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import ChipClickCombobox from './fixtures/chip-click-combobox.svelte'
import ChipRemoveOutsideChip from './fixtures/chip-remove-outside-chip.svelte'
import ChipsCombobox from './fixtures/chips-combobox.svelte'
import ChipsPopupInputCombobox from './fixtures/chips-popup-input-combobox.svelte'
import R2ChipsHighlightCombobox from './fixtures/r2-chips-highlight-combobox.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return {
    ...actual,
    isIOS: false
  }
})

describe('<Combobox.ChipRemove />', () => {
  it('throws a descriptive error when rendered outside <Combobox.Chip>', () => {
    expect(() => render(ChipRemoveOutsideChip)).toThrow(
      'ShardsUI: this part must be rendered inside <Combobox.Chip>.'
    )
  })

  describe('prop: disabled', () => {
    it('renders aria-disabled=true when the root is disabled', () => {
      render(ChipsCombobox, { value: ['apple'], chips: ['apple'], disabled: true })

      expect(screen.getByTestId('remove-apple')).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not remove the chip when the root is disabled', () => {
      const onValueChange = vi.fn()
      render(ChipsCombobox, {
        value: ['apple', 'banana'],
        chips: ['apple', 'banana'],
        disabled: true,
        onValueChange
      })

      fireEvent.click(screen.getByTestId('remove-apple'))

      expect(onValueChange).not.toHaveBeenCalled()
    })
  })

  describe('prop: readOnly', () => {
    it('does not remove the chip when the root is readOnly', () => {
      const onValueChange = vi.fn()
      render(ChipsCombobox, {
        value: ['apple', 'banana'],
        chips: ['apple', 'banana'],
        readOnly: true,
        onValueChange
      })

      fireEvent.click(screen.getByTestId('remove-apple'))

      expect(onValueChange).not.toHaveBeenCalled()
    })

    it('stays focusable but inert when readOnly', async () => {
      const user = userEvent.setup()
      render(ChipsCombobox, { value: ['apple'], chips: ['apple'], readOnly: true })

      const remove = screen.getByTestId('remove-apple')

      remove.focus()
      expect(remove).toHaveFocus()

      await user.keyboard('{Enter}')
      expect(screen.getByTestId('remove-apple')).not.toBeNull()
    })
  })

  describe('interaction behavior', () => {
    it('removes the chip value on click', async () => {
      const onValueChange = vi.fn()
      render(ChipsCombobox, {
        value: ['apple', 'banana'],
        chips: ['apple', 'banana'],
        onValueChange
      })

      fireEvent.click(screen.getByTestId('remove-apple'))

      await waitFor(() => {
        expect(onValueChange).toHaveBeenCalledTimes(1)
        expect(onValueChange.mock.calls[0][0]).toEqual(['banana'])
      })
    })

    it('focuses the input after removing a chip', async () => {
      render(ChipsCombobox, { value: ['apple'], chips: ['apple'] })

      fireEvent.click(screen.getByTestId('remove-apple'))

      await waitFor(() => expect(screen.getByTestId('input')).toHaveFocus())
    })

    it('keeps the popup open while removing a chip', async () => {
      const onValueChange = vi.fn()
      render(ChipsCombobox, {
        open: true,
        value: ['apple', 'banana'],
        chips: ['apple', 'banana'],
        onValueChange
      })
      await waitFor(() => expect(screen.getByRole('listbox')).toBeInTheDocument())

      fireEvent.click(screen.getByTestId('remove-apple'))

      await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1))
      expect(screen.getByRole('listbox')).toBeInTheDocument()
    })

    it('fires its own onClick but does not bubble to the parent Chip onClick', async () => {
      const handleChipClick = vi.fn()
      const handleRemoveClick = vi.fn()
      const user = userEvent.setup()
      render(ChipClickCombobox, {
        value: ['apple'],
        onChipClick: handleChipClick,
        onRemoveClick: handleRemoveClick
      })

      await user.click(screen.getByTestId('remove'))

      expect(handleRemoveClick).toHaveBeenCalledTimes(1)
      expect(handleChipClick).not.toHaveBeenCalled()
    })

    it('removes the chip on Enter while focused', async () => {
      const onValueChange = vi.fn()
      render(ChipsCombobox, {
        value: ['apple', 'banana'],
        chips: ['apple', 'banana'],
        onValueChange
      })

      const remove = screen.getByTestId('remove-apple')
      remove.focus()
      fireEvent.keyDown(remove, { key: 'Enter', code: 'Enter' })

      await waitFor(() => {
        expect(onValueChange).toHaveBeenCalledTimes(1)
        expect(onValueChange.mock.calls[0][0]).toEqual(['banana'])
      })
    })

    it('keeps a popup input focused when removing a chip rendered outside the popup', async () => {
      const user = userEvent.setup()
      render(ChipsPopupInputCombobox)

      await user.click(screen.getByTestId('trigger'))
      const input = await screen.findByTestId('input')
      await waitFor(() => expect(input).toHaveFocus())

      await user.click(screen.getByTestId('remove-apple'))

      expect(screen.queryByTestId('remove-apple')).toBeNull()
      expect(screen.getByRole('dialog')).not.toBeNull()
      expect(input).toHaveFocus()
      expect(screen.getByRole('option', { name: 'apple' })).toHaveAttribute(
        'aria-selected',
        'false'
      )
    })

    it.each([{ disabled: true }, { readOnly: true }])(
      'ignores click and keyboard activation on a non-native button: %o',
      (rootProps) => {
        const onValueChange = vi.fn()
        render(ChipsCombobox, {
          value: ['apple'],
          chips: ['apple'],
          removeAs: 'div',
          onValueChange,
          ...rootProps
        })

        const remove = screen.getByTestId('remove-apple')
        remove.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
        remove.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
        )

        expect(onValueChange).not.toHaveBeenCalled()
      }
    )

    it('records pointer-origin removal when clearing the highlighted item', async () => {
      const user = userEvent.setup()
      render(R2ChipsHighlightCombobox, { open: true, value: ['apple'], items: ['apple'] })

      const apple = screen.getByRole('option', { name: 'apple' })
      fireEvent.mouseMove(apple)
      await waitFor(() => expect(apple).toHaveAttribute('data-highlighted'))

      await user.click(screen.getByTestId('remove-apple'))

      expect(screen.getByRole('option', { name: 'apple' })).not.toHaveAttribute('data-highlighted')
    })

    it('removes the chip with Space and ignores unrelated keys', () => {
      const onValueChange = vi.fn()
      render(ChipsCombobox, {
        value: ['apple', 'banana'],
        chips: ['apple', 'banana'],
        onValueChange
      })

      const remove = screen.getByTestId('remove-apple')
      remove.focus()

      fireEvent.keyDown(remove, { key: 'ArrowDown' })
      expect(onValueChange).not.toHaveBeenCalled()

      fireEvent.keyDown(remove, { key: ' ' })
      expect(onValueChange).toHaveBeenCalledWith(['banana'])
    })

    it('keeps a different active item highlighted when removing a chip', async () => {
      render(R2ChipsHighlightCombobox, { open: true, value: ['apple', 'banana'] })

      const apple = screen.getByRole('option', { name: 'apple' })
      fireEvent.mouseMove(apple)
      await waitFor(() => expect(apple).toHaveAttribute('data-highlighted'))

      fireEvent.click(screen.getByTestId('remove-banana'))

      expect(apple).toHaveAttribute('data-highlighted')
    })

    it('removes a filtered-out chip without clearing the visible highlight', async () => {
      render(R2ChipsHighlightCombobox, {
        open: true,
        value: ['apple', 'banana'],
        items: ['banana']
      })

      const banana = screen.getByRole('option', { name: 'banana' })
      fireEvent.mouseMove(banana)
      await waitFor(() => expect(banana).toHaveAttribute('data-highlighted'))

      fireEvent.click(screen.getByTestId('remove-apple'))

      expect(banana).toHaveAttribute('data-highlighted')
    })

    it('has tabindex=-1', () => {
      render(ChipsCombobox, { value: ['apple'], chips: ['apple'] })

      expect(screen.getByTestId('remove-apple')).toHaveAttribute('tabindex', '-1')
    })
  })
})
