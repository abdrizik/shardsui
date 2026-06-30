import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import NavigationMenuCloseOnClickLink from './fixtures/navigation-menu-close-on-click-link.svelte'
import NavigationMenuWithActiveLink from './fixtures/navigation-menu-with-active-link.svelte'

describe('<NavigationMenu.Link />', () => {
  describe('prop: active', () => {
    it('when `true`, renders with aria-current="page"', () => {
      render(NavigationMenuWithActiveLink, { active: true })
      expect(screen.getByTestId('active-link')).toHaveAttribute('aria-current', 'page')
    })

    it('when `false`, does not render with aria-current="page"', () => {
      render(NavigationMenuWithActiveLink, { active: false })
      expect(screen.getByTestId('active-link')).not.toHaveAttribute('aria-current')
    })
  })

  describe.skipIf(!isJSDOM)('prop: closeOnClick', () => {
    it('closes the menu when clicking a link when true', async () => {
      const user = userEvent.setup()
      render(NavigationMenuCloseOnClickLink, { closeOnClick: true })

      const trigger = screen.getByTestId('trigger-1')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBeNull()
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await user.click(screen.getByTestId('link-1'))

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).toBeNull()
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })

    it('does not close the menu when clicking a link when false', async () => {
      const user = userEvent.setup()
      render(NavigationMenuCloseOnClickLink, { closeOnClick: false })

      const trigger = screen.getByTestId('trigger-1')
      await user.click(trigger)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBeNull()
      })
      expect(trigger).toHaveAttribute('aria-expanded', 'true')

      await user.click(screen.getByTestId('link-1'))

      expect(screen.queryByTestId('popup-1')).not.toBeNull()
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })
  })

  it('keeps the menu open when a link loses focus without a related target', async () => {
    const user = userEvent.setup()
    render(NavigationMenuCloseOnClickLink)

    const trigger = screen.getByTestId('trigger-1')
    await user.click(trigger)

    const link = await screen.findByTestId('link-1')
    fireEvent.focus(link)
    fireEvent.blur(link, { relatedTarget: null })

    expect(screen.queryByTestId('link-1')).not.toBeNull()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })
})
