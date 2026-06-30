import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import MenuWithLinkItems from './fixtures/menu-with-link-items.svelte'

describe('<Menu.LinkItem />', () => {
  describe('rendering links', () => {
    it.skipIf(isJSDOM)('activates with Enter and Space', async () => {
      const user = userEvent.setup()
      const onclick = vi.fn((event: MouseEvent) => event.preventDefault())
      render(MenuWithLinkItems, { onclick })

      const [link1] = screen.getAllByRole('menuitem')
      link1.focus()
      await waitFor(() => expect(link1).toHaveFocus())

      await user.keyboard('[Enter]')
      expect(onclick).toHaveBeenCalledTimes(1)

      link1.focus()
      await user.keyboard('[Space]')
      expect(onclick).toHaveBeenCalledTimes(2)
    })

    it.skipIf(isJSDOM)(
      'does not navigate when Space is pressed during an active typeahead session',
      async () => {
        const user = userEvent.setup()
        const onclick = vi.fn((event: MouseEvent) => event.preventDefault())
        render(MenuWithLinkItems, { onclick })

        const [link1, link2] = screen.getAllByRole('menuitem')
        link1.focus()
        await waitFor(() => expect(link1).toHaveFocus())

        await user.keyboard('Item T')
        await waitFor(() => expect(link2).toHaveFocus())
        expect(onclick).not.toHaveBeenCalled()

        await user.keyboard('[Space]')
        expect(onclick).not.toHaveBeenCalled()
      }
    )
  })
})
