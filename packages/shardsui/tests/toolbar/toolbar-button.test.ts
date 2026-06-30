import { render, screen } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicToolbar from './fixtures/basic-toolbar.svelte'
import ToolbarCustomElementButton from './fixtures/toolbar-custom-element-button.svelte'
import ToolbarDisabledButtonHandlers from './fixtures/toolbar-disabled-button-handlers.svelte'

describe('<Toolbar.Button />', () => {
  it('renders buttons inside the toolbar', () => {
    render(BasicToolbar)
    expect(screen.getAllByRole('button')).toEqual([
      screen.getByTestId('btn-1'),
      screen.getByTestId('btn-2'),
      screen.getByTestId('btn-3')
    ])
  })

  describe('prop: as', () => {
    it.each(['Space', 'Enter'])(
      'custom element: dispatches real clicks from %s keyboard activation',
      async (key) => {
        const user = userEvent.setup()
        const onclick = vi.fn()
        const onclickcapture = vi.fn()
        const onancestorclick = vi.fn()
        render(ToolbarCustomElementButton, { onclick, onclickcapture, onancestorclick })

        const button = screen.getByRole('button', { name: 'Save' })

        await user.keyboard('[Tab]')
        expect(button).toHaveFocus()

        await user.keyboard(`[${key}]`)

        expect(onclickcapture).toHaveBeenCalledTimes(1)
        expect(onclick).toHaveBeenCalledTimes(1)
        expect(onancestorclick).toHaveBeenCalledTimes(1)
      }
    )
  })

  describe('prop: disabled', () => {
    it('disables the button', async () => {
      const user = userEvent.setup()
      const onclick = vi.fn()
      const onmousedown = vi.fn()
      const onpointerdown = vi.fn()
      const onkeydown = vi.fn()
      render(ToolbarDisabledButtonHandlers, { onclick, onmousedown, onpointerdown, onkeydown })

      const btn = screen.getByTestId('btn')
      expect(btn).not.toHaveAttribute('disabled')
      expect(btn).toHaveAttribute('data-disabled')
      expect(btn).toHaveAttribute('aria-disabled', 'true')

      await user.click(btn)
      btn.focus()
      await user.keyboard('[Space]')
      await user.keyboard('[Enter]')

      expect(onclick).not.toHaveBeenCalled()
      expect(onmousedown).not.toHaveBeenCalled()
      expect(onpointerdown).not.toHaveBeenCalled()
      expect(onkeydown).not.toHaveBeenCalled()
    })

    it.skipIf(isJSDOM)('allows hover handlers while blocking activation', async () => {
      const handleClick = vi.fn()
      const handleMouseMove = vi.fn()
      const user = userEvent.setup()
      render(ToolbarDisabledButtonHandlers, {
        onclick: handleClick,
        onmousemove: handleMouseMove
      })

      const button = screen.getByTestId('btn')

      expect(button).not.toHaveAttribute('disabled')
      expect(button).toHaveAttribute('data-disabled')
      expect(button).toHaveAttribute('aria-disabled', 'true')

      await user.hover(button)
      expect(handleMouseMove).toHaveBeenCalled()

      await user.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })
})
