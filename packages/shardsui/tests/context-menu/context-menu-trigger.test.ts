import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, vi } from 'vitest'
import { createTouch, fireTouch, isJSDOM } from '../test-utils'
import BackdropContextMenu from './fixtures/backdrop-context-menu.svelte'
import BasicContextMenu from './fixtures/basic-context-menu.svelte'
import DetachedContextMenuTrigger from './fixtures/detached-context-menu-trigger.svelte'
import NestedContextMenu from './fixtures/nested-context-menu.svelte'
import SubmenuContextMenu from './fixtures/submenu-context-menu.svelte'
import TriggerPortalContextMenu from './fixtures/trigger-portal-context-menu.svelte'

vi.mock('$lib/internal/detect-browser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('$lib/internal/detect-browser')>()
  return { ...actual, isMac: true }
})

describe('<ContextMenu.Trigger />', () => {
  describe('prop: as', () => {
    it('renders a div by default and exposes it through ref', async () => {
      let ref: HTMLElement | null = null
      render(BasicContextMenu, { onRef: (element: HTMLElement | null) => (ref = element) })

      expect(screen.getByTestId('trigger').tagName).toBe('DIV')
      await waitFor(() => {
        expect(ref).toBeInstanceOf(HTMLDivElement)
      })
    })

    it('renders the element named by the as prop', () => {
      render(BasicContextMenu, { as: 'span' })
      expect(screen.getByTestId('trigger').tagName).toBe('SPAN')
    })

    it('applies the class and forwards unknown props to the element', () => {
      render(BasicContextMenu, { class: 'custom-class', 'aria-label': 'Surface' })

      const trigger = screen.getByTestId('trigger')
      expect(trigger).toHaveClass('custom-class')
      expect(trigger).toHaveAttribute('aria-label', 'Surface')
    })
  })

  it('throws when rendered outside ContextMenu.Root', () => {
    expect(() => render(DetachedContextMenuTrigger)).toThrow(
      'ShardsUI: this part must be rendered inside <ContextMenu.Root>.'
    )
  })

  it('opens the menu on right click (context menu event)', async () => {
    render(BasicContextMenu)

    fireEvent.contextMenu(screen.getByTestId('trigger'))

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBe(null)
    })
  })

  it('adds open state attributes', async () => {
    const user = userEvent.setup()
    render(BasicContextMenu)

    const trigger = screen.getByTestId('trigger')
    fireEvent.contextMenu(trigger)

    await waitFor(() => {
      expect(trigger).toHaveAttribute('data-popup-open', '')
    })

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(trigger).not.toHaveAttribute('data-popup-open')
    })
  })

  it('calls onOpenChange when the menu is opened via right click', async () => {
    const onOpenChange = vi.fn()
    render(BasicContextMenu, { onOpenChange })

    fireEvent.contextMenu(screen.getByTestId('trigger'))

    await waitFor(() => {
      expect(onOpenChange.mock.lastCall?.[0]).toBe(true)
    })
  })

  it('blocks the native context menu but does not open when an oncontextmenu handler prevents the ShardsUI handler', async () => {
    const oncontextmenu = vi.fn((event: Event) => {
      ;(event as Event & { preventShardsUIHandler(): void }).preventShardsUIHandler()
    })
    render(BasicContextMenu, { oncontextmenu })

    const trigger = screen.getByTestId('trigger')
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    trigger.dispatchEvent(event)

    expect(oncontextmenu).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
    await waitFor(() => {
      expect(screen.queryByRole('menu')).toBeNull()
    })
    expect(trigger).not.toHaveAttribute('data-popup-open')
  })

  it('blocks native context menus on both internal and external backdrops', async () => {
    render(BackdropContextMenu)

    const internalBackdrop = await waitFor(() => {
      const element = document.querySelector(
        '[data-shards-ui-portal] > [data-shards-ui-inert][role="presentation"]'
      )
      expect(element).not.toBe(null)
      return element!
    })
    const externalBackdrop = screen.getByTestId('backdrop')

    const internalEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    const externalEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    const outsideEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })

    internalBackdrop.dispatchEvent(internalEvent)
    externalBackdrop.dispatchEvent(externalEvent)
    document.body.dispatchEvent(outsideEvent)

    expect(internalEvent.defaultPrevented).toBe(true)
    expect(externalEvent.defaultPrevented).toBe(true)
    expect(outsideEvent.defaultPrevented).toBe(false)
  })

  it('blocks native context menus in a portal mounted inside the trigger DOM subtree', async () => {
    render(TriggerPortalContextMenu)

    const popup = await screen.findByTestId('popup')
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    popup.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  describe('mouseup after mousedown outside', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('does not cancel opening the menu before 500ms', async () => {
      vi.useFakeTimers()
      const onOpenChange = vi.fn()
      render(BasicContextMenu, { onOpenChange })

      const trigger = screen.getByTestId('trigger')
      fireEvent.mouseDown(trigger)
      fireEvent.contextMenu(trigger)

      await vi.advanceTimersByTimeAsync(499)

      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(onOpenChange.mock.lastCall?.[0]).toBe(true)

      fireEvent.mouseUp(document.body)

      await vi.advanceTimersByTimeAsync(1)

      expect(onOpenChange).toHaveBeenCalledTimes(1)
    })

    it('cancels opening the menu after 500ms', async () => {
      vi.useFakeTimers()
      const onOpenChange = vi.fn()
      render(BasicContextMenu, { onOpenChange })

      const trigger = screen.getByTestId('trigger')
      fireEvent.mouseDown(trigger)
      fireEvent.contextMenu(trigger)

      await vi.advanceTimersByTimeAsync(501)

      fireEvent.mouseUp(document.body)

      expect(onOpenChange).toHaveBeenCalledTimes(2)
      expect(onOpenChange.mock.lastCall?.[0]).toBe(false)
    })
  })

  describe('mouseup inside the menu', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('keeps the menu open when the context-menu gesture ends inside its positioner', async () => {
      vi.useFakeTimers()
      const onOpenChange = vi.fn()
      render(BasicContextMenu, { onOpenChange })

      fireEvent.contextMenu(screen.getByTestId('trigger'))

      await vi.advanceTimersByTimeAsync(501)

      fireEvent.mouseUp(screen.getByTestId('positioner'))

      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('menu')).not.toBe(null)
    })

    it('keeps the root menu open when the context-menu gesture ends in a portaled submenu', async () => {
      vi.useFakeTimers()
      const rootOnOpenChange = vi.fn()
      render(SubmenuContextMenu, { rootOnOpenChange })

      fireEvent.contextMenu(screen.getByTestId('context-trigger'))

      await vi.advanceTimersByTimeAsync(501)

      fireEvent.mouseUp(screen.getByTestId('context-submenu-popup'))

      expect(rootOnOpenChange).toHaveBeenCalledTimes(1)
      expect(screen.queryByTestId('context-submenu-popup')).not.toBe(null)
    })

    it('aborts the pending document mouseup listener when the trigger unmounts', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      const onOpenChange = vi.fn()
      const { rerender } = render(BasicContextMenu, { onOpenChange })

      fireEvent.contextMenu(screen.getByTestId('trigger'))

      await rerender({ onOpenChange, showTrigger: false })

      await vi.advanceTimersByTimeAsync(501)

      fireEvent.mouseUp(document.body)

      expect(onOpenChange).toHaveBeenCalledTimes(1)
      expect(screen.queryByRole('menu')).not.toBe(null)
    })
  })

  describe('prop: disabled', () => {
    it('does not open on right-click when disabled', async () => {
      const onOpenChange = vi.fn()
      render(BasicContextMenu, { disabled: true, onOpenChange })

      fireEvent.contextMenu(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.queryByTestId('popup')).toBe(null)
      })
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('does not block the native context menu when disabled', async () => {
      render(BasicContextMenu, { disabled: true })

      const trigger = screen.getByTestId('trigger')
      let defaultPrevented = false
      trigger.addEventListener('contextmenu', (event) => {
        defaultPrevented = event.defaultPrevented
      })

      fireEvent.contextMenu(trigger)

      await waitFor(() => {
        expect(defaultPrevented).toBe(false)
      })
    })
  })

  describe.skipIf(isJSDOM)('long press', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('opens the menu on long press on touchscreen devices', async () => {
      render(BasicContextMenu)
      vi.useFakeTimers()

      const trigger = screen.getByTestId('trigger')
      fireTouch(trigger, 'touchstart', {
        touches: [createTouch(trigger, { clientX: 100, clientY: 100 }, 0)]
      })

      await vi.advanceTimersByTimeAsync(500)

      expect(screen.queryByRole('menu')).not.toBe(null)
    })

    it('cancels the long press when the touch moves beyond the threshold', async () => {
      const onOpenChange = vi.fn()
      render(BasicContextMenu, { onOpenChange })
      vi.useFakeTimers()

      const trigger = screen.getByTestId('trigger')
      fireTouch(trigger, 'touchstart', {
        touches: [createTouch(trigger, { clientX: 100, clientY: 100 }, 0)]
      })
      fireTouch(trigger, 'touchmove', {
        touches: [createTouch(trigger, { clientX: 120, clientY: 100 }, 0)]
      })

      await vi.advanceTimersByTimeAsync(500)

      expect(screen.queryByRole('menu')).toBe(null)
      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('keeps a pending long press when touch movement stays within the threshold', async () => {
      render(BasicContextMenu)
      vi.useFakeTimers()

      const trigger = screen.getByTestId('trigger')
      fireTouch(trigger, 'touchstart', {
        touches: [createTouch(trigger, { clientX: 100, clientY: 100 }, 0)]
      })
      fireTouch(trigger, 'touchmove', {
        touches: [createTouch(trigger, { clientX: 105, clientY: 105 }, 0)]
      })

      await vi.advanceTimersByTimeAsync(500)

      expect(screen.queryByRole('menu')).not.toBe(null)
    })

    it('cancels a pending long press when the touch ends', async () => {
      const onOpenChange = vi.fn()
      render(BasicContextMenu, { onOpenChange })
      vi.useFakeTimers()

      const trigger = screen.getByTestId('trigger')
      fireTouch(trigger, 'touchstart', {
        touches: [createTouch(trigger, { clientX: 100, clientY: 100 }, 0)]
      })
      fireTouch(trigger, 'touchend')

      await vi.advanceTimersByTimeAsync(500)

      expect(onOpenChange).not.toHaveBeenCalled()
      expect(screen.queryByRole('menu')).toBe(null)
    })

    it('cancels a pending long press when the gesture becomes multi-touch', async () => {
      const onOpenChange = vi.fn()
      render(BasicContextMenu, { onOpenChange })
      vi.useFakeTimers()

      const trigger = screen.getByTestId('trigger')
      const firstTouch = createTouch(trigger, { clientX: 100, clientY: 100 }, 0)
      const touches = [firstTouch, createTouch(trigger, { clientX: 120, clientY: 100 }, 1)]

      fireTouch(trigger, 'touchstart', { touches: [firstTouch] })
      fireTouch(trigger, 'touchmove', { touches })
      fireTouch(trigger, 'touchmove', { touches: [firstTouch] })

      await vi.advanceTimersByTimeAsync(500)

      expect(onOpenChange).not.toHaveBeenCalled()
      expect(screen.queryByRole('menu')).toBe(null)

      fireTouch(trigger, 'touchend')
      fireTouch(trigger, 'touchstart', { touches: [firstTouch] })
      fireTouch(trigger, 'touchstart', { touches })

      await vi.advanceTimersByTimeAsync(500)

      expect(onOpenChange).not.toHaveBeenCalled()
      expect(screen.queryByRole('menu')).toBe(null)
    })

    it('delays outside-press dismissal after opening from a long press', async () => {
      render(BasicContextMenu)
      vi.useFakeTimers()

      const trigger = screen.getByTestId('trigger')
      fireTouch(trigger, 'touchstart', {
        touches: [createTouch(trigger, { clientX: 100, clientY: 100 }, 0)]
      })

      await vi.advanceTimersByTimeAsync(500)

      fireEvent.mouseDown(document.body)
      expect(screen.queryByRole('menu')).not.toBe(null)

      await vi.advanceTimersByTimeAsync(500)

      fireEvent.mouseDown(document.body)
      await vi.advanceTimersByTimeAsync(0)
      expect(screen.queryByRole('menu')).toBe(null)
    })

    it('does not open on long press when disabled', async () => {
      const onOpenChange = vi.fn()
      render(BasicContextMenu, { disabled: true, onOpenChange })
      vi.useFakeTimers()

      const trigger = screen.getByTestId('trigger')
      fireTouch(trigger, 'touchstart', {
        touches: [createTouch(trigger, { clientX: 100, clientY: 100 }, 0)]
      })

      await vi.advanceTimersByTimeAsync(500)

      expect(screen.queryByTestId('popup')).toBe(null)
      expect(onOpenChange).not.toHaveBeenCalled()
    })
  })

  it('handles nested context menus correctly', async () => {
    render(NestedContextMenu)

    const innerTrigger = screen.getByTestId('inner-trigger')
    const outerTrigger = screen.getByTestId('outer-trigger')

    fireEvent.contextMenu(innerTrigger)

    await waitFor(() => {
      expect(screen.queryByTestId('inner-menu')).not.toBe(null)
    })
    expect(screen.queryByTestId('outer-menu')).toBe(null)

    fireEvent.pointerDown(document.body, { pointerType: 'mouse' })

    await waitFor(() => {
      expect(screen.queryByTestId('inner-menu')).toBe(null)
    })

    fireEvent.contextMenu(outerTrigger)

    await waitFor(() => {
      expect(screen.queryByTestId('outer-menu')).not.toBe(null)
    })
    expect(screen.queryByTestId('inner-menu')).toBe(null)
  })
})
