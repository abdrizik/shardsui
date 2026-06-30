import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import BasicMenu from './fixtures/basic-menu.svelte'
import ItemOutsideRoot from './fixtures/item-outside-root.svelte'
import MenuWithDisabledButtonItem from './fixtures/menu-with-disabled-button-item.svelte'
import MenuWithDisabledItems from './fixtures/menu-with-disabled-items.svelte'
import MenuWithItemHandlers from './fixtures/menu-with-item-handlers.svelte'

describe('<Menu.Item />', () => {
  it('throws when rendered outside <Menu.Root>', () => {
    expect(() => render(ItemOutsideRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <Menu.Root>.'
    )
  })

  it('calls the onclick handler when clicked', async () => {
    const user = userEvent.setup()
    const onItem1Click = vi.fn()
    render(MenuWithItemHandlers, { onItem1Click })
    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    await user.click(screen.getByTestId('item-1'))

    expect(onItem1Click).toHaveBeenCalledTimes(1)
  })

  it('does not close the menu when onclick prevents the ShardsUI handler', async () => {
    const user = userEvent.setup()
    const onItem1Click = vi.fn((event) => {
      ;(event as MouseEvent & { preventShardsUIHandler(): void }).preventShardsUIHandler()
    })
    render(MenuWithItemHandlers, { onItem1Click })

    await user.click(screen.getByRole('button', { name: 'Toggle' }))
    await user.click(screen.getByTestId('item-1'))

    expect(onItem1Click).toHaveBeenCalledOnce()
    expect(screen.getByRole('menu')).toBeInTheDocument()
  })

  describe('prop: closeOnClick', () => {
    it('closes the menu when the item is clicked by default', async () => {
      const user = userEvent.setup()
      render(BasicMenu)
      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      await user.click(screen.getByTestId('item-1'))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('when closeOnClick=false does not close the menu when the item is clicked', async () => {
      const user = userEvent.setup()
      render(MenuWithItemHandlers, { closeOnClick: false })
      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      await user.click(screen.getByTestId('item-1'))

      expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('can be focused but not interacted with when disabled', async () => {
      const user = userEvent.setup()
      const onDisabledItemClick = vi.fn()
      const onDisabledItemKeyDown = vi.fn()
      const onDisabledItemKeyUp = vi.fn()
      render(MenuWithDisabledItems, {
        onDisabledItemClick,
        onDisabledItemKeyDown,
        onDisabledItemKeyUp
      })
      await user.click(screen.getByRole('button', { name: 'Open' }))

      const item = screen.getByTestId('item-2')
      item.focus()
      expect(item).toHaveFocus()

      fireEvent.keyDown(item, { key: 'Enter' })
      expect(onDisabledItemKeyDown).not.toHaveBeenCalled()
      expect(onDisabledItemClick).not.toHaveBeenCalled()

      fireEvent.keyUp(item, { key: 'Space' })
      expect(onDisabledItemKeyUp).not.toHaveBeenCalled()
      expect(onDisabledItemClick).not.toHaveBeenCalled()

      fireEvent.click(item)
      expect(onDisabledItemKeyDown).not.toHaveBeenCalled()
      expect(onDisabledItemKeyUp).not.toHaveBeenCalled()
      expect(onDisabledItemClick).not.toHaveBeenCalled()
    })
  })

  describe('prop: as — disabled with as="button"', () => {
    it('marks it aria-disabled instead of natively disabled', () => {
      render(MenuWithDisabledButtonItem)

      const disabledItem = screen.getByTestId('item-2')
      expect(disabledItem).not.toHaveAttribute('disabled')
      expect(disabledItem).toHaveAttribute('aria-disabled', 'true')
    })

    it('keeps it reachable by keyboard navigation', async () => {
      const user = userEvent.setup()
      render(MenuWithDisabledButtonItem)

      const firstItem = screen.getByTestId('item-1')
      const disabledItem = screen.getByTestId('item-2')
      firstItem.focus()

      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(disabledItem).toHaveFocus())

      await user.keyboard('{ArrowUp}')
      await waitFor(() => expect(firstItem).toHaveFocus())
    })
  })
})
