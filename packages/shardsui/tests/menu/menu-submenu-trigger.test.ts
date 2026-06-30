import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { describe, expect, it } from 'vitest'
import { isJSDOM } from '../test-utils'
import ComplexSubmenuOutside from './fixtures/complex-submenu-outside.svelte'
import HorizontalSubmenu from './fixtures/horizontal-submenu.svelte'
import MenuWithComplexSubmenu from './fixtures/menu-with-complex-submenu.svelte'
import MenuWithDirectionSubmenu from './fixtures/menu-with-direction-submenu.svelte'
import MenuWithSubmenu from './fixtures/menu-with-submenu.svelte'
import SubmenuLabel from './fixtures/submenu-label.svelte'

async function openComplexToDeepestSubmenu(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Toggle' }))
  await screen.findByTestId('menu')
  await waitFor(() => expect(screen.getByTestId('menu')).toHaveFocus())
  await user.keyboard('[ArrowDown]')
  await user.keyboard('[ArrowDown]')
  await user.keyboard('[ArrowDown]')
  await user.keyboard('[ArrowDown]')
  const submenuTrigger1 = await screen.findByTestId('submenu-trigger')
  await waitFor(() => expect(submenuTrigger1).toHaveFocus())
  await user.keyboard('[ArrowRight]')
  await screen.findByTestId('submenu')
  await user.keyboard('[ArrowDown]')
  await user.keyboard('[ArrowDown]')
  const submenuTrigger2 = await screen.findByTestId('nested-submenu-trigger')
  await waitFor(() => expect(submenuTrigger2).toHaveFocus())
  await user.keyboard('[ArrowRight]')
  await waitFor(() => {
    expect(screen.getByTestId('nested-submenu')).toBeInTheDocument()
    expect(screen.getByTestId('item-4_3_1')).toHaveFocus()
  })
  return { submenuTrigger1, submenuTrigger2 }
}

