import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import ToolbarCheckboxInput from './fixtures/toolbar-checkbox-input.svelte'
import ToolbarDisabledInputTab from './fixtures/toolbar-disabled-input-tab.svelte'
import ToolbarInputDirection from './fixtures/toolbar-input-direction.svelte'
import ToolbarInputSelection from './fixtures/toolbar-input-selection.svelte'

describe('<Toolbar.Input />', () => {
  it('renders a textbox', () => {
    render(ToolbarInputSelection)
    expect(screen.getByTestId('input')).toBe(screen.getByRole('textbox'))
  })

  describe('pointer interactions', () => {
    it('does not steal focus while disabled and becomes pointer-focusable when enabled', async () => {
      const user = userEvent.setup()
      const { rerender } = render(ToolbarInputSelection, { inputDisabled: true })

      const button = screen.getByTestId('button-1')
      const input = screen.getByTestId('input')

      await user.keyboard('{Tab}')
      expect(button).toHaveFocus()

      await user.click(input)
      expect(button).toHaveFocus()

      await rerender({ inputDisabled: false })
      await user.click(input)
      expect(input).toHaveFocus()
    })

    it('prevents click default actions while disabled', async () => {
      const user = userEvent.setup()
      const { rerender } = render(ToolbarCheckboxInput, { disabled: true })
      const input = screen.getByRole('checkbox')

      await user.click(input)
      expect(input).not.toBeChecked()

      await rerender({ disabled: false })
      await user.click(input)
      expect(input).toBeChecked()
    })
  })

  describe.skipIf(isJSDOM)('disabled', () => {
    it('does not trap keyboard focus when disabled', async () => {
      const user = userEvent.setup()
      render(ToolbarDisabledInputTab)

      const button = screen.getByTestId('button')
      const input = screen.getByRole('textbox')
      const after = screen.getByTestId('after')

      await user.keyboard('{Tab}')
      expect(button).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expect(input).toHaveFocus()

      await user.keyboard('{Tab}')
      expect(after).toHaveFocus()

      await user.keyboard('{Shift>}{Tab}{/Shift}')
      expect(input).toHaveFocus()
    })

    it('does not block vertical roving focus when disabled', async () => {
      const user = userEvent.setup()
      render(ToolbarInputSelection, { orientation: 'vertical', inputDisabled: true })

      const input = screen.getByRole('textbox')
      const button1 = screen.getByTestId('button-1')
      const button2 = screen.getByTestId('button-2')

      await user.keyboard('{Tab}')
      expect(button1).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(input).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(button2).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(input).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(button1).toHaveFocus()
    })
  })

  // jsdom does not compute selectionStart / selectionEnd for arrow-key caret movement.
  describe.skipIf(isJSDOM)('keyboard navigation', () => {
    it.each([
      ['ltr', '{ArrowRight}', '{ArrowLeft}'],
      ['rtl', '{ArrowLeft}', '{ArrowRight}']
    ] as const)(
      'respects caret and selection boundaries in horizontal %s toolbars',
      async (direction, nextKey, previousKey) => {
        const user = userEvent.setup()
        render(ToolbarInputDirection, { direction })

        const input = screen.getByTestId('input') as HTMLInputElement
        const before = screen.getByTestId('before')
        const after = screen.getByTestId('after')

        await user.keyboard('{Tab}')
        await user.keyboard(nextKey)
        expect(input).toHaveFocus()

        input.setSelectionRange(1, 3)
        await user.keyboard(nextKey)
        expect(input).toHaveFocus()

        input.setSelectionRange(2, 2)
        await user.keyboard('{Shift>}' + nextKey + '{/Shift}')
        expect(input).toHaveFocus()

        const nextBoundary =
          direction === 'rtl' || nextKey === '{ArrowRight}' ? input.value.length : 0
        input.setSelectionRange(nextBoundary, nextBoundary)
        await user.keyboard(nextKey)
        expect(after).toHaveFocus()

        await user.keyboard(previousKey)
        expect(input).toHaveFocus()
        const previousBoundary =
          direction === 'rtl' || previousKey === '{ArrowLeft}' ? 0 : input.value.length
        input.setSelectionRange(previousBoundary, previousBoundary)
        await user.keyboard(previousKey)
        expect(before).toHaveFocus()
      }
    )

    it.each([
      ['horizontal', '{ArrowRight}', '{ArrowLeft}'],
      ['vertical', '{ArrowDown}', '{ArrowUp}']
    ] as const)('orientation: %s', async (orientation, nextKey, prevKey) => {
      const user = userEvent.setup()
      render(ToolbarInputSelection, { orientation })

      const input = screen.getByRole('textbox') as HTMLInputElement
      const [button1, button2] = screen.getAllByRole('button')

      await user.keyboard('{Tab}')
      expect(button1).toHaveFocus()

      await user.keyboard(nextKey)
      expect(input).toHaveFocus()

      // Firefox doesn't support document.getSelection() in inputs
      expect(input.selectionStart).toBe(0)
      expect(input.selectionEnd).toBe(4)

      await user.keyboard('{ArrowRight}')
      await user.keyboard(nextKey)

      expect(button2).toHaveFocus()

      await user.keyboard(prevKey)
      expect(input).toHaveFocus()

      await user.keyboard('{ArrowLeft}')
      await user.keyboard(prevKey)

      expect(button1).toHaveFocus()
    })
  })
})
