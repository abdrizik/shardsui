import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicToolbar from './fixtures/basic-toolbar.svelte'
import ToolbarDisabledFocusLoop from './fixtures/toolbar-disabled-focus-loop.svelte'
import ToolbarNavigationMatrix from './fixtures/toolbar-navigation-matrix.svelte'
import ToolbarNoLoopFocus from './fixtures/toolbar-no-loop-focus.svelte'
import ToolbarOptionalConsumer from './fixtures/toolbar-optional-consumer.svelte'
import ToolbarWithAllItems from './fixtures/toolbar-with-all-items.svelte'

describe('<Toolbar.Root />', () => {
  describe('ARIA attributes', () => {
    it('has role="toolbar"', () => {
      const { container } = render(BasicToolbar)
      expect(container.firstElementChild).toHaveAttribute('role', 'toolbar')
      expect(container.firstElementChild).toBe(screen.getByRole('toolbar'))
    })
  })

  describe('context', () => {
    it('allows optional consumers both outside and inside a toolbar', () => {
      render(ToolbarOptionalConsumer)

      expect(screen.getByText('outside')).toBeVisible()
      expect(screen.getByText('vertical')).toBeVisible()
    })
  })

  describe.skipIf(isJSDOM)('keyboard navigation', () => {
    it.each([
      ['ltr', 'horizontal', 'ArrowRight', 'ArrowLeft'],
      ['ltr', 'vertical', 'ArrowDown', 'ArrowUp'],
      ['rtl', 'horizontal', 'ArrowLeft', 'ArrowRight'],
      ['rtl', 'vertical', 'ArrowDown', 'ArrowUp']
    ] as const)('%s > orientation: %s', async (direction, orientation, nextKey, prevKey) => {
      const user = userEvent.setup()
      render(ToolbarNavigationMatrix, { direction, orientation })

      const [button1, groupedButton1, groupedButton2] = screen.getAllByRole('button')
      const link = screen.getByText('Link')
      const input = screen.getByRole('textbox')

      await user.tab()
      expect(button1).toHaveFocus()

      await user.keyboard(`{${nextKey}}`)
      expect(link).toHaveFocus()

      await user.keyboard(`{${nextKey}}`)
      expect(groupedButton1).toHaveFocus()

      await user.keyboard(`{${nextKey}}`)
      expect(groupedButton2).toHaveFocus()

      await user.keyboard(`{${nextKey}}`)
      expect(input).toHaveFocus()

      await user.keyboard(`{${nextKey}}`)
      expect(button1).toHaveFocus()

      await user.keyboard(`{${prevKey}}`)
      expect(input).toHaveFocus()

      await user.keyboard(`{${prevKey}}`)
      expect(groupedButton2).toHaveFocus()
    })

    it('does not wrap focus when loopFocus is false', async () => {
      const user = userEvent.setup()
      render(ToolbarNoLoopFocus)

      const first = screen.getByTestId('first')
      const last = screen.getByTestId('last')

      await user.tab()
      expect(first).toHaveFocus()

      await user.keyboard('{ArrowLeft}')
      expect(first).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expect(last).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expect(last).toHaveFocus()
    })
  })

  describe('prop: disabled', () => {
    it('disables all toolbar items except links', () => {
      render(ToolbarWithAllItems, { disabled: true })
      ;[...screen.getAllByRole('button'), ...screen.getAllByRole('textbox')].forEach((item) => {
        expect(item).toHaveAttribute('aria-disabled', 'true')
        expect(item).toHaveAttribute('data-disabled')
      })

      expect(screen.getByRole('group')).toHaveAttribute('data-disabled')

      screen.getAllByRole('link').forEach((link) => {
        expect(link).not.toHaveAttribute('data-disabled')
        expect(link).not.toHaveAttribute('aria-disabled')
      })
    })
  })

  describe.skipIf(isJSDOM)('disabled items', () => {
    function expectFocusedWhenDisabled(element: Element) {
      expect(element).toHaveAttribute('data-disabled')
      expect(element).toHaveAttribute('aria-disabled', 'true')
      expect(element).toHaveFocus()
    }

    it('toolbar items can be focused when disabled by default', async () => {
      const user = userEvent.setup()
      render(ToolbarDisabledFocusLoop)

      const input = screen.getByRole('textbox')
      const buttons = screen.getAllByRole('button')
      ;[input, ...buttons].forEach((item) => {
        expect(item).not.toHaveAttribute('disabled')
      })

      const [button1, groupedButton1, groupedButton2] = buttons

      await user.tab()
      expect(button1).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      expectFocusedWhenDisabled(groupedButton1)

      await user.keyboard('{ArrowRight}')
      expectFocusedWhenDisabled(groupedButton2)

      await user.keyboard('{ArrowRight}')
      expectFocusedWhenDisabled(input)

      await user.keyboard('{ArrowRight}')
      expect(button1).toHaveAttribute('tabindex', '0')

      await user.keyboard('{ArrowLeft}')
      expectFocusedWhenDisabled(input)

      await user.keyboard('{ArrowLeft}')
      expectFocusedWhenDisabled(groupedButton2)
    })
  })
})
