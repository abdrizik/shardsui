import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import MenuWithDisabledRadioItem from './fixtures/menu-with-disabled-radio-item.svelte'
import MenuWithRadioItems from './fixtures/menu-with-radio-items.svelte'
import RadioGroupDisabled from './fixtures/radio-group-disabled.svelte'
import RadioItemOutsideGroup from './fixtures/radio-item-outside-group.svelte'
import RadioTypeahead from './fixtures/radio-typeahead.svelte'

async function openMenuAndFocusPopup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Open' }))
  const popup = screen.getByRole('menu')
  await waitFor(() => expect(popup).toHaveFocus(), { timeout: 3000 })
  return popup
}

describe('<Menu.RadioItem />', () => {
  it('throws when rendered outside <Menu.RadioGroup>', () => {
    expect(() => render(RadioItemOutsideGroup)).toThrow(
      'ShardsUI: this part must be rendered inside <Menu.RadioGroup>.'
    )
  })

  describe('state management', () => {
    it('adds the state and ARIA attributes when selected', async () => {
      const user = userEvent.setup()
      render(MenuWithRadioItems)
      await user.click(screen.getByRole('button', { name: 'Open' }))

      const item = screen.getByTestId('radio-item-a')
      await user.click(item)

      expect(item).toHaveAttribute('aria-checked', 'true')
      expect(item).toHaveAttribute('data-checked', '')
    })

    for (const key of [' ', 'Enter']) {
      it(`selects the item when ${key === ' ' ? 'Space' : key} is pressed`, async () => {
        const user = userEvent.setup()
        render(MenuWithRadioItems)
        const popup = await openMenuAndFocusPopup(user)

        fireEvent.keyDown(popup, { key: 'ArrowDown' })
        const item = screen.getByTestId('radio-item-a')
        await waitFor(() => expect(item).toHaveAttribute('data-highlighted', ''), { timeout: 2000 })

        fireEvent.keyDown(item, { key })
        await waitFor(() => expect(item).toHaveAttribute('data-checked', ''))
      })
    }

    it.skipIf(isJSDOM)(
      'does not select when Space is pressed during an active typeahead session',
      async () => {
        const user = userEvent.setup()
        const onValueChange = vi.fn()
        render(RadioTypeahead, { onValueChange })

        const itemOne = screen.getByTestId('item-one')
        const itemTwo = screen.getByTestId('item-two')

        itemOne.focus()

        await user.keyboard('Item T')
        await waitFor(() => expect(itemTwo).toHaveFocus())

        await user.keyboard('[Space]')
        await user.keyboard('[Space]')

        expect(onValueChange).not.toHaveBeenCalled()
        expect(itemTwo).toHaveAttribute('aria-checked', 'false')
      }
    )

    it('calls onValueChange when the item is clicked', async () => {
      const user = userEvent.setup()
      const onValueChange = vi.fn()
      render(MenuWithRadioItems, { onValueChange })
      await user.click(screen.getByRole('button', { name: 'Open' }))

      await user.click(screen.getByTestId('radio-item-b'))

      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(onValueChange.mock.calls[0][0]).toBe('b')
    })

    it('keeps the state when closed and reopened', async () => {
      const user = userEvent.setup()
      render(MenuWithRadioItems, { keepMounted: true, modal: false })
      const trigger = screen.getByRole('button', { name: 'Open' })

      await user.click(trigger)
      const itemA = screen.getByTestId('radio-item-a')
      await user.click(itemA)
      expect(itemA).toHaveAttribute('aria-checked', 'true')

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())

      await user.click(trigger)
      const itemAAfterReopen = screen.getByTestId('radio-item-a')
      expect(itemAAfterReopen).toHaveAttribute('aria-checked', 'true')
      expect(itemAAfterReopen).toHaveAttribute('data-checked', '')
    })
  })

  describe('prop: closeOnClick', () => {
    it('when closeOnClick=true, closes the menu when the item is clicked', async () => {
      const user = userEvent.setup()
      render(MenuWithRadioItems, { closeOnClick: true })
      await user.click(screen.getByRole('button', { name: 'Open' }))
      await user.click(screen.getByTestId('radio-item-a'))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('does not close the menu when the item is clicked by default', async () => {
      const user = userEvent.setup()
      render(MenuWithRadioItems)
      await user.click(screen.getByRole('button', { name: 'Open' }))
      await user.click(screen.getByTestId('radio-item-a'))

      expect(screen.queryByRole('menu')).toBeInTheDocument()
    })
  })

  describe('prop: focusableWhenDisabled', () => {
    it('can be focused but not interacted with when a radio group is disabled', async () => {
      const onItemClick = vi.fn()
      const onItemKeyDown = vi.fn()
      const onValueChange = vi.fn()
      render(RadioGroupDisabled, { onItemClick, onItemKeyDown, onValueChange })

      const item1 = screen.getByTestId('item-1')
      const item2 = screen.getByTestId('item-2')

      expect(item1).toHaveAttribute('data-disabled')
      expect(item2).toHaveAttribute('data-disabled')

      item1.focus()
      expect(item1).toHaveFocus()

      fireEvent.keyDown(item1, { key: 'Enter' })
      expect(onItemKeyDown).not.toHaveBeenCalled()
      expect(onItemClick).not.toHaveBeenCalled()
      expect(onValueChange).not.toHaveBeenCalled()

      fireEvent.click(item1)
      expect(onItemClick).not.toHaveBeenCalled()
      expect(onValueChange).not.toHaveBeenCalled()

      fireEvent.keyDown(item1, { key: 'ArrowDown' })
      await waitFor(() => expect(item2).toHaveFocus())

      fireEvent.keyDown(item2, { key: 'Enter' })
      expect(onItemClick).not.toHaveBeenCalled()
      expect(onValueChange).not.toHaveBeenCalled()

      fireEvent.click(item2)
      expect(onItemClick).not.toHaveBeenCalled()
      expect(onValueChange).not.toHaveBeenCalled()
    })
  })

  it('can be focused but not interacted with when individual items are disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onValueChange = vi.fn()

    render(MenuWithDisabledRadioItem, { value: 'one', onClick, onValueChange })

    const popup = await openMenuAndFocusPopup(user)
    const [item1, item2] = screen.getAllByRole('menuitemradio')

    expect(item1).toHaveAttribute('data-disabled')
    expect(item2).not.toHaveAttribute('data-disabled')

    fireEvent.keyDown(popup, { key: 'ArrowDown' })
    await waitFor(() => expect(item1).toHaveFocus())

    fireEvent.click(item1)
    expect(onClick).not.toHaveBeenCalled()
    expect(onValueChange).not.toHaveBeenCalled()

    fireEvent.keyDown(item1, { key: 'ArrowDown' })
    await waitFor(() => expect(item2).toHaveFocus())

    fireEvent.click(item2)
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(onValueChange.mock.calls[0][0]).toBe('two')
  })
})
