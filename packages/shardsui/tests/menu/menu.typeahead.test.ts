import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import DiacriticPrefixMenu from './fixtures/diacritic-prefix-menu.svelte'
import MenuWithLabelItems from './fixtures/menu-with-label-items.svelte'
import NumberedItemsMenu from './fixtures/numbered-items-menu.svelte'
import TypeaheadClickMenu from './fixtures/typeahead-click-menu.svelte'
import TypeaheadSubmenuSpace from './fixtures/typeahead-submenu-space.svelte'

describe('<Menu.Root />', () => {
  describe('text navigation', () => {
    it.skipIf(!isJSDOM)(
      'changes the highlighted item using text navigation on label prop',
      async () => {
        const user = userEvent.setup()
        render(MenuWithLabelItems)

        await user.click(screen.getByRole('button', { name: 'Toggle' }))
        await waitFor(() => {
          expect(screen.getByRole('menu')).toHaveFocus()
        })

        await user.keyboard('b')
        await waitFor(() => {
          expect(screen.getByTestId('item-2')).toHaveFocus()
          expect(screen.getByTestId('item-2')).toHaveAttribute('tabindex', '0')
        })

        await user.keyboard('b')
        await waitFor(() => {
          expect(screen.getByTestId('item-3')).toHaveFocus()
          expect(screen.getByTestId('item-3')).toHaveAttribute('tabindex', '0')
        })

        await user.keyboard('b')
        await waitFor(() => {
          expect(screen.getByTestId('item-3')).toHaveFocus()
          expect(screen.getByTestId('item-3')).toHaveAttribute('tabindex', '0')
        })
      }
    )
  })

  describe.skipIf(isJSDOM)('typeahead sessions', () => {
    it('navigate to next options that begin with diacritic characters', async () => {
      const user = userEvent.setup()
      render(DiacriticPrefixMenu)

      screen.getAllByRole('menuitem')[0].focus()

      await user.keyboard('ą')
      await waitFor(() => expect(screen.getByText('ąa')).toHaveFocus())
      expect(screen.getByText('ąa')).toHaveAttribute('tabindex', '0')
    })

    it('does not trigger the onclick event when Space is pressed during text navigation', async () => {
      const user = userEvent.setup()
      const onItemClick = vi.fn()
      render(TypeaheadClickMenu, { onItemClick })

      const items = screen.getAllByRole('menuitem')
      items[0].focus()

      await user.keyboard('Item T')

      expect(onItemClick).not.toHaveBeenCalled()
      await waitFor(() => expect(items[1]).toHaveFocus())
    })

    it('matches "Item 2" after "Item " currently matches "Item 1"', async () => {
      const user = userEvent.setup()
      render(NumberedItemsMenu)

      screen.getByRole('menuitem', { name: 'Item 1' }).focus()

      await user.keyboard('Item 2')
      await waitFor(() => expect(screen.getByTestId('item-2')).toHaveFocus())
    })

    it('does not open a submenu when pressing Space during a typeahead session', async () => {
      const user = userEvent.setup()
      render(TypeaheadSubmenuSpace)

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      submenuTrigger.focus()

      await user.keyboard('Add to p')
      await waitFor(() => expect(submenuTrigger).toHaveFocus())

      await user.keyboard('[Space]')
      expect(screen.queryByTestId('submenu')).toBe(null)

      await user.keyboard('[Space]')
      expect(screen.queryByTestId('submenu')).toBe(null)
    })

    it('matches a submenu trigger label after a space + numeric suffix', async () => {
      const user = userEvent.setup()
      render(NumberedItemsMenu, { submenu: true })

      screen.getByRole('menuitem', { name: 'Item 1' }).focus()

      await user.keyboard('Item 2')
      await waitFor(() => expect(screen.getByTestId('submenu-trigger')).toHaveFocus())
      expect(screen.queryByTestId('submenu')).toBe(null)
    })
  })
})
