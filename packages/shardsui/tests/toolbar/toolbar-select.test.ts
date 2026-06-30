import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import ToolbarDisabledSelect from './fixtures/toolbar-disabled-select.svelte'
import ToolbarWithSelect from './fixtures/toolbar-with-select.svelte'

describe('Toolbar + Select', () => {
  it('renders a select trigger', () => {
    render(ToolbarWithSelect)

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toBe(screen.getByRole('combobox'))
    expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
  })

  it('disabled state', async () => {
    const onValueChange = vi.fn()
    const onOpenChange = vi.fn()
    const user = userEvent.setup()
    render(ToolbarDisabledSelect, { value: 'a', onValueChange, onOpenChange })

    expect(screen.queryByRole('listbox')).toBe(null)

    const trigger = screen.getByRole('combobox')
    expect(trigger).not.toHaveAttribute('disabled')
    expect(trigger).toHaveAttribute('data-disabled')
    expect(trigger).toHaveAttribute('aria-disabled', 'true')

    await user.keyboard('{Tab}')
    expect(trigger).toHaveFocus()

    expect(onOpenChange).toHaveBeenCalledTimes(0)
    expect(onValueChange).toHaveBeenCalledTimes(0)

    await user.keyboard('{ArrowUp}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    await user.keyboard('{ }')

    expect(onOpenChange).toHaveBeenCalledTimes(0)
    expect(onValueChange).toHaveBeenCalledTimes(0)
  })

  it.skipIf(!isJSDOM)(
    'opens the select and chooses an item while in the toolbar composite',
    async () => {
      const onValueChange = vi.fn()
      const user = userEvent.setup()
      render(ToolbarWithSelect, { value: 'a', onValueChange })

      expect(screen.queryByRole('listbox')).toBe(null)

      const trigger = screen.getByTestId('select-trigger')
      await user.tab()
      await user.keyboard('{ArrowRight}')
      expect(trigger).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      expect(screen.queryByRole('listbox')).toBe(screen.getByTestId('popup'))
      await waitFor(() => {
        expect(screen.getByTestId('item-a')).toHaveFocus()
      })

      await user.keyboard('{ArrowDown}')
      await waitFor(() => {
        expect(screen.getByTestId('item-b')).toHaveFocus()
      })

      await user.keyboard('{Enter}')
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBe(null)
      })

      await waitFor(() => {
        expect(trigger).toHaveFocus()
      })

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange).toHaveBeenCalledWith('b')
    }
  )
})
