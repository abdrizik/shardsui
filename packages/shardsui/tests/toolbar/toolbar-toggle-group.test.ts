import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import ToolbarToggleGroupDisabledGroup from './fixtures/toolbar-toggle-group-disabled-group.svelte'
import ToolbarToggleGroupThree from './fixtures/toolbar-toggle-group-three.svelte'
import ToolbarWithToggleGroup from './fixtures/toolbar-with-toggle-group.svelte'

describe('Toolbar + ToggleGroup', () => {
  describe('direct ToggleGroup > Toggle children', () => {
    it('toggles in a nested ToggleGroup are roving items unified with toolbar buttons', async () => {
      const user = userEvent.setup()
      render(ToolbarWithToggleGroup)
      const left = screen.getByTestId('toggle-left')
      const right = screen.getByTestId('toggle-right')
      const btn = screen.getByTestId('btn')

      await user.tab()
      expect(left).toHaveFocus()
      expect(left).toHaveAttribute('tabindex', '0')

      await user.keyboard('{ArrowRight}')
      expect(right).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expect(btn).toHaveFocus()
    })

    it('navigates and selects direct ToggleGroup > Toggle children', async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(ToolbarToggleGroupThree, { onValueChange })

      const one = screen.getByTestId('one')
      const two = screen.getByTestId('two')
      const three = screen.getByTestId('three')

      expect(one).toHaveAttribute('aria-pressed', 'true')

      await user.tab()
      await waitFor(() => expect(one).toHaveFocus())

      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(two).toHaveFocus())

      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(three).toHaveFocus())

      await user.keyboard('{Enter}')
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toEqual(['three'])
      expect(one).toHaveAttribute('aria-pressed', 'false')
      expect(three).toHaveAttribute('aria-pressed', 'true')
    })

    it.skipIf(isJSDOM)('skips disabled direct ToggleGroup > Toggle children', async () => {
      const user = userEvent.setup()
      render(ToolbarToggleGroupThree, { value: [], twoDisabled: true })

      const one = screen.getByTestId('one')
      const two = screen.getByTestId('two')
      const three = screen.getByTestId('three')

      expect(two).toBeDisabled()

      await user.tab()
      await waitFor(() => expect(one).toHaveFocus())

      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(three).toHaveFocus())
      expect(two).not.toHaveAttribute('tabindex', '0')
    })

    it('supports multiple selection for direct ToggleGroup > Toggle children', async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(ToolbarToggleGroupThree, { value: ['one'], multiple: true, onValueChange })

      const one = screen.getByTestId('one')
      const two = screen.getByTestId('two')

      await user.tab()
      await waitFor(() => expect(one).toHaveFocus())

      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(two).toHaveFocus())

      await user.keyboard('{Enter}')
      expect(onValueChange.mock.calls[0][0]).toEqual(['one', 'two'])
      expect(one).toHaveAttribute('aria-pressed', 'true')
      expect(two).toHaveAttribute('aria-pressed', 'true')
    })

    it('supports a controlled ToggleGroup value', async () => {
      const user = userEvent.setup()
      render(ToolbarToggleGroupThree, { value: [] })

      const one = screen.getByTestId('one')

      expect(one).toHaveAttribute('aria-pressed', 'false')

      await user.tab()
      await waitFor(() => expect(one).toHaveFocus())

      await user.keyboard('{Enter}')
      expect(one).toHaveAttribute('aria-pressed', 'true')
    })

    it('disables direct ToggleGroup children when Toolbar.Group is disabled', async () => {
      const user = userEvent.setup()
      render(ToolbarToggleGroupDisabledGroup)

      const before = screen.getByTestId('before')
      const one = screen.getByTestId('one')
      const two = screen.getByTestId('two')
      const after = screen.getByTestId('after')

      ;[one, two].forEach((toggle) => {
        expect(toggle).toBeDisabled()
        expect(toggle).toHaveAttribute('data-disabled')
      })

      await user.tab()
      await waitFor(() => expect(before).toHaveFocus())

      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(after).toHaveFocus())
      expect(one).not.toHaveAttribute('tabindex', '0')
      expect(two).not.toHaveAttribute('tabindex', '0')
    })

    it.skipIf(isJSDOM)('skips a direct Toggle that becomes disabled at runtime', async () => {
      const user = userEvent.setup()
      const { rerender } = render(ToolbarToggleGroupThree, { value: [], twoDisabled: false })

      const one = screen.getByTestId('one')
      const three = screen.getByTestId('three')

      await user.tab()
      await waitFor(() => expect(one).toHaveFocus())

      await rerender({ value: [], twoDisabled: true })

      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(three).toHaveFocus())
    })
  })
})
