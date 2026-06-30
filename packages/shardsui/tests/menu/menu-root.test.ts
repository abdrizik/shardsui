import { PATIENT_CLICK_THRESHOLD } from '$lib/internal/constants'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { describe, expect, it, vi } from 'vitest'
import { popupConformanceTests } from '../popup-conformance'
import { isJSDOM } from '../test-utils'
import BasicMenu from './fixtures/basic-menu.svelte'
import Conformance from './fixtures/conformance.svelte'
import ControlledOpener from './fixtures/controlled-opener.svelte'
import DefaultOpenMenu from './fixtures/default-open-menu.svelte'
import DiacriticMenu from './fixtures/diacritic-menu.svelte'
import DisabledMenuItemKinds from './fixtures/disabled-menu-item-kinds.svelte'
import DisabledMenu from './fixtures/disabled-menu.svelte'
import FocusGuard from './fixtures/focus-guard.svelte'
import GroupedFruitsMenu from './fixtures/grouped-fruits-menu.svelte'
import HiddenItemMenu from './fixtures/hidden-item-menu.svelte'
import HiddenTextNavigationMenu from './fixtures/hidden-text-navigation-menu.svelte'
import HighlightOffSubmenu from './fixtures/highlight-off-submenu.svelte'
import KeepMountedMenu from './fixtures/keep-mounted-menu.svelte'
import MenuAnimatedOpenChangeComplete from './fixtures/menu-animated-open-change-complete.svelte'
import MenuCheckedVeto from './fixtures/menu-checked-veto.svelte'
import MenuOpenVeto from './fixtures/menu-open-veto.svelte'
import MenuRadioValueVeto from './fixtures/menu-radio-value-veto.svelte'
import MenuWithComplexSubmenu from './fixtures/menu-with-complex-submenu.svelte'
import MenuWithDisabledItems from './fixtures/menu-with-disabled-items.svelte'
import MenuWithDynamicItems from './fixtures/menu-with-dynamic-items.svelte'
import MenuWithItemHandlers from './fixtures/menu-with-item-handlers.svelte'
import MenuWithNestedAlertDialog from './fixtures/menu-with-nested-alert-dialog.svelte'
import MenuWithNestedDialog from './fixtures/menu-with-nested-dialog.svelte'
import MenuWithOpenChangeComplete from './fixtures/menu-with-open-change-complete.svelte'
import MenuWithOpenOnHoverTrigger from './fixtures/menu-with-open-on-hover-trigger.svelte'
import MenuWithOutsideTarget from './fixtures/menu-with-outside-target.svelte'
import MenuWithSubmenu from './fixtures/menu-with-submenu.svelte'
import NonStringifiableMenu from './fixtures/non-stringifiable-menu.svelte'
import ScrollLockMenu from './fixtures/scroll-lock-menu.svelte'
import SubmenuKeepMountedPositioner from './fixtures/submenu-keep-mounted-positioner.svelte'
import TextNavigationMenu from './fixtures/text-navigation-menu.svelte'
import TransitionPopupMenu from './fixtures/transition-popup-menu.svelte'

async function openMenuAndFocusPopup(
  user: ReturnType<typeof userEvent.setup>,
  triggerName = 'Toggle'
) {
  await user.click(screen.getByRole('button', { name: triggerName }))
  const popup = screen.getByRole('menu')
  await waitFor(() => expect(popup).toHaveFocus(), { timeout: 3000 })
  return popup
}

