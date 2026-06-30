import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import CollisionContextMenu from './fixtures/collision-context-menu.svelte'
import OffsetContextMenu from './fixtures/offset-context-menu.svelte'
import SubmenuContextMenu from './fixtures/submenu-context-menu.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return { ...actual, isMac: true }
})

describe('<ContextMenu.Root />', () => {
  it('positions a context menu submenu with the fixed strategy', async () => {
    render(SubmenuContextMenu)
    await fireEvent.contextMenu(screen.getByTestId('context-trigger'))

    const positioner = (await screen.findByTestId('context-submenu-popup')).parentElement
    expect(positioner).not.toBe(null)

    await waitFor(() => {
      const styles = getComputedStyle(positioner as HTMLElement)
      expect(styles.opacity).not.toBe('0')
      expect(styles.position).toBe('fixed')
    })
  })

  describe('interactions', () => {
    it('closes nested submenus when releasing the context menu pointer over an item', async () => {
      const user = userEvent.setup()
      const rootOnOpenChange = vi.fn()
      const submenuOnOpenChange = vi.fn()

      render(SubmenuContextMenu, { rootOnOpenChange, submenuOnOpenChange })

      const trigger = screen.getByTestId('context-trigger')
      fireEvent.contextMenu(trigger, { clientX: 10, clientY: 10, button: 2 })

      await screen.findByTestId('context-root-popup')

      const submenuTrigger = screen.getByTestId('context-submenu-trigger')
      await user.hover(submenuTrigger)

      await screen.findByTestId('context-submenu-popup')

      const submenuItem = screen.getByTestId('context-submenu-item')
      fireEvent.mouseUp(submenuItem, { button: 2 })

      await waitFor(() => {
        expect(screen.queryByTestId('context-submenu-popup')).toBe(null)
      })

      await waitFor(() => {
        expect(screen.queryByTestId('context-root-popup')).toBe(null)
      })

      expect(submenuOnOpenChange.mock.lastCall?.[0]).toBe(false)
      expect(rootOnOpenChange.mock.lastCall?.[0]).toBe(false)
    })

    it('does not activate a submenu trigger when releasing the context menu pointer over it', async () => {
      const submenuOnOpenChange = vi.fn()

      render(SubmenuContextMenu, {
        submenuOnOpenChange,
        submenuOpen: false,
        submenuOpenOnHover: false
      })

      const trigger = screen.getByTestId('context-trigger')
      fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20, button: 2 })
      await screen.findByTestId('context-root-popup')

      fireEvent.pointerMove(document.body, { clientX: 24, clientY: 24 })
      fireEvent.mouseUp(screen.getByTestId('context-submenu-trigger'), {
        button: 2,
        clientX: 24,
        clientY: 24
      })

      await waitFor(() => {
        expect(screen.queryByTestId('context-submenu-popup')).toBe(null)
      })
      expect(submenuOnOpenChange).not.toHaveBeenCalled()
    })

    it('ignores mouseup directly under the cursor when the context menu spawns there', async () => {
      const onOpenChange = vi.fn()
      render(OffsetContextMenu, { onOpenChange, alignOffset: 0 })

      const trigger = screen.getByTestId('context-trigger')
      fireEvent.contextMenu(trigger, { clientX: 12, clientY: 12, button: 2 })

      await screen.findByTestId('context-popup')
      const item = screen.getByTestId('context-item')

      fireEvent.mouseUp(item, { button: 2, clientX: 12, clientY: 12 })

      await waitFor(() => {
        expect(screen.queryByTestId('context-popup')).not.toBe(null)
      })

      expect(onOpenChange).toHaveBeenCalledTimes(1)
    })

    it('ignores mouseup directly under the cursor when alignOffset is negative', async () => {
      const onOpenChange = vi.fn()
      render(OffsetContextMenu, { onOpenChange, alignOffset: -5 })

      const trigger = screen.getByTestId('context-trigger')
      fireEvent.contextMenu(trigger, { clientX: 18, clientY: 18, button: 2 })

      await screen.findByTestId('context-popup')
      const item = screen.getByTestId('context-item')

      fireEvent.mouseUp(item, { button: 2, clientX: 18, clientY: 18 })

      await waitFor(() => {
        expect(screen.queryByTestId('context-popup')).not.toBe(null)
      })

      expect(onOpenChange).toHaveBeenCalledTimes(1)
    })

    it('allows mouseup after leaving the initial cursor point', async () => {
      const onOpenChange = vi.fn()
      render(OffsetContextMenu, { onOpenChange, alignOffset: 0 })

      const trigger = screen.getByTestId('context-trigger')
      fireEvent.contextMenu(trigger, { clientX: 20, clientY: 20, button: 2 })

      await screen.findByTestId('context-popup')
      const item = screen.getByTestId('context-item')

      fireEvent.pointerMove(document.body, { clientX: 24, clientY: 24 })
      fireEvent.mouseUp(item, { button: 2, clientX: 24, clientY: 24 })

      await waitFor(() => {
        expect(screen.queryByTestId('context-popup')).toBe(null)
      })

      expect(onOpenChange.mock.lastCall?.[0]).toBe(false)
    })

    it('does not open when disabled', async () => {
      const onOpenChange = vi.fn()
      render(OffsetContextMenu, { onOpenChange, disabled: true })

      const trigger = screen.getByTestId('context-trigger')
      fireEvent.contextMenu(trigger, { clientX: 10, clientY: 10, button: 2 })

      await waitFor(() => {
        expect(screen.queryByTestId('context-popup')).toBe(null)
      })
      expect(onOpenChange).not.toHaveBeenCalled()
    })
  })

  it('preserves explicit context-menu placement and offsets', async () => {
    render(OffsetContextMenu, { side: 'right', align: 'center', sideOffset: 11, alignOffset: 13 })

    fireEvent.contextMenu(screen.getByTestId('context-trigger'), {
      clientX: 100,
      clientY: 100,
      button: 2
    })

    const positioner = await screen.findByTestId('context-positioner')
    await waitFor(() => {
      expect(positioner).toHaveAttribute('data-side', 'right')
    })
    expect(positioner).toHaveAttribute('data-align', 'center')

    if (!isJSDOM) {
      await waitFor(() => {
        expect(getComputedStyle(positioner).opacity).not.toBe('0')
      })
      const rect = screen.getByTestId('context-popup').getBoundingClientRect()
      expect(rect.left).toBeCloseTo(111, 0)
      expect(Math.abs(rect.top + rect.height / 2 - 113)).toBeLessThanOrEqual(1)
    }
  })

  describe.skipIf(isJSDOM)('prop: collisionAvoidance', () => {
    it('flips to the opposite side when side: flip is set and there is no space', async () => {
      const viewportHeight = window.innerHeight
      // `anchor` is a reserved `render` option, so the props must be nested.
      render(CollisionContextMenu, {
        props: {
          open: true,
          collisionAvoidance: { side: 'flip' },
          anchor: {
            getBoundingClientRect: () =>
              DOMRect.fromRect({ width: 0, height: 0, x: 100, y: viewportHeight - 20 })
          }
        }
      })

      const positioner = screen.getByTestId('positioner')

      await waitFor(() => {
        expect(positioner.getAttribute('data-side')).toBe('top')
      })
    })
  })
})
