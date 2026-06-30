import { Menu } from '$lib/components/menu'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { describe, expect, it, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import DetachedMenuPayload from './fixtures/detached-menu-payload.svelte'
import DetachedMenuTriggers from './fixtures/detached-menu-triggers.svelte'
import DetachedTriggerAfterRoot from './fixtures/detached-trigger-after-root.svelte'
import HandleTriggerWithoutRoot from './fixtures/handle-trigger-without-root.svelte'
import MultiTriggerControlled from './fixtures/multi-trigger-controlled.svelte'
import MultiTriggerDeepSubmenu from './fixtures/multi-trigger-deep-submenu.svelte'
import MultiTriggerInitiallyOpen from './fixtures/multi-trigger-initially-open.svelte'
import MultiTriggerSubmenu from './fixtures/multi-trigger-submenu.svelte'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

function multiTriggerSuite(detached: boolean) {
  it('allows controlling the menu state programmatically', async () => {
    const user = userEvent.setup()
    render(MultiTriggerControlled, { detached })

    await user.click(screen.getByRole('button', { name: 'Open Trigger 1' }))
    await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

    await user.click(screen.getByRole('button', { name: 'Open Trigger 2' }))
    await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

    await user.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => expect(screen.queryByTestId('content')).toBe(null))
  })

  it('allows setting an initially open menu', async () => {
    render(MultiTriggerInitiallyOpen, { detached })

    await waitFor(() => expect(screen.getByTestId('popup-content').textContent).toBe('2'))
  })

  describe('nested menus', () => {
    it('supports keyboard navigation from any trigger', async () => {
      const user = userEvent.setup()
      render(MultiTriggerSubmenu, { detached })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      await user.click(trigger1)
      await screen.findByTestId('menu')

      await user.keyboard('[ArrowDown]')
      await user.keyboard('[ArrowDown]')

      const submenuTrigger = await screen.findByTestId('submenu-trigger')
      await waitFor(() => expect(submenuTrigger).toHaveFocus())

      await user.keyboard('[ArrowRight]')

      const submenuItem = await screen.findByTestId('submenu-item')
      await waitFor(() => expect(submenuItem).toHaveFocus())

      await user.keyboard('[ArrowLeft]')
      await waitFor(() => expect(screen.queryByTestId('submenu')).toBe(null))
      expect(submenuTrigger).toHaveFocus()

      await user.keyboard('[Escape]')
      await waitFor(() => expect(screen.queryByTestId('menu')).toBe(null))

      await user.click(trigger2)
      await screen.findByTestId('menu')
    })

    it('opens a submenu with the mouse when hover is disabled', async () => {
      const user = userEvent.setup()
      render(MultiTriggerSubmenu, { detached, submenuOpenOnHover: false })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      await user.click(trigger1)
      await screen.findByTestId('menu')
      expect(screen.queryByTestId('submenu')).toBe(null)

      await user.click(screen.getByTestId('submenu-trigger'))

      const submenuItem = await screen.findByTestId('submenu-item')
      expect(submenuItem.textContent?.trim()).toBe('Nested')

      await user.click(submenuItem)
      await waitFor(() => expect(screen.queryByTestId('menu')).toBe(null))

      await user.click(trigger2)
      await screen.findByTestId('menu')
      expect(screen.queryByTestId('submenu')).toBe(null)
    })

    it('closes every level when clicking outside the deepest submenu', async () => {
      const user = userEvent.setup()
      render(MultiTriggerDeepSubmenu, { detached })

      await user.click(screen.getByRole('button', { name: 'Trigger 1' }))
      await screen.findByTestId('level-1')

      await user.keyboard('[ArrowDown]')
      await user.keyboard('[ArrowDown]')

      const submenuTrigger1 = await screen.findByTestId('submenu-trigger-1')
      await waitFor(() => expect(submenuTrigger1).toHaveFocus())

      await user.keyboard('[ArrowRight]')
      await screen.findByTestId('level-2')

      await user.keyboard('[ArrowDown]')
      const submenuTrigger2 = await screen.findByTestId('submenu-trigger-2')
      await waitFor(() => expect(submenuTrigger2).toHaveFocus())

      await user.keyboard('[ArrowRight]')
      await screen.findByTestId('level-3')

      await user.click(screen.getByTestId('outside'))
      await waitFor(() => {
        expect(screen.queryByTestId('level-1')).toBe(null)
        expect(screen.queryByTestId('level-2')).toBe(null)
        expect(screen.queryByTestId('level-3')).toBe(null)
      })
    })

    it('allows selecting nested items via click, drag, release', async () => {
      const user = userEvent.setup()
      const onSubmenuItemClick = vi.fn()
      render(MultiTriggerSubmenu, { detached, onSubmenuItemClick })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      fireEvent.mouseDown(trigger1)
      fireEvent.click(trigger1, { detail: 1 })

      await screen.findByTestId('menu')

      const submenuTrigger = await screen.findByTestId('submenu-trigger')
      await user.hover(submenuTrigger)
      await screen.findByTestId('submenu')

      await wait(250)

      fireEvent.mouseUp(await screen.findByTestId('submenu-item'))

      await waitFor(() => expect(screen.queryByTestId('menu')).toBe(null))
      expect(onSubmenuItemClick).toHaveBeenCalledTimes(1)

      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      await user.click(trigger2)
      await screen.findByTestId('menu')
    })
  })
}