describe('<Menu.SubmenuTrigger />', () => {
  describe('opening and closing', () => {
    it('opens submenu on click when openOnHover=false', async () => {
      const user = userEvent.setup()
      render(MenuWithSubmenu, { openOnHover: false })
      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      expect(screen.queryByTestId('submenu')).not.toBeInTheDocument()

      await user.click(screen.getByTestId('submenu-trigger'))
      expect(screen.queryByTestId('submenu')).toBeInTheDocument()
    })

    it.skipIf(isJSDOM)(
      'does not open a submenu when pressing Space during a typeahead session',
      async () => {
        const user = userEvent.setup()
        render(MenuWithSubmenu, { openOnHover: false })
        await user.click(screen.getByRole('button', { name: 'Toggle' }))
        await waitFor(() => expect(screen.getByTestId('menu')).toHaveFocus())

        await user.keyboard('Item 3')
        await waitFor(() => expect(screen.getByTestId('submenu-trigger')).toHaveFocus())

        await user.keyboard('[Space]')
        expect(screen.queryByTestId('submenu')).not.toBeInTheDocument()

        await user.keyboard('[Space]')
        expect(screen.queryByTestId('submenu')).not.toBeInTheDocument()
      }
    )

    it('opens submenu with Space key from submenu trigger', async () => {
      render(MenuWithSubmenu)
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      const submenuTrigger = screen.getByTestId('submenu-trigger')
      submenuTrigger.focus()
      fireEvent.keyDown(submenuTrigger, { key: ' ' })
      await waitFor(
        () => {
          expect(screen.queryByTestId('submenu')).toBeInTheDocument()
        },
        { timeout: 2000 }
      )
    })

    const directionCases = [
      { direction: 'ltr', openKey: 'ArrowRight', closeKey: 'ArrowLeft' },
      { direction: 'rtl', openKey: 'ArrowLeft', closeKey: 'ArrowRight' }
    ] as const

    directionCases.forEach(({ direction, openKey, closeKey }) => {
      it(`opens the submenu with ${openKey} and highlights a single item in ${direction.toUpperCase()} direction`, async () => {
        const user = userEvent.setup()
        render(MenuWithDirectionSubmenu, { direction })
        await user.click(screen.getByRole('button', { name: 'Toggle' }))
        const submenuTrigger = screen.getByTestId('submenu-trigger')
        submenuTrigger.focus()
        fireEvent.keyDown(submenuTrigger, { key: openKey })
        await waitFor(
          () => {
            expect(screen.getByTestId('submenu-item-1')).toHaveAttribute('data-highlighted', '')
          },
          { timeout: 2000 }
        )

        expect(screen.getByTestId('submenu-item-2')).not.toHaveAttribute('data-highlighted')
        expect(screen.getByTestId('item-1')).not.toHaveAttribute('data-highlighted')
        expect(submenuTrigger).not.toHaveAttribute('data-highlighted')
      })

      it(`closes the submenu with ${closeKey} in ${direction.toUpperCase()} direction`, async () => {
        const user = userEvent.setup()
        render(MenuWithDirectionSubmenu, { direction })
        await user.click(screen.getByRole('button', { name: 'Toggle' }))
        const submenuTrigger = screen.getByTestId('submenu-trigger')
        submenuTrigger.focus()
        fireEvent.keyDown(submenuTrigger, { key: openKey })
        await waitFor(() => {
          expect(screen.queryByTestId('submenu')).toBeInTheDocument()
        })
        const submenuItem = screen.getByTestId('submenu-item-1')
        submenuItem.focus()
        fireEvent.keyDown(submenuItem, { key: closeKey })
        await waitFor(() => {
          expect(screen.queryByTestId('submenu')).not.toBeInTheDocument()
        })
      })
    })
  })

  describe('nested menus', () => {
    it('closes the entire tree when clicking outside the deepest submenu', async () => {
      const user = userEvent.setup()
      render(ComplexSubmenuOutside)

      await openComplexToDeepestSubmenu(user)

      await waitFor(() => {
        expect(screen.getByTestId('nested-submenu')).toBeInTheDocument()
      })

      await user.click(screen.getByTestId('outside'))

      await waitFor(() => {
        expect(screen.queryByTestId('menu')).toBe(null)
        expect(screen.queryByTestId('submenu')).toBe(null)
        expect(screen.queryByTestId('nested-submenu')).toBe(null)
      })
    })

    it('closes submenus when focus is lost by shift-tabbing from a nested menu', async () => {
      const user = userEvent.setup()
      render(MenuWithComplexSubmenu)

      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      await screen.findByTestId('menu')
      expect(screen.queryByTestId('submenu')).toBe(null)

      await user.keyboard('[ArrowDown]')
      await user.keyboard('[ArrowDown]')
      await user.keyboard('[ArrowDown]')
      await user.keyboard('[ArrowDown]')
      const submenuTrigger = await screen.findByTestId('submenu-trigger')
      await waitFor(() => expect(submenuTrigger).toHaveFocus())
      await user.keyboard('[ArrowRight]')

      const submenuItem = await screen.findByTestId('item-4_1')
      await waitFor(() => expect(submenuItem).toHaveFocus())

      await user.keyboard('{Shift>}{Tab}{/Shift}')

      await waitFor(() => expect(screen.queryByTestId('submenu')).toBe(null))
      await waitFor(() => expect(submenuTrigger).toHaveFocus())
    })

    it.skipIf(isJSDOM)('returns focus to submenu triggers when closing nested menus', async () => {
      const user = userEvent.setup()
      render(MenuWithComplexSubmenu)

      const { submenuTrigger1, submenuTrigger2 } = await openComplexToDeepestSubmenu(user)

      await user.keyboard('[ArrowLeft]')
      await waitFor(() => expect(screen.queryByTestId('nested-submenu')).toBe(null))
      expect(submenuTrigger2).toHaveFocus()

      await user.keyboard('[ArrowLeft]')
      await waitFor(() => expect(screen.queryByTestId('submenu')).toBe(null))
      expect(submenuTrigger1).toHaveFocus()
    })

    const horizontalCases = [
      { orientation: 'horizontal', direction: 'ltr', openKey: 'ArrowDown', closeKey: 'ArrowUp' },
      { orientation: 'horizontal', direction: 'rtl', openKey: 'ArrowDown', closeKey: 'ArrowUp' }
    ] as const

    horizontalCases.forEach(({ orientation, direction, openKey, closeKey }) => {
      it.skipIf(isJSDOM)(
        `opens a nested ${orientation} ${direction.toUpperCase()} menu with ${openKey} and closes it with ${closeKey}`,
        async () => {
          const user = userEvent.setup()
          render(HorizontalSubmenu, { direction, orientation })

          const submenuTrigger = screen.getByTestId('submenu-trigger')
          submenuTrigger.focus()
          await waitFor(() => expect(submenuTrigger).toHaveFocus())

          await user.keyboard(`[${openKey}]`)
          await screen.findByTestId('submenu')
          await waitFor(() => expect(screen.getByTestId('item-4_1')).toHaveFocus())

          await user.keyboard(`[${closeKey}]`)
          expect(screen.queryByTestId('submenu')).toBe(null)
          expect(submenuTrigger).toHaveFocus()
        }
      )
    })
  })

  it('uses the trigger text for text navigation', async () => {
    const user = userEvent.setup()
    render(SubmenuLabel)

    screen.getByText('Alpha').focus()
    await user.keyboard('r')

    await waitFor(() => expect(screen.getByTestId('submenu-trigger')).toHaveFocus())
  })

  it('sets tabindex to 0 on the submenu trigger after opening the submenu with a keydown event', async () => {
    const user = userEvent.setup()
    render(MenuWithComplexSubmenu)

    await user.click(screen.getByRole('button', { name: 'Toggle' }))

    const submenuTrigger = screen.getByTestId('submenu-trigger')
    submenuTrigger.focus()
    fireEvent.keyDown(submenuTrigger, { key: 'ArrowRight' })

    await waitFor(() => {
      expect(submenuTrigger).toHaveAttribute('tabindex', '0')
    })
  })

  describe('prop: disabled', () => {
    it('renders with disabled attributes when the disabled prop is set', async () => {
      const user = userEvent.setup()
      render(MenuWithSubmenu, { submenuTriggerDisabled: true })

      await user.click(screen.getByRole('button', { name: 'Toggle' }))

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      expect(submenuTrigger).toHaveAttribute('data-disabled')
      expect(submenuTrigger).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not open on hover when disabled', async () => {
      const user = userEvent.setup()
      render(MenuWithSubmenu, { submenuTriggerDisabled: true, submenuDelay: 0 })

      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      await screen.findByTestId('menu')

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      fireEvent.mouseEnter(submenuTrigger)
      fireEvent.mouseMove(submenuTrigger)
      await tick()

      expect(screen.queryByTestId('submenu')).toBe(null)
    })
  })

  describe('prop: closeParentOnEsc', () => {
    it('closes only the submenu and keeps the parent open when Escape is pressed with closeParentOnEsc=false (default)', async () => {
      const user = userEvent.setup()
      render(MenuWithComplexSubmenu)

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      trigger.focus()

      await user.keyboard('[ArrowDown]')
      await waitFor(() => expect(screen.getByTestId('item-1')).toHaveFocus())

      await user.keyboard('[ArrowDown]')
      await user.keyboard('[ArrowDown]')
      await user.keyboard('[ArrowDown]')
      await waitFor(() => expect(screen.getByTestId('submenu-trigger')).toHaveFocus())

      await user.keyboard('[ArrowRight]')
      await waitFor(() => expect(screen.getByTestId('item-4_1')).toHaveFocus())

      await user.keyboard('[Escape]')
      await waitFor(() => {
        expect(screen.queryByTestId('submenu')).not.toBeInTheDocument()
      })
      expect(screen.getByTestId('menu')).toBeInTheDocument()
      await waitFor(() => expect(screen.getByTestId('submenu-trigger')).toHaveFocus())

      await user.keyboard('[Escape]')
      await waitFor(() => {
        expect(screen.queryByTestId('menu')).not.toBeInTheDocument()
      })
    })

    it('closes the parent menu when the Escape key is pressed if closeParentOnEsc=true', async () => {
      const user = userEvent.setup()
      render(MenuWithComplexSubmenu, { closeParentOnEsc: true })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      trigger.focus()

      await user.keyboard('[ArrowDown]')
      await waitFor(() => expect(screen.getByTestId('item-1')).toHaveFocus())

      await user.keyboard('[ArrowDown]')
      await waitFor(() => expect(screen.getByTestId('item-2')).toHaveFocus())

      await user.keyboard('[ArrowDown]')
      await waitFor(() => expect(screen.getByTestId('item-3')).toHaveFocus())

      await user.keyboard('[ArrowDown]')
      await waitFor(() => expect(screen.getByTestId('submenu-trigger')).toHaveFocus())

      await user.keyboard('[ArrowRight]')
      await waitFor(() => expect(screen.getByTestId('item-4_1')).toHaveFocus())

      await user.keyboard('[Escape]')

      await waitFor(() => {
        expect(screen.queryByTestId('submenu')).not.toBeInTheDocument()
      })
      await waitFor(() => {
        expect(screen.queryByTestId('menu')).not.toBeInTheDocument()
      })
    })
  })

  describe('prop: openOnHover', () => {
    it('opens the submenu on hover with zero delay', async () => {
      const user = userEvent.setup()
      render(MenuWithSubmenu, { submenuDelay: 0 })

      await user.click(screen.getByRole('button', { name: 'Toggle' }))

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      await user.hover(submenuTrigger)

      await waitFor(() => {
        expect(screen.queryByTestId('submenu')).not.toBe(null)
      })
    })
  })
})
