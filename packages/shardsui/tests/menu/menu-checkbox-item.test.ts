import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import CheckboxTypeahead from './fixtures/checkbox-typeahead.svelte'
import MenuWithCheckboxItems from './fixtures/menu-with-checkbox-items.svelte'

async function openMenuAndHighlightItem(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Open' }))
  const popup = screen.getByRole('menu')
  await waitFor(() => expect(popup).toHaveFocus(), { timeout: 3000 })

  fireEvent.keyDown(popup, { key: 'ArrowDown' })
  const item = screen.getByRole('menuitemcheckbox')
  await waitFor(() => expect(item).toHaveAttribute('data-highlighted', ''), { timeout: 2000 })
  return item
}

describe('<Menu.CheckboxItem />', () => {
  describe('state management', () => {
    for (const [checked, ariaChecked, dataState] of [
      [true, 'true', 'checked'],
      [false, 'false', 'unchecked']
    ] as const) {
      it('adds the state and ARIA attributes when checked', async () => {
        const user = userEvent.setup()
        render(MenuWithCheckboxItems, { checked })
        await user.click(screen.getByRole('button', { name: 'Open' }))

        const item = screen.getByRole('menuitemcheckbox')
        expect(item).toHaveAttribute('aria-checked', ariaChecked)
        expect(item).toHaveAttribute(`data-${dataState}`, '')
      })
    }

    it('toggles the checked state when clicked', async () => {
      const user = userEvent.setup()
      render(MenuWithCheckboxItems)
      await user.click(screen.getByRole('button', { name: 'Open' }))

      const item = screen.getByRole('menuitemcheckbox')
      await user.click(item)
      expect(item).toHaveAttribute('aria-checked', 'true')
      expect(item).toHaveAttribute('data-checked', '')

      await user.click(item)
      expect(item).toHaveAttribute('aria-checked', 'false')
      expect(item).toHaveAttribute('data-unchecked', '')
    })

    it('toggles the checked state when Space is pressed', async () => {
      const user = userEvent.setup()
      render(MenuWithCheckboxItems)
      const item = await openMenuAndHighlightItem(user)

      fireEvent.keyDown(item, { key: ' ' })
      await waitFor(() => expect(item).toHaveAttribute('data-checked', ''))

      fireEvent.keyDown(item, { key: ' ' })
      await waitFor(() => expect(item).toHaveAttribute('data-unchecked', ''))
    })

    it.skipIf(isJSDOM)(
      'does not toggle when Space is pressed during an active typeahead session',
      async () => {
        const user = userEvent.setup()
        const onCheckedChange = vi.fn()
        render(CheckboxTypeahead, { onCheckedChange })

        const itemOne = screen.getByTestId('item-one')
        const itemTwo = screen.getByTestId('item-two')

        itemOne.focus()

        await user.keyboard('Item T')
        await waitFor(() => expect(itemTwo).toHaveFocus())

        await user.keyboard('[Space]')
        await user.keyboard('[Space]')

        expect(onCheckedChange).not.toHaveBeenCalled()
        expect(itemTwo).toHaveAttribute('aria-checked', 'false')
      }
    )

    it.skipIf(isJSDOM)('toggles the checked state when Enter is pressed', async () => {
      const user = userEvent.setup()
      render(MenuWithCheckboxItems)
      const item = await openMenuAndHighlightItem(user)

      fireEvent.keyDown(item, { key: 'Enter' })
      await waitFor(() => expect(item).toHaveAttribute('data-checked', ''))
    })

    it('calls onCheckedChange when the item is clicked', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()
      render(MenuWithCheckboxItems, { onCheckedChange })
      await user.click(screen.getByRole('button', { name: 'Open' }))

      const item = screen.getByRole('menuitemcheckbox')
      await user.click(item)

      expect(onCheckedChange).toHaveBeenCalledTimes(1)
      expect(onCheckedChange.mock.calls[0][0]).toBe(true)

      await user.click(item)
      expect(onCheckedChange).toHaveBeenCalledTimes(2)
      expect(onCheckedChange.mock.calls[1][0]).toBe(false)
    })

    it('keeps the state when closed and reopened', async () => {
      const user = userEvent.setup()
      render(MenuWithCheckboxItems, { keepMounted: true, modal: false })
      const trigger = screen.getByRole('button', { name: 'Open' })

      await user.click(trigger)
      const item = screen.getByRole('menuitemcheckbox')
      await user.click(item)
      expect(item).toHaveAttribute('aria-checked', 'true')

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())

      await user.click(trigger)
      const itemAfterReopen = screen.getByRole('menuitemcheckbox')
      expect(itemAfterReopen).toHaveAttribute('aria-checked', 'true')
      expect(itemAfterReopen).toHaveAttribute('data-checked', '')
    })
  })

  describe('prop: closeOnClick', () => {
    it('when closeOnClick=true, closes the menu when the item is clicked', async () => {
      const user = userEvent.setup()
      render(MenuWithCheckboxItems, { closeOnClick: true })
      await user.click(screen.getByRole('button', { name: 'Open' }))
      await user.click(screen.getByRole('menuitemcheckbox'))

      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    })

    it('does not close the menu when the item is clicked by default', async () => {
      const user = userEvent.setup()
      render(MenuWithCheckboxItems)
      await user.click(screen.getByRole('button', { name: 'Open' }))
      await user.click(screen.getByRole('menuitemcheckbox'))

      expect(screen.queryByRole('menu')).toBeInTheDocument()
    })
  })

  describe('prop: focusableWhenDisabled', () => {
    it('can be focused but not interacted with when disabled', async () => {
      const user = userEvent.setup()
      const onCheckedChange = vi.fn()
      render(MenuWithCheckboxItems, { disabled: true, onCheckedChange })
      await user.click(screen.getByRole('button', { name: 'Open' }))

      const item = screen.getByRole('menuitemcheckbox')
      expect(item).toHaveAttribute('aria-disabled', 'true')

      item.focus()
      expect(item).toHaveFocus()

      fireEvent.click(item)
      expect(onCheckedChange).not.toHaveBeenCalled()
      expect(item).toHaveAttribute('aria-checked', 'false')
    })
  })
})