describe('<Menu.Root />', () => {
  describe.skipIf(isJSDOM)('multiple triggers within Root', () => {
    multiTriggerSuite(false)
  })

  describe.skipIf(isJSDOM)('multiple detached triggers', () => {
    multiTriggerSuite(true)
  })

  describe.skipIf(isJSDOM)('Menu — detached triggers', () => {
    it('opens the menu with any (detached) trigger', async () => {
      render(DetachedMenuTriggers)

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })
      const trigger3 = screen.getByRole('button', { name: 'Trigger 3' })

      expect(screen.queryByRole('menu')).toBe(null)

      await fireEvent.click(trigger1)
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
      await fireEvent.click(screen.getByRole('menuitem', { name: 'Close' }))
      await waitFor(() => expect(screen.queryByRole('menu')).toBe(null))

      await fireEvent.click(trigger2)
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
      await fireEvent.click(screen.getByRole('menuitem', { name: 'Close' }))
      await waitFor(() => expect(screen.queryByRole('menu')).toBe(null))

      await fireEvent.click(trigger3)
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
      await fireEvent.click(screen.getByRole('menuitem', { name: 'Close' }))
      await waitFor(() => expect(screen.queryByRole('menu')).toBe(null))
    })

    it('sets the payload and renders content based on its value', async () => {
      render(DetachedMenuPayload)

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      await fireEvent.click(trigger1)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('1'))

      await fireEvent.click(screen.getByTestId('content'))
      await waitFor(() => expect(screen.queryByRole('menu')).toBe(null))

      await fireEvent.click(trigger2)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))
    })

    it('reuses the popup and positioner DOM nodes when switching triggers', async () => {
      render(DetachedMenuPayload)

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      await fireEvent.click(trigger1)
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
      const popupElement = screen.getByTestId('popup')
      const positionerElement = screen.getByTestId('positioner')

      await fireEvent.click(trigger2)
      await waitFor(() => expect(screen.getByTestId('content').textContent).toBe('2'))

      expect(screen.getByTestId('popup')).toBe(popupElement)
      expect(screen.getByTestId('positioner')).toBe(positionerElement)
    })

    it('opens and closes via the imperative handle', async () => {
      const handle = new Menu.Handle<number>()
      render(DetachedMenuPayload, { handle })

      const trigger1 = screen.getByRole('button', { name: 'Trigger 1' })
      const trigger2 = screen.getByRole('button', { name: 'Trigger 2' })

      expect(screen.queryByRole('menu')).toBe(null)
      expect(handle.isOpen).toBe(false)

      handle.open('trigger-2')
      await tick()
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBe(null))

      expect(handle.isOpen).toBe(true)
      expect(screen.getByTestId('content').textContent).toBe('2')
      expect(trigger2).toHaveAttribute('aria-expanded', 'true')
      expect(trigger1).not.toHaveAttribute('aria-expanded', 'true')

      handle.close()
      await tick()
      await waitFor(() => expect(screen.queryByRole('menu')).toBe(null))

      expect(handle.isOpen).toBe(false)
      expect(trigger2).toHaveAttribute('aria-expanded', 'false')
    })

    it('allows setting an initially open menu', async () => {
      render(DetachedMenuPayload, { open: true, triggerId: 'trigger-2' })

      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())
      expect(screen.getByTestId('content').textContent).toBe('2')
    })
  })

  describe.skipIf(isJSDOM)('Menu — detached trigger registration', () => {
    it('registers a detached trigger declared after the root', async () => {
      const user = userEvent.setup()
      render(DetachedTriggerAfterRoot)

      const trigger = screen.getByRole('button', { name: 'Trigger' })

      await user.click(trigger)
      await screen.findByRole('menu')

      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    })

    it('ignores imperative handle calls while no root is mounted', async () => {
      const handle = new Menu.Handle()
      render(HandleTriggerWithoutRoot, { handle })

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      handle.open('trigger-1')
      expect(handle.isOpen).toBe(false)

      handle.close()
      expect(handle.isOpen).toBe(false)
      expect(
        warnSpy.mock.calls.filter((call) =>
          call.some(
            (arg) => typeof arg === 'string' && arg.includes('no root using this handle is mounted')
          )
        )
      ).toHaveLength(2)
      warnSpy.mockRestore()

      await fireEvent.click(screen.getByRole('button', { name: 'Trigger 1' }))
      expect(handle.isOpen).toBe(true)
    })
  })
})
