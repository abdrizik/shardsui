import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import AsMenubar from './fixtures/as-menubar.svelte'
import ContainedTriggerMenubar from './fixtures/contained-trigger-menubar.svelte'
import DetachedTriggerMenubar from './fixtures/detached-trigger-menubar.svelte'
import DisabledItemMenubar from './fixtures/disabled-item-menubar.svelte'
import FirstDisabledMenubar from './fixtures/first-disabled-menubar.svelte'
import MenubarSideProbe from './fixtures/menubar-side-probe.svelte'
import MultipleContainedTriggersMenubar from './fixtures/multiple-contained-triggers-menubar.svelte'
import OpenChangeSpyMenubar from './fixtures/open-change-spy-menubar.svelte'
import ScrollLockHandoff from './fixtures/scroll-lock-handoff.svelte'
import ScrollLockMenubar from './fixtures/scroll-lock-menubar.svelte'
import TriggerlessMenubar from './fixtures/triggerless-menubar.svelte'

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

const isScrollLocked = (doc: Document) =>
  doc.documentElement.style.overflow === 'hidden' ||
  doc.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
  doc.body.style.overflow === 'hidden'

describe('<Menubar />', () => {
  describe('prop: as', () => {
    it('renders the element given by as', () => {
      render(AsMenubar)

      const root = screen.getByTestId('menubar-root')
      expect(root.tagName).toBe('NAV')
      expect(root).toHaveAttribute('role', 'menubar')
    })
  })

  it('ignores a delayed touch click immediately after focus opens another menu', async () => {
    const user = userEvent.setup()
    render(ContainedTriggerMenubar)

    await user.click(screen.getByTestId('file-trigger'))
    await screen.findByTestId('file-menu')

    const editTrigger = screen.getByTestId('edit-trigger')

    vi.useFakeTimers()
    try {
      editTrigger.focus()
      await vi.advanceTimersByTimeAsync(0)
      screen.getByTestId('edit-menu')

      fireEvent(
        editTrigger,
        new PointerEvent('click', { bubbles: true, cancelable: true, pointerType: 'touch' })
      )
      await vi.advanceTimersByTimeAsync(0)
      expect(screen.queryByTestId('edit-menu')).not.toBe(null)

      await vi.advanceTimersByTimeAsync(310)
    } finally {
      vi.useRealTimers()
    }

    fireEvent(
      editTrigger,
      new PointerEvent('click', { bubbles: true, cancelable: true, pointerType: 'touch' })
    )

    await waitFor(() => {
      expect(screen.queryByTestId('edit-menu')).toBe(null)
    })
  })

  it('keeps focus on an outside target when a triggerless menubar menu closes', async () => {
    const user = userEvent.setup()
    render(TriggerlessMenubar)

    const outside = screen.getByTestId('outside')
    expect(screen.getByTestId('triggerless-menu')).toHaveAttribute('data-open')

    await user.click(outside)

    await waitFor(() => {
      expect(screen.getByTestId('triggerless-menu')).not.toHaveAttribute('data-open')
    })
    expect(outside).toHaveFocus()
  })

  describe.each([
    { name: 'contained triggers', TestMenubar: ContainedTriggerMenubar },
    { name: 'detached triggers', TestMenubar: DetachedTriggerMenubar },
    { name: 'multiple contained triggers', TestMenubar: MultipleContainedTriggersMenubar }
  ])('when using $name', ({ TestMenubar }) => {
    it('reports the menubar as the root owner of every menu it contains', async () => {
      const user = userEvent.setup()
      render(TestMenubar)

      const menubarId = screen.getByTestId('menubar-root').id

      await user.click(screen.getByTestId('file-trigger'))
      await screen.findByTestId('file-menu')

      expect(screen.getByRole('menu')).toHaveAttribute('data-rootownerid', menubarId)
    })

    describe.skipIf(isJSDOM)('click interactions', () => {
      it('opens the menu after clicking on its trigger and closes it when clicking again', async () => {
        const user = userEvent.setup()
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')

        await user.click(fileTrigger)
        await screen.findByTestId('file-menu')

        await user.click(fileTrigger)
        await waitFor(() => {
          expect(screen.queryByTestId('file-menu')).toBeNull()
        })
      })
    })

    describe.skipIf(isJSDOM)('hover behavior', () => {
      it('does not open submenus on hover when no submenu is already open', async () => {
        const user = userEvent.setup()
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        await user.hover(fileTrigger)

        expect(screen.queryByTestId('file-menu')).toBeNull()
      })

      it('opens submenus on hover when another submenu is already open', async () => {
        const user = userEvent.setup()
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        await user.click(fileTrigger)

        await screen.findByTestId('file-menu')
        await waitFor(() => {
          expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open')
        })

        const editTrigger = screen.getByTestId('edit-trigger')
        await user.hover(editTrigger)

        await waitFor(() => {
          expect(screen.queryByTestId('edit-menu')).not.toBeNull()
        })
        expect(screen.queryByTestId('file-menu')).toBeNull()

        const viewTrigger = screen.getByTestId('view-trigger')
        await user.hover(viewTrigger)

        await waitFor(() => {
          expect(screen.queryByTestId('view-menu')).not.toBeNull()
        })
        expect(screen.queryByTestId('edit-menu')).toBeNull()
      })

      it('opens nested submenus on hover when parent menu is open', async () => {
        const user = userEvent.setup()
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        await user.click(fileTrigger)

        await waitFor(() => {
          expect(screen.getByTestId('file-menu')).not.toBeNull()
        })
        await waitFor(() => {
          expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open')
        })

        await wait(50)

        const shareTrigger = await screen.findByTestId('share-trigger')
        await user.hover(shareTrigger)

        await waitFor(() => {
          expect(screen.queryByTestId('share-menu')).not.toBeNull()
        })
      })

      it('opens another menu on hover when a nested submenu is open', async () => {
        const user = userEvent.setup()
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        await user.click(fileTrigger)

        await waitFor(() => {
          expect(screen.getByTestId('file-menu')).not.toBeNull()
        })
        await waitFor(() => {
          expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open')
        })

        const shareTrigger = await screen.findByTestId('share-trigger')
        await user.hover(shareTrigger)

        await waitFor(() => {
          expect(screen.queryByTestId('share-menu')).not.toBeNull()
        })

        await user.hover(screen.getByTestId('share-item-1'))

        const editTrigger = screen.getByTestId('edit-trigger')
        await user.hover(editTrigger)

        await waitFor(() => {
          expect(screen.queryByTestId('edit-menu')).not.toBeNull()
        })
        expect(screen.queryByTestId('file-menu')).toBeNull()
        expect(screen.queryByTestId('share-menu')).toBeNull()
      })
    })

    describe('focus behavior', () => {
      it('focuses a menubar trigger without immediately opening the menu', async () => {
        const user = userEvent.setup()
        render(TestMenubar)

        await user.tab()

        await waitFor(() => {
          const fileTrigger = screen.getByTestId('file-trigger')
          expect(fileTrigger).toHaveFocus()
          expect(screen.queryByTestId('file-menu')).toBeNull()
        })

        await wait(50)

        await user.keyboard('{Enter}')
        await waitFor(() => {
          expect(screen.queryByTestId('file-menu')).not.toBeNull()
        })
      })
    })

    describe.skipIf(isJSDOM)('closeOnClick on nested items behavior', () => {
      it('respects closeOnClick on nested items when the menu was opened on click', async () => {
        const { userEvent: user } = await import('vitest/browser')
        render(TestMenubar)

        const viewTrigger = screen.getByTestId('view-trigger')
        await user.click(viewTrigger)
        await screen.findByTestId('view-menu')

        const layoutTrigger = screen.getByTestId('layout-trigger')
        await user.hover(layoutTrigger)
        await screen.findByTestId('layout-menu')

        const layoutItem2 = screen.getByTestId('layout-item-2')
        await user.click(layoutItem2)

        await waitFor(() => {
          expect(screen.queryByTestId('layout-menu')).not.toBeNull()
        })
      })

      it('respects closeOnClick on nested items when the menu was opened on hover', async () => {
        const { userEvent: user } = await import('vitest/browser')
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        const viewTrigger = screen.getByTestId('view-trigger')

        await user.click(fileTrigger)
        await screen.findByTestId('file-menu')

        await user.hover(viewTrigger)
        await screen.findByTestId('view-menu')

        const layoutTrigger = screen.getByTestId('layout-trigger')
        await user.hover(layoutTrigger)
        await screen.findByTestId('layout-menu')

        const layoutItem2 = screen.getByTestId('layout-item-2')
        await user.click(layoutItem2)

        await waitFor(() => {
          expect(screen.queryByTestId('layout-menu')).not.toBeNull()
        })
      })
    })

    describe('keyboard interactions', () => {
      it('navigates between menubar triggers with arrow keys', async () => {
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        fileTrigger.focus()

        fireEvent.keyDown(fileTrigger, { key: 'ArrowRight', code: 'ArrowRight' })

        await waitFor(() => {
          expect(screen.getByTestId('edit-trigger')).toHaveFocus()
        })
      })

      it('moves focus to the first and last triggers with Home and End', async () => {
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        const viewTrigger = screen.getByTestId('view-trigger')

        fileTrigger.focus()

        fireEvent.keyDown(fileTrigger, { key: 'End', code: 'End' })
        await waitFor(() => {
          expect(viewTrigger).toHaveFocus()
        })

        fireEvent.keyDown(viewTrigger, { key: 'Home', code: 'Home' })
        await waitFor(() => {
          expect(fileTrigger).toHaveFocus()
        })
      })

      it('opens the menu with the Space key', async () => {
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        fileTrigger.focus()

        fireEvent.keyDown(fileTrigger, { key: ' ', code: 'Space' })

        await waitFor(() => {
          expect(screen.getByTestId('file-menu')).toBeInTheDocument()
        })
      })

      it('navigates within the menu with arrow keys and opens the submenu with ArrowRight', async () => {
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        fileTrigger.focus()
        fireEvent.keyDown(fileTrigger, { key: 'Enter', code: 'Enter' })

        await waitFor(() => {
          expect(screen.getByTestId('file-menu')).toBeInTheDocument()
        })

        await waitFor(() => {
          expect(screen.getByTestId('file-item-1')).toHaveFocus()
        })

        fireEvent.keyDown(screen.getByTestId('file-item-1'), {
          key: 'ArrowDown',
          code: 'ArrowDown'
        })
        await waitFor(() => expect(screen.getByTestId('file-item-2')).toHaveFocus())

        fireEvent.keyDown(screen.getByTestId('file-item-2'), {
          key: 'ArrowDown',
          code: 'ArrowDown'
        })
        await waitFor(() => {
          expect(screen.getByTestId('share-trigger')).toHaveFocus()
        })

        fireEvent.keyDown(screen.getByTestId('share-trigger'), {
          key: 'ArrowRight',
          code: 'ArrowRight'
        })
        await waitFor(() => {
          expect(screen.getByTestId('share-menu')).toBeInTheDocument()
        })

        await waitFor(() => {
          expect(screen.getByTestId('share-item-1')).toHaveFocus()
        })
      })

      it.skipIf(isJSDOM)('closes the menu with the Escape key', async () => {
        const user = userEvent.setup()
        render(TestMenubar)

        await user.click(screen.getByTestId('file-trigger'))

        await waitFor(() => {
          expect(screen.getByTestId('file-menu')).toBeInTheDocument()
        })

        fireEvent.keyDown(screen.getByTestId('file-trigger'), { key: 'Escape', code: 'Escape' })

        await waitFor(() => {
          expect(screen.queryByTestId('file-menu')).toBeNull()
        })
      })

      it('closes the submenu with ArrowLeft and returns focus to the submenu trigger', async () => {
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        fileTrigger.focus()
        fireEvent.keyDown(fileTrigger, { key: 'Enter', code: 'Enter' })

        await waitFor(() => {
          expect(screen.getByTestId('file-menu')).toBeInTheDocument()
        })
        await waitFor(() => {
          expect(screen.getByTestId('file-item-1')).toHaveFocus()
        })

        fireEvent.keyDown(screen.getByTestId('file-item-1'), {
          key: 'ArrowDown',
          code: 'ArrowDown'
        })
        await waitFor(() => expect(screen.getByTestId('file-item-2')).toHaveFocus())

        fireEvent.keyDown(screen.getByTestId('file-item-2'), {
          key: 'ArrowDown',
          code: 'ArrowDown'
        })
        const shareTrigger = screen.getByTestId('share-trigger')
        await waitFor(() => {
          expect(shareTrigger).toHaveFocus()
        })

        fireEvent.keyDown(shareTrigger, { key: 'ArrowRight', code: 'ArrowRight' })
        await waitFor(() => {
          expect(screen.getByTestId('share-menu')).toBeInTheDocument()
        })

        fireEvent.keyDown(screen.getByTestId('share-item-1'), {
          key: 'ArrowLeft',
          code: 'ArrowLeft'
        })

        await waitFor(() => {
          expect(screen.queryByTestId('share-menu')).toBeNull()
        })
        await waitFor(() => {
          expect(shareTrigger).toHaveFocus()
        })
      })

      it.skipIf(!isJSDOM)(
        'navigates between menus using left/right arrow keys when menus are open',
        async () => {
          const user = userEvent.setup()
          render(TestMenubar)

          const fileTrigger = screen.getByTestId('file-trigger')
          fileTrigger.focus()

          await user.keyboard('{Enter}')

          await waitFor(() => {
            expect(screen.queryByTestId('file-menu')).not.toBeNull()
          })

          await user.keyboard('{ArrowRight}')

          await waitFor(() => {
            expect(screen.queryByTestId('file-menu')).toBeNull()
          })
          await waitFor(() => {
            expect(screen.queryByTestId('edit-menu')).not.toBeNull()
          })
        }
      )
    })

    describe.skipIf(!isJSDOM)('mixed mouse and keyboard interactions', () => {
      it('allows keyboard navigation after opening a menu with a mouse click', async () => {
        const user = userEvent.setup()
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        await user.click(fileTrigger)

        await waitFor(() => {
          expect(screen.queryByTestId('file-menu')).not.toBeNull()
        })

        await waitFor(() => {
          expect(screen.getByRole('menu')).toHaveFocus()
        })

        await user.keyboard('{ArrowDown}')
        await waitFor(() => {
          expect(screen.getByTestId('file-item-1')).toHaveFocus()
        })

        await user.keyboard('{ArrowDown}')
        await waitFor(() => {
          expect(screen.getByTestId('file-item-2')).toHaveFocus()
        })
      })

      it('allows clicking a menu trigger then navigating to another menu with the keyboard', async () => {
        const user = userEvent.setup()
        render(TestMenubar)

        await user.click(screen.getByTestId('file-trigger'))
        await waitFor(() => {
          expect(screen.getByTestId('file-menu')).toBeInTheDocument()
        })

        await user.keyboard('{ArrowRight}')

        await waitFor(() => {
          expect(screen.queryByTestId('file-menu')).toBeNull()
        })
        await waitFor(() => {
          expect(screen.getByTestId('edit-menu')).toBeInTheDocument()
        })
      })
    })

    describe.skipIf(!isJSDOM)('touch interactions', () => {
      it('closes the entire tree on a single outside press after opening a submenu', async () => {
        render(TestMenubar, { outside: true })

        const fileTrigger = screen.getByTestId('file-trigger')
        fireEvent.pointerDown(fileTrigger, { pointerType: 'touch' })
        fireEvent.mouseDown(fileTrigger)

        await screen.findByTestId('file-menu')

        const shareTrigger = await screen.findByTestId('share-trigger')
        fireEvent.pointerDown(shareTrigger, { pointerType: 'touch' })
        fireEvent.mouseDown(shareTrigger)

        await screen.findByTestId('share-menu')

        const outside = screen.getByTestId('outside')
        fireEvent.pointerDown(outside, { pointerType: 'touch' })
        fireEvent.mouseDown(outside)

        await waitFor(() => {
          expect(screen.queryByTestId('share-menu')).toBeNull()
          expect(screen.queryByTestId('file-menu')).toBeNull()
        })
      })
    })

    describe.skipIf(!isJSDOM)('prop: loopFocus', () => {
      describe('when loopFocus == true', () => {
        it('loops around to the first trigger after the last one', async () => {
          render(TestMenubar, { loopFocus: true })

          const fileTrigger = screen.getByTestId('file-trigger')
          fileTrigger.focus()

          fireEvent.keyDown(fileTrigger, { key: 'ArrowRight', code: 'ArrowRight' })
          const editTrigger = screen.getByTestId('edit-trigger')
          await waitFor(() => expect(editTrigger).toHaveFocus())

          fireEvent.keyDown(editTrigger, { key: 'ArrowRight', code: 'ArrowRight' })
          const viewTrigger = screen.getByTestId('view-trigger')
          await waitFor(() => expect(viewTrigger).toHaveFocus())

          fireEvent.keyDown(viewTrigger, { key: 'ArrowRight', code: 'ArrowRight' })
          await waitFor(() => {
            expect(fileTrigger).toHaveFocus()
          })
        })

        it('loops around to the last trigger after the first one', async () => {
          render(TestMenubar, { loopFocus: true })

          const fileTrigger = screen.getByTestId('file-trigger')
          fileTrigger.focus()

          fireEvent.keyDown(fileTrigger, { key: 'ArrowLeft', code: 'ArrowLeft' })

          await waitFor(() => {
            expect(screen.getByTestId('view-trigger')).toHaveFocus()
          })
        })
      })

      describe('when loopFocus == false', () => {
        it('stays on the last trigger when navigating beyond it', async () => {
          render(TestMenubar, { loopFocus: false })

          const fileTrigger = screen.getByTestId('file-trigger')
          fileTrigger.focus()

          fireEvent.keyDown(fileTrigger, { key: 'ArrowRight', code: 'ArrowRight' })
          const editTrigger = screen.getByTestId('edit-trigger')
          await waitFor(() => expect(editTrigger).toHaveFocus())

          fireEvent.keyDown(editTrigger, { key: 'ArrowRight', code: 'ArrowRight' })
          const viewTrigger = screen.getByTestId('view-trigger')
          await waitFor(() => expect(viewTrigger).toHaveFocus())

          fireEvent.keyDown(viewTrigger, { key: 'ArrowRight', code: 'ArrowRight' })
          await waitFor(() => {
            expect(viewTrigger).toHaveFocus()
          })
        })

        it('stays on the first trigger when navigating before it', async () => {
          render(TestMenubar, { loopFocus: false })

          const fileTrigger = screen.getByTestId('file-trigger')
          fileTrigger.focus()

          fireEvent.keyDown(fileTrigger, { key: 'ArrowLeft', code: 'ArrowLeft' })
          expect(fileTrigger).toHaveFocus()
        })
      })
    })

    describe('prop: disabled', () => {
      it('disables child menus when the menubar is disabled', async () => {
        const user = userEvent.setup()
        render(TestMenubar, { disabled: true })

        const fileTrigger = screen.getByTestId('file-trigger')

        expect(fileTrigger).toHaveAttribute('disabled')

        await user.tab()
        expect(fileTrigger).not.toHaveFocus()
        expect(document.body).toHaveFocus()

        await user.click(fileTrigger)
        expect(screen.queryByTestId('file-menu')).toBeNull()
      })
    })

    it.skipIf(isJSDOM)(
      'correctly opens new menu on hover after clicking on its trigger and entering from hover (#2222)',
      async () => {
        const user = userEvent.setup()
        render(TestMenubar)

        const fileTrigger = screen.getByTestId('file-trigger')
        const editTrigger = screen.getByTestId('edit-trigger')
        await user.click(fileTrigger)

        await waitFor(() => {
          expect(screen.queryByTestId('file-menu')).not.toBeNull()
        })
        await waitFor(() => {
          expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open')
        })

        await user.hover(editTrigger)
        await waitFor(() => {
          expect(screen.queryByTestId('edit-menu')).not.toBeNull()
        })

        await user.click(editTrigger)
        await waitFor(() => {
          expect(screen.queryByTestId('edit-menu')).toBeNull()
        })
        await waitFor(() => {
          expect(screen.getByRole('menubar')).not.toHaveAttribute('data-has-submenu-open')
        })

        await user.click(fileTrigger)
        await waitFor(() => {
          expect(screen.queryByTestId('file-menu')).not.toBeNull()
        })
        await waitFor(() => {
          expect(screen.getByRole('menubar')).toHaveAttribute('data-has-submenu-open')
        })

        await user.hover(editTrigger)
        await waitFor(() => {
          expect(screen.queryByTestId('edit-menu')).not.toBeNull()
        })
      }
    )

    describe('role', () => {
      it("sets role='menubar' on the root element", () => {
        render(TestMenubar)
        expect(screen.getByRole('menubar')).toBeInTheDocument()
      })

      it('sets aria-orientation on the root element', () => {
        render(TestMenubar, { orientation: 'vertical' })
        expect(screen.getByRole('menubar')).toHaveAttribute('aria-orientation', 'vertical')
      })

      it("sets role='menuitem' on menu triggers", () => {
        render(TestMenubar)
        expect(screen.getAllByRole('menuitem')).toHaveLength(3)
      })
    })
  })

  describe.skipIf(!isJSDOM)('keyboard navigation between open menus', () => {
    it('closes an open submenu and its parent when ArrowRight moves to the next menubar item', async () => {
      const rootOnOpenChange = vi.fn()
      const submenuOnOpenChange = vi.fn()
      const nextOnOpenChange = vi.fn()

      const user = userEvent.setup()
      render(OpenChangeSpyMenubar, {
        onRootOpenChange: rootOnOpenChange,
        onSubmenuOpenChange: submenuOnOpenChange,
        onNextOpenChange: nextOnOpenChange
      })

      const fileTrigger = screen.getByTestId('menubar-file-trigger')
      fileTrigger.focus()

      await user.keyboard('{Enter}')
      await screen.findByTestId('menubar-file-menu')

      await waitFor(() => {
        expect(screen.getByTestId('menubar-file-item')).toHaveFocus()
      })

      await user.keyboard('{ArrowDown}')
      const submenuTrigger = screen.getByTestId('menubar-submenu-trigger')
      await waitFor(() => {
        expect(submenuTrigger).toHaveFocus()
      })

      await user.keyboard('{ArrowRight}')
      await screen.findByTestId('menubar-submenu-menu')

      await waitFor(() => {
        expect(screen.getByTestId('menubar-submenu-item')).toHaveFocus()
      })

      await user.keyboard('{ArrowRight}')

      await screen.findByTestId('menubar-next-menu')

      await waitFor(() => {
        expect(screen.queryByTestId('menubar-submenu-menu')).toBeNull()
      })

      await waitFor(() => {
        expect(screen.queryByTestId('menubar-file-menu')).toBeNull()
      })

      expect(submenuOnOpenChange.mock.lastCall?.[0]).toBe(false)
      expect(rootOnOpenChange.mock.lastCall?.[0]).toBe(false)
      expect(nextOnOpenChange.mock.lastCall?.[0]).toBe(true)
    })
  })

  describe.skipIf(isJSDOM)('scroll locking', () => {
    it('applies scroll lock when a touch-opened submenu covers the viewport width', async () => {
      render(ScrollLockMenubar, { width: 'calc(100vw - 10px)' })

      const trigger = screen.getByTestId('file-trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.mouseDown(trigger)

      const menu = await screen.findByRole('menu')
      const doc = menu.ownerDocument

      await waitFor(() => {
        expect(isScrollLocked(doc)).toBe(true)
      })
    })

    it('does not apply scroll lock when a touch-opened submenu is narrower than the viewport', async () => {
      render(ScrollLockMenubar, { width: '240px' })

      const trigger = screen.getByTestId('file-trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.mouseDown(trigger)

      const menu = await screen.findByRole('menu')
      const doc = menu.ownerDocument

      await waitFor(() => {
        expect(isScrollLocked(doc)).toBe(false)
      })
    })

    it('updates scroll lock when handing off between top-level touch-opened menus', async () => {
      render(ScrollLockHandoff)

      const fileTrigger = screen.getByTestId('file-trigger')
      const editTrigger = screen.getByTestId('edit-trigger')
      const doc = fileTrigger.ownerDocument

      fireEvent.pointerDown(fileTrigger, { pointerType: 'touch' })
      fireEvent.mouseDown(fileTrigger)

      await screen.findByTestId('file-menu')

      await waitFor(() => {
        expect(isScrollLocked(doc)).toBe(true)
      })

      fireEvent.pointerDown(editTrigger, { pointerType: 'touch' })
      fireEvent.mouseDown(editTrigger)

      await screen.findByTestId('edit-menu')

      await waitFor(() => {
        expect(screen.queryByTestId('file-menu')).toBeNull()
      })

      await waitFor(() => {
        expect(isScrollLocked(doc)).toBe(false)
      })
    })
  })

  describe('disabled state', () => {
    it('keeps the menubar reachable when the first trigger is disabled', async () => {
      const user = userEvent.setup()
      render(FirstDisabledMenubar)

      const fileTrigger = screen.getByTestId('file-trigger')
      const editTrigger = screen.getByTestId('edit-trigger')

      expect(fileTrigger).toHaveAttribute('disabled')
      expect(fileTrigger).toHaveAttribute('tabindex', '-1')
      expect(editTrigger).toHaveAttribute('tabindex', '0')

      await user.tab()
      expect(editTrigger).toHaveFocus()
    })

    it('marks the items of an already-open menu as disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      render(DisabledItemMenubar, { open: true, onItemClick: handleClick })

      const item = await screen.findByTestId('file-item')
      expect(item).toHaveAttribute('aria-disabled', 'true')

      await user.click(item)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })
})

describe.skipIf(isJSDOM)('Menu.Positioner — Menubar parent', () => {
  it('uses bottom as the default side when the menubar is horizontal', async () => {
    let side = 'none'
    render(MenubarSideProbe, {
      onSide: (value: string) => {
        side = value
      }
    })

    await waitFor(() => expect(side).toBe('bottom'))
  })

  it('uses inline-end as the default side when the menubar is vertical', async () => {
    let side = 'none'
    render(MenubarSideProbe, {
      orientation: 'vertical',
      onSide: (value: string) => {
        side = value
      }
    })

    await waitFor(() => expect(side).toBe('inline-end'))
  })
})