describe('<Menu.Root />', () => {
  popupConformanceTests({
    component: Conformance,
    triggerMouseAction: 'click',
    expectedPopupRole: 'menu'
  })

  describe('open state', () => {
    it('opens when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(BasicMenu)
      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      expect(screen.getByRole('menu')).toHaveAttribute('data-open')
    })

    it('opens initially when open=true', () => {
      render(BasicMenu, { open: true })
      expect(screen.getByRole('menu')).toBeInTheDocument()
      expect(screen.getByRole('menu')).toHaveAttribute('data-open')
    })
  })

  describe('keyboard navigation', () => {
    it('changes the highlighted item using the arrow keys', async () => {
      const user = userEvent.setup()
      render(BasicMenu)
      const popup = await openMenuAndFocusPopup(user)

      fireEvent.keyDown(popup, { key: 'ArrowDown' })
      await waitFor(() =>
        expect(screen.getByTestId('item-1')).toHaveAttribute('data-highlighted', '')
      )
      expect(screen.getByTestId('item-1')).toHaveAttribute('tabindex', '0')
      expect(screen.getByTestId('item-2')).toHaveAttribute('tabindex', '-1')

      fireEvent.keyDown(screen.getByTestId('item-1'), { key: 'ArrowDown' })
      await waitFor(() =>
        expect(screen.getByTestId('item-2')).toHaveAttribute('data-highlighted', '')
      )

      fireEvent.keyDown(screen.getByTestId('item-2'), { key: 'ArrowDown' })
      await waitFor(() =>
        expect(screen.getByTestId('item-3')).toHaveAttribute('data-highlighted', '')
      )

      fireEvent.keyDown(screen.getByTestId('item-3'), { key: 'ArrowUp' })
      await waitFor(() =>
        expect(screen.getByTestId('item-2')).toHaveAttribute('data-highlighted', '')
      )
    })

    it('changes the highlighted item using the Home and End keys', async () => {
      const user = userEvent.setup()
      render(BasicMenu)
      const popup = await openMenuAndFocusPopup(user)

      fireEvent.keyDown(popup, { key: 'End' })
      await waitFor(() =>
        expect(screen.getByTestId('item-5')).toHaveAttribute('data-highlighted', '')
      )

      fireEvent.keyDown(screen.getByTestId('item-5'), { key: 'Home' })
      await waitFor(() =>
        expect(screen.getByTestId('item-1')).toHaveAttribute('data-highlighted', '')
      )
    })

    it.skipIf(isJSDOM)('navigates across grouped items with arrow keys and text', async () => {
      const user = userEvent.setup()
      render(GroupedFruitsMenu)

      screen.getByRole('button', { name: 'Toggle' }).focus()
      await user.keyboard('[Enter]')

      const apple = screen.getByRole('menuitem', { name: 'Apple' })
      const banana = screen.getByRole('menuitem', { name: 'Banana' })
      const cherry = screen.getByRole('menuitem', { name: 'Cherry' })

      await waitFor(() => expect(apple).toHaveFocus())

      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(banana).toHaveFocus())

      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(cherry).toHaveFocus())

      apple.focus()
      await user.keyboard('c')
      await waitFor(() => expect(cherry).toHaveFocus())
    })

    it('marks the popup instant when an item is activated by keyboard', async () => {
      const user = userEvent.setup()
      render(KeepMountedMenu)

      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      const popup = screen.getByTestId('menu')
      await waitFor(() => expect(popup).toHaveAttribute('data-open'))
      expect(popup).not.toHaveAttribute('data-instant')

      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(screen.getByTestId('item-1')).toHaveFocus())

      await user.keyboard('[Enter]')

      await waitFor(() => expect(popup).not.toHaveAttribute('data-open'))
      expect(popup).toHaveAttribute('data-instant', 'click')
    })
  })

  describe('prop: modal', () => {
    it('renders an internal backdrop when true', async () => {
      const user = userEvent.setup()
      render(BasicMenu, { modal: true })
      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBe(null))

      const positioner = screen.getByTestId('menu-positioner')
      expect(positioner.previousElementSibling).toHaveAttribute('role', 'presentation')
    })

    it('does not render an internal backdrop when false', async () => {
      const user = userEvent.setup()
      render(BasicMenu, { modal: false })
      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      await waitFor(() => expect(screen.queryByRole('menu')).not.toBe(null))

      const positioner = screen.getByTestId('menu-positioner')
      expect(positioner.previousElementSibling).toBe(null)
    })
  })

  describe('prop: highlightItemOnHover', () => {
    it('highlights an item on mouse move by default', async () => {
      const user = userEvent.setup()
      render(BasicMenu)
      await openMenuAndFocusPopup(user)

      const item2 = screen.getByTestId('item-2')
      fireEvent.mouseMove(item2, { movementX: 1 })

      await waitFor(
        () => {
          expect(item2).toHaveAttribute('data-highlighted', '')
        },
        { timeout: 2000 }
      )
    })

    it('does not highlight items from mouse movement when disabled', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: false, highlightItemOnHover: false })
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      const item1 = screen.getByTestId('item-1')
      fireEvent.mouseMove(item1)

      await new Promise((r) => setTimeout(r, 50))
      expect(item1).not.toHaveAttribute('data-highlighted')
    })

    it('does not highlight submenu triggers from mouse enter when disabled', async () => {
      render(HighlightOffSubmenu)

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      fireEvent.mouseEnter(submenuTrigger)

      await tick()

      expect(submenuTrigger).not.toHaveAttribute('data-highlighted')
      expect(submenuTrigger).not.toHaveFocus()
    })
  })

  it('includes disabled items during keyboard navigation', async () => {
    const user = userEvent.setup()
    render(MenuWithDisabledItems)
    const popup = await openMenuAndFocusPopup(user, 'Open')

    fireEvent.keyDown(popup, { key: 'ArrowDown' })
    await waitFor(() =>
      expect(screen.getByTestId('item-1')).toHaveAttribute('data-highlighted', '')
    )

    fireEvent.keyDown(screen.getByTestId('item-1'), { key: 'ArrowDown' })

    await waitFor(
      () => {
        expect(screen.getByTestId('item-2')).toHaveAttribute('data-highlighted', '')
      },
      { timeout: 2000 }
    )
    expect(screen.getByTestId('item-2')).toHaveAttribute('aria-disabled', 'true')
  })

  describe('nested popups', () => {
    it('keeps the menu and dialog open when pressing Shift+Tab inside a nested dialog', async () => {
      const user = userEvent.setup()
      render(MenuWithNestedDialog)

      const menuTrigger = screen.getByTestId('menu-trigger')
      await user.click(menuTrigger)

      await waitFor(() => {
        expect(screen.queryByTestId('menu-popup')).not.toBeNull()
      })

      const dialogTrigger = screen.getByTestId('dialog-trigger')
      await user.click(dialogTrigger)

      await waitFor(() => {
        expect(screen.queryByTestId('dialog-popup')).not.toBeNull()
      })

      const dialogButton = screen.getByTestId('dialog-button')
      dialogButton.focus()

      await waitFor(() => {
        expect(dialogButton).toHaveFocus()
      })
      await user.keyboard('{Shift>}{Tab}{/Shift}')
      await waitFor(() => {
        expect(screen.queryByTestId('menu-popup')).not.toBeNull()
        expect(screen.queryByTestId('dialog-popup')).not.toBeNull()
      })
    })
  })

  describe('focus guards', () => {
    it('closes the menu and moves focus to the next element when tabbing forward from the open menu', async () => {
      const user = userEvent.setup()
      render(FocusGuard, { modal: false })

      await user.click(screen.getByRole('button', { name: 'Toggle' }))
      await screen.findByTestId('menu')

      const menuItem = screen.getByTestId('item-1')
      menuItem.focus()

      await user.tab()

      expect(screen.getByTestId('after')).toHaveFocus()
      await waitFor(() => expect(screen.queryByTestId('menu')).toBe(null))
    })

    it('closes the menu and moves focus to the trigger when shift-tabbing from the open menu', async () => {
      const user = userEvent.setup()
      render(FocusGuard)

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      await user.click(trigger)
      await screen.findByTestId('menu')

      const menuItem = screen.getByTestId('item-1')
      menuItem.focus()

      await user.keyboard('{Shift>}{Tab}{/Shift}')

      await waitFor(() => expect(trigger).toHaveFocus())
      await waitFor(() => expect(screen.queryByTestId('menu')).toBe(null))
    })
  })

  describe('controlled open', () => {
    it('returns focus to the opener when a menu is opened programmatically', async () => {
      const user = userEvent.setup()
      render(ControlledOpener)

      const opener = screen.getByRole('button', { name: 'Open menu programmatically' })
      await user.click(opener)

      await waitFor(() => expect(screen.queryByRole('menu')).not.toBe(null))

      await user.click(screen.getByRole('menuitem', { name: 'Close menu' }))

      await waitFor(() => expect(screen.queryByRole('menu')).toBe(null))
      expect(opener).toHaveFocus()
    })

    it('does not close after hovering out of a popup opened externally (controlled)', async () => {
      render(BasicMenu, { open: true })

      await waitFor(() => expect(screen.queryByRole('menu')).not.toBe(null))

      const positioner = screen.getByTestId('menu-positioner')
      fireEvent.mouseEnter(positioner)
      fireEvent.mouseLeave(positioner)

      expect(screen.queryByRole('menu')).not.toBe(null)
    })
  })

  describe('hover close', () => {
    it('closes after hovering out of a popup opened by its trigger', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 0, modal: false })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => expect(screen.queryByRole('menu')).not.toBe(null))

      const positioner = screen.getByTestId('menu-positioner')
      fireEvent.mouseEnter(positioner)
      fireEvent.mouseLeave(positioner)

      await waitFor(() => expect(screen.queryByRole('menu')).toBe(null))
    })
  })

  describe('prop: disabled', () => {
    it('marks items as disabled when controlled open', () => {
      render(DisabledMenuItemKinds)

      expect(screen.getByTestId('item')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('checkbox-item')).toHaveAttribute('data-disabled')
      expect(screen.getByTestId('radio-item')).toHaveAttribute('data-disabled')
    })

    it('does not highlight items with text navigation when controlled open', async () => {
      const user = userEvent.setup()
      render(DisabledMenu, { open: true, disabled: true })

      const alpha = screen.getByTestId('alpha')
      const beta = screen.getByTestId('beta')

      alpha.focus()

      await user.keyboard('b')
      await tick()

      expect(beta).not.toHaveAttribute('data-highlighted')
      expect(beta).not.toHaveFocus()
    })

    it('does not close or activate items when controlled open', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      const onItemClick = vi.fn()
      render(DisabledMenu, { open: true, disabled: true, onOpenChange, onItemClick })

      await user.click(screen.getByTestId('beta'))

      expect(onItemClick).not.toHaveBeenCalled()
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('disables submenu triggers when controlled open', async () => {
      const user = userEvent.setup()
      render(DisabledMenu, { open: true, disabled: true })

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      expect(submenuTrigger).toHaveAttribute('data-disabled')

      await user.click(submenuTrigger)

      expect(screen.queryByTestId('submenu-popup')).toBe(null)
    })
  })

  describe('focus management', () => {
    it.skipIf(isJSDOM)(
      'focuses the trigger after the menu is closed but not unmounted',
      async () => {
        const user = userEvent.setup()
        render(KeepMountedMenu)

        const trigger = screen.getByRole('button', { name: 'Toggle' })
        await user.click(trigger)
        await waitFor(() => expect(screen.getByTestId('menu')).toHaveAttribute('data-open'))

        await user.click(screen.getByTestId('item-1'))

        await waitFor(() => expect(screen.getByTestId('menu')).not.toHaveAttribute('data-open'))
        expect(screen.getByTestId('menu')).toBeInTheDocument()
        await waitFor(() => expect(trigger).toHaveFocus())
      }
    )
  })

  describe('prop: openOnHover', () => {
    it('does not clear body pointer-events styles when closing a scoped submenu', async () => {
      render(MenuWithSubmenu, { open: true, submenuDelay: 0, submenuCloseDelay: 0 })

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      fireEvent.mouseEnter(submenuTrigger)
      fireEvent.mouseMove(submenuTrigger)

      await waitFor(() => expect(screen.queryByTestId('submenu')).not.toBe(null))

      const previousBodyPointerEvents = document.body.style.pointerEvents
      try {
        document.body.style.pointerEvents = 'none'

        const sibling = screen.getByTestId('item-2')
        fireEvent.mouseMove(sibling)

        await waitFor(() => expect(screen.queryByTestId('submenu')).toBe(null))

        expect(document.body.style.pointerEvents).toBe('none')
      } finally {
        document.body.style.pointerEvents = previousBodyPointerEvents
      }
    })

    it('scopes submenu safePolygon pointer events to the parent menu with a keepMounted positioner', async () => {
      render(SubmenuKeepMountedPositioner)

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      fireEvent.mouseEnter(submenuTrigger)
      fireEvent.mouseMove(submenuTrigger)

      await waitFor(() => expect(screen.getByTestId('submenu')).not.toBe(null))

      await waitFor(() => expect(screen.getByTestId('menu').style.pointerEvents).toBe('none'))
      expect(screen.getByTestId('submenu-positioner').style.pointerEvents).toBe('auto')
      expect(screen.getByTestId('item-3').style.pointerEvents).toBe('')
    })

    it('does not close when the submenu is hovered after the root menu is hovered', async () => {
      render(MenuWithSubmenu, {
        modal: false,
        triggerOpenOnHover: true,
        triggerDelay: 0,
        submenuDelay: 0
      })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => expect(screen.queryByTestId('menu')).not.toBe(null))

      const menu = screen.getByTestId('menu')
      fireEvent.mouseEnter(menu)
      fireEvent.mouseMove(menu)

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      fireEvent.mouseEnter(submenuTrigger)
      fireEvent.mouseMove(submenuTrigger)

      await waitFor(() => expect(screen.queryByTestId('submenu')).not.toBe(null))

      const submenu = screen.getByTestId('submenu')
      fireEvent.mouseMove(menu)
      fireEvent.mouseLeave(menu)
      fireEvent.mouseEnter(submenu)
      fireEvent.mouseMove(submenu)
      await tick()

      expect(screen.queryByTestId('menu')).not.toBe(null)
      expect(screen.queryByTestId('submenu')).not.toBe(null)
    })

    it('keeps the parent submenu open after a third-level submenu closes due to sibling hover', async () => {
      render(MenuWithComplexSubmenu, {
        modal: false,
        triggerOpenOnHover: true,
        triggerDelay: 0,
        submenuDelay: 0
      })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => expect(screen.queryByTestId('menu')).not.toBe(null))

      const level1Trigger = screen.getByTestId('submenu-trigger')
      fireEvent.mouseEnter(level1Trigger)
      fireEvent.mouseMove(level1Trigger)

      await waitFor(() => expect(screen.queryByTestId('submenu')).not.toBe(null))

      const level2Trigger = screen.getByTestId('nested-submenu-trigger')
      fireEvent.mouseEnter(level2Trigger)
      fireEvent.mouseMove(level2Trigger)

      await waitFor(() => expect(screen.queryByTestId('nested-submenu')).not.toBe(null))

      fireEvent.mouseMove(screen.getByTestId('item-4_2'))

      await waitFor(() => expect(screen.queryByTestId('nested-submenu')).toBe(null))

      fireEvent.mouseLeave(screen.getByTestId('submenu'))
      await tick()

      expect(screen.queryByTestId('submenu')).not.toBe(null)
    })
  })

  describe('prop: closeDelay', () => {
    beforeEach(() => {
      vi.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']
      })
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('closes after the delay elapses', async () => {
      render(MenuWithOpenOnHoverTrigger, {
        openOnHover: true,
        delay: 0,
        closeDelay: 100,
        modal: false
      })

      const anchor = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.mouseEnter(anchor)
      fireEvent.mouseMove(anchor)
      await vi.advanceTimersByTimeAsync(0)

      expect(screen.queryByText('Item 1')).not.toBe(null)

      fireEvent.mouseLeave(anchor)

      await vi.advanceTimersByTimeAsync(50)
      expect(screen.queryByText('Item 1')).not.toBe(null)

      await vi.advanceTimersByTimeAsync(50)
      expect(screen.queryByText('Item 1')).toBe(null)
    })

    it('closes the submenu after the delay when hovering a sibling item', async () => {
      render(MenuWithSubmenu, {
        modal: false,
        triggerOpenOnHover: true,
        triggerDelay: 0,
        submenuDelay: 0,
        submenuCloseDelay: 100
      })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)
      await vi.advanceTimersByTimeAsync(0)

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      fireEvent.mouseEnter(submenuTrigger)
      fireEvent.mouseMove(submenuTrigger)
      await vi.advanceTimersByTimeAsync(0)

      expect(screen.queryByTestId('submenu')).not.toBe(null)

      fireEvent.mouseMove(screen.getByTestId('item-1'))

      await vi.advanceTimersByTimeAsync(50)
      expect(screen.queryByTestId('submenu')).not.toBe(null)

      await vi.advanceTimersByTimeAsync(50)
      expect(screen.queryByTestId('submenu')).toBe(null)
    })

    it('does not restart the close delay on repeated mousemove over sibling items', async () => {
      render(MenuWithSubmenu, {
        modal: false,
        triggerOpenOnHover: true,
        triggerDelay: 0,
        submenuDelay: 0,
        submenuCloseDelay: 100
      })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)
      await vi.advanceTimersByTimeAsync(0)

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      fireEvent.mouseEnter(submenuTrigger)
      fireEvent.mouseMove(submenuTrigger)
      await vi.advanceTimersByTimeAsync(0)

      expect(screen.queryByTestId('submenu')).not.toBe(null)

      fireEvent.mouseMove(screen.getByTestId('item-1'))
      await vi.advanceTimersByTimeAsync(50)

      fireEvent.mouseMove(screen.getByTestId('item-2'))
      await vi.advanceTimersByTimeAsync(50)

      expect(screen.queryByTestId('submenu')).toBe(null)
    })
  })

  describe('submenu hover open', () => {
    beforeEach(() => {
      vi.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']
      })
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('opens a submenu after a plain delay without waiting for the pointer to rest', async () => {
      render(MenuWithSubmenu, { open: true, submenuDelay: 100 })

      const submenuTrigger = screen.getByTestId('submenu-trigger')

      fireEvent.mouseEnter(submenuTrigger)
      fireEvent.mouseMove(submenuTrigger, { movementX: 10 })

      await vi.advanceTimersByTimeAsync(40)
      fireEvent.mouseMove(submenuTrigger, { movementX: 10 })
      await vi.advanceTimersByTimeAsync(40)
      fireEvent.mouseMove(submenuTrigger, { movementX: 10 })
      await vi.advanceTimersByTimeAsync(40)

      expect(screen.queryByTestId('submenu')).not.toBe(null)
    })

    it('cancels a pending submenu hover-open when the pointer leaves via mouseout', async () => {
      render(MenuWithSubmenu, { open: true, submenuDelay: 100 })

      const submenuTrigger = screen.getByTestId('submenu-trigger')
      const otherItem = screen.getByTestId('item-1')

      fireEvent.mouseMove(submenuTrigger, { movementX: 10 })
      fireEvent.mouseEnter(submenuTrigger)
      fireEvent.mouseOut(submenuTrigger, { relatedTarget: otherItem })

      await vi.advanceTimersByTimeAsync(200)

      expect(screen.queryByTestId('submenu')).toBe(null)
    })

    it('keeps a pending submenu hover-open when mouseout stays within the trigger', async () => {
      render(MenuWithSubmenu, { open: true, submenuDelay: 100 })

      const submenuTrigger = screen.getByTestId('submenu-trigger')

      fireEvent.mouseMove(submenuTrigger, { movementX: 10 })
      fireEvent.mouseEnter(submenuTrigger)
      fireEvent.mouseOut(submenuTrigger, { relatedTarget: submenuTrigger })

      await vi.advanceTimersByTimeAsync(200)

      expect(screen.queryByTestId('submenu')).not.toBe(null)
    })
  })

  describe('openOnHover modal behavior', () => {
    beforeEach(() => {
      vi.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']
      })
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('reopens on hover after an impatient click closes via item press', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 100, modal: true })

      const trigger = screen.getByRole('button', { name: 'Toggle' })

      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger, { movementX: 10, movementY: 0 })

      await vi.advanceTimersByTimeAsync(100)
      expect(screen.queryByRole('menu')).not.toBe(null)

      await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD - 1)
      fireEvent.click(trigger)
      await vi.advanceTimersByTimeAsync(0)

      fireEvent.click(screen.getByTestId('item-1'))
      await vi.advanceTimersByTimeAsync(0)

      expect(screen.queryByRole('menu')).toBe(null)

      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger, { movementX: 10, movementY: 0 })

      await vi.advanceTimersByTimeAsync(100)
      expect(screen.queryByRole('menu')).not.toBe(null)
    })

    it('treats hover-opened menus as modal after a click', async () => {
      render(MenuWithOpenOnHoverTrigger, { openOnHover: true, delay: 0, modal: true })

      const trigger = screen.getByRole('button', { name: 'Toggle' })

      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)
      await vi.advanceTimersByTimeAsync(0)

      expect(screen.queryByRole('menu')).not.toBe(null)

      const positioner = screen.getByTestId('menu-positioner')
      expect(positioner.previousElementSibling).toBe(null)

      await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD - 1)
      fireEvent.click(trigger)
      await vi.advanceTimersByTimeAsync(0)

      expect(positioner.previousElementSibling).toHaveAttribute('role', 'presentation')
    })
  })

  describe.skipIf(isJSDOM)('prop: onOpenChangeComplete with a real animation', () => {
    let previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED

    beforeEach(() => {
      previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
    })

    afterEach(() => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
    })

    it('is called on open when the enter animation finishes', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(MenuAnimatedOpenChangeComplete, { open: false, onOpenChangeComplete })

      await user.click(screen.getByTestId('open-external'))

      await waitFor(() => expect(onOpenChangeComplete.mock.calls[0]?.[0]).toBe(true))
      expect(screen.queryByTestId('menu')).not.toBeNull()
    })

    it('is called on close when the exit animation finishes', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(MenuAnimatedOpenChangeComplete, { open: true, onOpenChangeComplete })

      await waitFor(() => expect(onOpenChangeComplete.mock.calls[0]?.[0]).toBe(true))

      await user.click(screen.getByTestId('close-external'))

      await waitFor(() => expect(screen.queryByTestId('menu')).toBeNull())
      expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
    })
  })

  describe.skipIf(isJSDOM)('text navigation', () => {
    it('skips items hidden with CSS during keyboard navigation', async () => {
      const user = userEvent.setup()
      render(HiddenItemMenu)

      screen.getByRole('button', { name: 'Toggle' }).focus()
      await user.keyboard('[Enter]')

      const hiddenItem = screen.getByTestId('item-1')
      const item2 = screen.getByTestId('item-2')
      const item3 = screen.getByTestId('item-3')

      await waitFor(() => expect(item2).toHaveFocus())
      expect(hiddenItem).toHaveAttribute('tabindex', '-1')

      await user.keyboard('{ArrowDown}')
      await waitFor(() => expect(item3).toHaveFocus())

      await user.keyboard('{ArrowUp}')
      await waitFor(() => expect(item2).toHaveFocus())
    })

    it('skips items hidden with CSS in text navigation', async () => {
      const user = userEvent.setup()
      render(HiddenTextNavigationMenu, { open: true })

      const hiddenItem = screen.getByTestId('item-hidden')
      const apricotItem = screen.getByTestId('item-apricot')
      const bananaItem = screen.getByTestId('item-banana')

      bananaItem.focus()

      await user.keyboard('a')
      await waitFor(() => expect(apricotItem).toHaveFocus())

      expect(hiddenItem).toHaveAttribute('tabindex', '-1')
    })

    it('changes the highlighted item using textContent typeahead', async () => {
      const user = userEvent.setup()
      render(TextNavigationMenu, { open: true })

      screen.getAllByRole('menuitem')[0].focus()

      await user.keyboard('c')
      await waitFor(() => expect(screen.getByText('Ca')).toHaveFocus())
      expect(screen.getByText('Ca')).toHaveAttribute('tabindex', '0')

      await user.keyboard('d')
      await waitFor(() => expect(screen.getByText('Cd')).toHaveFocus())
      expect(screen.getByText('Cd')).toHaveAttribute('tabindex', '0')
    })

    it('skips the non-stringifiable items', async () => {
      const user = userEvent.setup()
      render(NonStringifiableMenu, { open: true })

      screen.getAllByRole('menuitem')[0].focus()

      await user.keyboard('b')
      await waitFor(() => expect(screen.getByText('Ba')).toHaveFocus())
      expect(screen.getByText('Ba')).toHaveAttribute('tabindex', '0')

      await user.keyboard('c')
      await waitFor(() => expect(screen.getByText('Bc')).toHaveFocus())
      expect(screen.getByText('Bc')).toHaveAttribute('tabindex', '0')
    })

    it('navigate to options with diacritic characters', async () => {
      const user = userEvent.setup()
      render(DiacriticMenu, { open: true })

      screen.getAllByRole('menuitem')[0].focus()

      await user.keyboard('b')
      await waitFor(() => expect(screen.getByText('Ba')).toHaveFocus())
      expect(screen.getByText('Ba')).toHaveAttribute('tabindex', '0')

      await user.keyboard('ą')
      await waitFor(() => expect(screen.getByText('Bą')).toHaveFocus())
      expect(screen.getByText('Bą')).toHaveAttribute('tabindex', '0')
    })
  })

  describe.skipIf(isJSDOM)('scroll locking', () => {
    beforeEach(async () => {
      await waitFor(() => {
        const isScrollLocked =
          document.documentElement.style.overflow === 'hidden' ||
          document.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
          document.body.style.overflow === 'hidden'
        expect(isScrollLocked).toBe(false)
      })
    })

    it('does not apply scroll lock when opened via touch', async () => {
      render(ScrollLockMenu, { width: '240px' })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })

      const menu = await screen.findByRole('menu')
      const doc = menu.ownerDocument

      const isScrollLocked =
        doc.documentElement.style.overflow === 'hidden' ||
        doc.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
        doc.body.style.overflow === 'hidden'

      expect(isScrollLocked).toBe(false)
    })

    it('applies scroll lock when opened via mouse', async () => {
      const user = userEvent.setup()
      render(ScrollLockMenu, { width: '240px' })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      const doc = trigger.ownerDocument

      await user.click(trigger)
      await screen.findByRole('menu')

      await waitFor(() => {
        const isScrollLocked =
          doc.documentElement.style.overflow === 'hidden' ||
          doc.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
          doc.body.style.overflow === 'hidden'
        expect(isScrollLocked).toBe(true)
      })
    })

    it('applies scroll lock when a touch-opened popup covers the viewport width', async () => {
      render(ScrollLockMenu, { width: 'calc(100vw - 10px)' })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })

      const menu = await screen.findByRole('menu')
      const doc = menu.ownerDocument

      await waitFor(() => {
        const isScrollLocked =
          doc.documentElement.style.overflow === 'hidden' ||
          doc.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
          doc.body.style.overflow === 'hidden'
        expect(isScrollLocked).toBe(true)
      })
    })

    it('does not apply scroll lock when a touch-opened popup is narrower than the viewport', async () => {
      render(ScrollLockMenu, { width: '240px' })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })

      const menu = await screen.findByRole('menu')
      const doc = menu.ownerDocument

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

      const isScrollLocked =
        doc.documentElement.style.overflow === 'hidden' ||
        doc.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
        doc.body.style.overflow === 'hidden'

      expect(isScrollLocked).toBe(false)
    })
  })

  describe.skipIf(isJSDOM)('mouse interaction', () => {
    it('triggers a menu item and closes the menu on click, drag, release', async () => {
      const onOpenChange = vi.fn()
      const onItem2Click = vi.fn()
      render(MenuWithItemHandlers, { onOpenChange, onItem2Click })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })

      await waitFor(() => expect(screen.queryByTestId('menu')).not.toBe(null))

      await new Promise((resolve) => setTimeout(resolve, 250))

      fireEvent.mouseUp(screen.getByTestId('item-2'))

      await waitFor(() => expect(screen.queryByTestId('menu')).toBe(null))

      expect(onItem2Click).toHaveBeenCalledTimes(1)
      expect(onOpenChange.mock.calls[0][0]).toBe(true)
      expect(onOpenChange.mock.lastCall?.[0]).toBe(false)
    })

    it('closes the menu on click, drag outside, release', async () => {
      const onOpenChange = vi.fn()
      render(MenuWithOutsideTarget, { onOpenChange })

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })

      await waitFor(() => expect(screen.queryByTestId('menu')).not.toBe(null))

      const outside = screen.getByTestId('outside')
      const bounds = outside.getBoundingClientRect()
      fireEvent.mouseUp(outside, { clientX: bounds.left + 1, clientY: bounds.bottom - 1 })

      await waitFor(() => expect(screen.queryByTestId('menu')).toBe(null))

      expect(onOpenChange.mock.calls.length).toBe(2)
      expect(onOpenChange.mock.calls[0][0]).toBe(true)
      expect(onOpenChange.mock.lastCall?.[0]).toBe(false)
    })
  })

  describe('dynamic items', () => {
    it('skips null items when navigating', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      try {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
        render(MenuWithDynamicItems)

        const trigger = screen.getByText('Toggle')
        trigger.focus()

        await user.keyboard('{ArrowDown}')

        await waitFor(() => {
          expect(screen.queryByRole('menu')).not.toBe(null)
        })

        await vi.advanceTimersByTimeAsync(0)

        await user.keyboard('{ArrowDown}')
        await user.keyboard('{ArrowDown}')
        await user.keyboard('{ArrowDown}')

        expect(screen.queryByRole('menuitem', { name: 'Add to Library' })).toHaveFocus()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe.skipIf(isJSDOM)('prop: onOpenChangeComplete', () => {
    it('is called on close when there is no exit animation defined', async () => {
      const onOpenChangeComplete = vi.fn()
      const { rerender } = render(MenuWithOpenChangeComplete, { open: true, onOpenChangeComplete })

      expect(screen.getByTestId('menu')).toBeInTheDocument()

      await rerender({ open: false })

      await waitFor(() => {
        expect(screen.queryByTestId('menu')).toBe(null)
      })

      expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true)
      expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
    })

    it('is called on open when there is no enter animation defined', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(MenuWithOpenChangeComplete, { onOpenChangeComplete })

      await user.click(screen.getByRole('button', { name: 'Toggle' }))

      await waitFor(() => {
        expect(screen.queryByTestId('menu')).not.toBe(null)
      })

      await waitFor(() => {
        expect(onOpenChangeComplete.mock.calls[0][0]).toBe(true)
      })
    })

    it('does not get called on mount when not open', async () => {
      const onOpenChangeComplete = vi.fn()
      render(MenuWithOpenChangeComplete, { onOpenChangeComplete })

      await Promise.resolve()
      expect(onOpenChangeComplete.mock.calls.length).toBe(0)
    })
  })

  describe('focus management — keyboard open', () => {
    it('focuses the first item after the menu is opened by keyboard', async () => {
      const user = userEvent.setup()
      render(BasicMenu)

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      trigger.focus()

      await user.keyboard('[Enter]')

      const [firstItem, ...otherItems] = screen.getAllByRole('menuitem')
      await waitFor(() => {
        expect(firstItem.tabIndex).toBe(0)
      })
      otherItems.forEach((item) => {
        expect(item.tabIndex).toBe(-1)
      })
    })
  })

  describe('veto via function bindings', () => {
    it('does not open when the open setter rejects the change', async () => {
      const user = userEvent.setup()
      render(MenuOpenVeto)

      await user.click(screen.getByRole('button', { name: 'Toggle' }))

      await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    })

    it('does not toggle a checkbox item when the checked setter rejects the change', async () => {
      const user = userEvent.setup()
      render(MenuCheckedVeto)

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const item = screen.getByTestId('checkbox-item')
      await user.click(item)

      expect(item).toHaveAttribute('aria-checked', 'false')
      expect(item).not.toHaveAttribute('data-checked')
    })

    it('does not select a radio item when the value setter rejects the change', async () => {
      const user = userEvent.setup()
      render(MenuRadioValueVeto)

      await user.click(screen.getByRole('button', { name: 'Open' }))
      const item = screen.getByTestId('radio-item-a')
      await user.click(item)

      expect(item).toHaveAttribute('aria-checked', 'false')
      expect(item).not.toHaveAttribute('data-checked')
    })
  })

  describe('hover out of a popup that was never hovered open', () => {
    it('stays open when the pointer leaves a popup opened without trigger hover', async () => {
      render(DefaultOpenMenu)

      await waitFor(() => expect(screen.getByRole('menu')).toBeInTheDocument())

      const positioner = screen.getByTestId('menu-positioner')
      fireEvent.mouseEnter(positioner)
      fireEvent.mouseLeave(positioner)

      expect(screen.getByRole('menu')).toBeInTheDocument()
    })
  })

  describe.skipIf(isJSDOM)('Escape while the closing popup receives mouseleave', () => {
    let previousAnimationsDisabled = false

    beforeEach(() => {
      previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
    })

    afterEach(() => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
    })

    it('focuses the trigger after Escape', async () => {
      const user = userEvent.setup()
      render(TransitionPopupMenu)

      const trigger = screen.getByRole('button', { name: 'Toggle' })
      await user.click(trigger)

      const firstItem = await screen.findByTestId('item-1')
      await user.hover(firstItem)
      fireEvent.mouseMove(firstItem, { movementX: 1 })
      await waitFor(() => expect(firstItem).toHaveFocus())

      await user.keyboard('[Escape]')

      fireEvent.mouseLeave(screen.getByTestId('menu-positioner'), { relatedTarget: document.body })

      await waitFor(() => expect(screen.queryByRole('menu')).toBe(null))
      expect(trigger).toHaveFocus()
    })
  })

  describe.skipIf(isJSDOM)('nested alert dialog', () => {
    it('keeps focus in the alert dialog popup when the pointer leaves the triggering menu item', async () => {
      const user = userEvent.setup()
      render(MenuWithNestedAlertDialog)

      await user.click(screen.getByTestId('menu-trigger'))

      const alertDialogTrigger = await screen.findByTestId('alert-dialog-trigger')
      await user.click(alertDialogTrigger)

      const menuPopup = screen.getByTestId('menu-popup')
      const alertDialogPopup = await screen.findByTestId('alert-dialog-popup')

      await waitFor(() => expect(alertDialogPopup.contains(document.activeElement)).toBe(true))

      fireEvent.pointerLeave(screen.getByTestId('alert-dialog-item'), {
        pointerType: 'mouse',
        relatedTarget: document.body
      })

      await waitFor(() => expect(alertDialogPopup.contains(document.activeElement)).toBe(true))
      expect(menuPopup.contains(document.activeElement)).toBe(false)
    })
  })
})
