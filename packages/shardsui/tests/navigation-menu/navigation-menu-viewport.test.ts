import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { flushSync } from 'svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import DeeplyNested from './fixtures/deeply-nested.svelte'
import IconInitialValue from './fixtures/icon-initial-value.svelte'
import InlineNestedDynamicContentNavigationMenu from './fixtures/inline-nested-dynamic-content-navigation-menu.svelte'
import InlineNested from './fixtures/inline-nested.svelte'
import ScopedPopupExitAnimation from './fixtures/scoped-popup-exit-animation.svelte'
import TabFlow from './fixtures/tab-flow.svelte'
import TabForwardBoundary from './fixtures/tab-forward-boundary.svelte'
import TopLevelLinkScopedAnimation from './fixtures/top-level-link-scoped-animation.svelte'
import ViewportChildrenNavigationMenu from './fixtures/viewport-children-navigation-menu.svelte'
import {
  OPEN_DELAY,
  defineOffsetSize,
  falsyValueCases,
  hoverOpen,
  mockAnimations,
  mockBoundingClientRect,
  mockResizeObserver,
  nextFrame,
  primeOpenPopupSize
} from './helpers'

describe('<NavigationMenu.Viewport />', () => {
  it('renders its own children alongside the relocated content', async () => {
    const user = userEvent.setup()
    render(ViewportChildrenNavigationMenu)

    await user.click(screen.getByTestId('overview-trigger'))

    await waitFor(() => {
      const viewport = screen.getByTestId('nav-viewport')
      expect(within(viewport).getByTestId('overview-content')).toBeInTheDocument()
      expect(within(viewport).getByTestId('viewport-child')).toBeInTheDocument()
    })
  })

  describe('inline nested viewport', () => {
    it('renders viewport content correctly for inline nested menu', async () => {
      render(InlineNested)
      const trigger1 = screen.getByTestId('trigger-1')

      hoverOpen(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const popup1 = screen.getByTestId('popup-1')
      const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
      expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      expect(screen.getByText('Nested Link 1')).not.toBe(null)
    })
    it('switches content in viewport when hovering different nested triggers', async () => {
      render(InlineNested)
      const trigger1 = screen.getByTestId('trigger-1')

      hoverOpen(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const popup1 = screen.getByTestId('popup-1')
      const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')
      const nestedTrigger2 = within(popup1).getByTestId('nested-trigger-2')

      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
      expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)

      hoverOpen(nestedTrigger2)
      await waitFor(() => {
        expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'true')
      })
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByTestId('nested-popup-2')).not.toBe(null)
      expect(screen.queryByTestId('nested-popup-1')).toBe(null)

      hoverOpen(nestedTrigger1)
      await waitFor(() => {
        expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
      })
      expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      expect(screen.queryByTestId('nested-popup-2')).toBe(null)
    })
    it('scopes inline safePolygon pointer events to the submenu list while traversing to the viewport', async () => {
      render(InlineNested)
      const trigger1 = screen.getByTestId('trigger-1')

      hoverOpen(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const nestedList = screen.getByTestId('inline-nested-list')
      const nestedTrigger1 = screen.getByTestId('nested-trigger-1')
      const nestedViewport = screen.getByTestId('inline-nested-viewport')

      mockBoundingClientRect(nestedTrigger1, { x: 0, y: 40, width: 100, height: 40 })
      mockBoundingClientRect(nestedViewport, { x: 200, y: 0, width: 300, height: 300 })
      fireEvent.mouseEnter(nestedTrigger1)

      expect(nestedList.style.pointerEvents).toBe('none')

      fireEvent.mouseLeave(nestedTrigger1, { clientX: 98, clientY: 60 })

      expect(nestedList.style.pointerEvents).toBe('none')
      expect(document.body.style.pointerEvents).toBe('')

      fireEvent.mouseMove(document, { clientX: 150, clientY: 80 })
      await Promise.resolve()

      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
      expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      expect(nestedList.style.pointerEvents).toBe('none')

      fireEvent.mouseEnter(nestedViewport)
      await waitFor(() => {
        expect(nestedList.style.pointerEvents).toBe('')
      })
    })
    it('clears inline safePolygon pointer events when the pointer leaves the traversal path', async () => {
      render(InlineNested)
      const trigger1 = screen.getByTestId('trigger-1')

      hoverOpen(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const nestedList = screen.getByTestId('inline-nested-list')
      const nestedTrigger1 = screen.getByTestId('nested-trigger-1')
      const nestedViewport = screen.getByTestId('inline-nested-viewport')

      mockBoundingClientRect(nestedTrigger1, { x: 0, y: 40, width: 100, height: 40 })
      mockBoundingClientRect(nestedViewport, { x: 200, y: 0, width: 300, height: 300 })
      fireEvent.mouseEnter(nestedTrigger1)

      expect(nestedList.style.pointerEvents).toBe('none')

      fireEvent.mouseLeave(nestedTrigger1, { clientX: 98, clientY: 60 })
      expect(nestedList.style.pointerEvents).toBe('none')

      fireEvent.mouseMove(document, { clientX: 40, clientY: 220 })
      await waitFor(() => {
        expect(nestedList.style.pointerEvents).toBe('')
      })
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
      expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
    })
    it('keeps inline safePolygon pointer events when returning to the original trigger before traversing again', async () => {
      render(InlineNested)
      const trigger1 = screen.getByTestId('trigger-1')

      hoverOpen(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const nestedList = screen.getByTestId('inline-nested-list')
      const nestedTrigger1 = screen.getByTestId('nested-trigger-1')
      const nestedTrigger2 = screen.getByTestId('nested-trigger-2')
      const nestedViewport = screen.getByTestId('inline-nested-viewport')

      mockBoundingClientRect(nestedTrigger1, { x: 0, y: 40, width: 100, height: 40 })
      mockBoundingClientRect(nestedTrigger2, { x: 0, y: 100, width: 100, height: 40 })
      mockBoundingClientRect(nestedViewport, { x: 200, y: 0, width: 300, height: 300 })

      fireEvent.mouseEnter(nestedTrigger1)
      fireEvent.mouseLeave(nestedTrigger1, { clientX: 98, clientY: 60 })
      fireEvent.mouseMove(document, { clientX: 150, clientY: 80 })
      await Promise.resolve()
      fireEvent.mouseEnter(nestedViewport)
      await Promise.resolve()

      hoverOpen(nestedTrigger2)
      await waitFor(() => {
        expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'true')
      })

      hoverOpen(nestedTrigger1)
      await waitFor(() => {
        expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
      })

      fireEvent.mouseLeave(nestedTrigger1, { clientX: 98, clientY: 60 })
      fireEvent.mouseMove(document, { clientX: 150, clientY: 80 })
      await Promise.resolve()

      expect(nestedList.style.pointerEvents).toBe('none')
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
      expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      expect(screen.queryByTestId('nested-popup-2')).toBe(null)
    })
    it('closes inline nested viewport when parent menu closes', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true })
      try {
        render(InlineNested)
        const trigger1 = screen.getByTestId('trigger-1')

        hoverOpen(trigger1)
        await vi.advanceTimersByTimeAsync(OPEN_DELAY)

        const popup1 = screen.getByTestId('popup-1')
        const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')
        expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)

        fireEvent.mouseLeave(trigger1)
        fireEvent.mouseLeave(popup1)
        await vi.advanceTimersByTimeAsync(OPEN_DELAY)

        await waitFor(() => {
          expect(screen.queryByTestId('popup-1')).toBe(null)
        })
        expect(screen.queryByTestId('nested-popup-1')).toBe(null)
        expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      } finally {
        vi.useRealTimers()
      }
    })
    it('maintains inline viewport state when hovering between triggers and content', async () => {
      render(InlineNested)
      const trigger1 = screen.getByTestId('trigger-1')

      hoverOpen(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const popup1 = screen.getByTestId('popup-1')
      const nestedTrigger2 = within(popup1).getByTestId('nested-trigger-2')
      hoverOpen(nestedTrigger2)
      await waitFor(() => {
        expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'true')
      })
      const nestedPopup2 = screen.getByTestId('nested-popup-2')

      hoverOpen(nestedPopup2)
      await Promise.resolve()
      expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'true')
      expect(screen.queryByTestId('nested-popup-2')).not.toBe(null)

      hoverOpen(nestedTrigger2)
      await Promise.resolve()
      expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'true')
      expect(screen.queryByTestId('nested-popup-2')).not.toBe(null)
    })
    it('handles click interactions on inline nested menu triggers', async () => {
      render(InlineNested)
      const trigger1 = screen.getByTestId('trigger-1')

      fireEvent.click(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const popup1 = screen.getByTestId('popup-1')
      const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')

      const nestedTrigger2 = within(popup1).getByTestId('nested-trigger-2')
      fireEvent.click(nestedTrigger2)
      await waitFor(() => {
        expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'true')
      })
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByTestId('nested-popup-2')).not.toBe(null)
      expect(screen.queryByTestId('nested-popup-1')).toBe(null)

      fireEvent.click(nestedTrigger2)
      await Promise.resolve()
      expect(nestedTrigger2).toHaveAttribute('aria-expanded', 'true')
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByTestId('nested-popup-2')).not.toBe(null)
      expect(screen.queryByTestId('nested-popup-1')).toBe(null)
    })
    it('adds popup-open data attributes to the active icon', () => {
      render(IconInitialValue)
      expect(screen.getByTestId('icon-1')).toHaveAttribute('data-popup-open')
      expect(screen.getByTestId('icon-2')).not.toHaveAttribute('data-popup-open')
    })
    it.each(falsyValueCases)(
      'treats a falsy value (%s) as open for inline nested trigger interactions',
      async (_label, itemValue) => {
        render(InlineNested, { initialNestedValue: itemValue, nestedItem1Value: itemValue })
        const trigger1 = screen.getByTestId('trigger-1')

        fireEvent.click(trigger1)
        await waitFor(() => {
          expect(screen.queryByTestId('popup-1')).not.toBe(null)
        })

        const popup1 = screen.getByTestId('popup-1')
        const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')
        expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)

        fireEvent.click(nestedTrigger1)
        await Promise.resolve()

        expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')
        expect(screen.queryByTestId('nested-popup-1')).not.toBe(null)
      }
    )
    it('propagates a nested close with a falsy open value to the parent root', async () => {
      render(InlineNested, {
        initialNestedValue: false,
        nestedItem1Value: false,
        nestedLinkCloseOnClick: true
      })
      const trigger1 = screen.getByTestId('trigger-1')

      fireEvent.click(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const popup1 = screen.getByTestId('popup-1')
      const nestedTrigger1 = within(popup1).getByTestId('nested-trigger-1')
      expect(nestedTrigger1).toHaveAttribute('aria-expanded', 'true')

      fireEvent.click(screen.getByText('Nested Link 1'))
      await waitFor(() => {
        expect(trigger1).toHaveAttribute('aria-expanded', 'false')
      })
      expect(screen.queryByTestId('popup-1')).toBe(null)
    })
    it('allows arrow key navigation with 3+ levels of nesting', async () => {
      const user = userEvent.setup()
      render(DeeplyNested)
      const trigger1 = screen.getByTestId('trigger-1')

      fireEvent.click(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('content-1')).not.toBe(null)
      })

      const link1 = screen.getByTestId('link-1')
      link1.focus()

      await user.keyboard('{ArrowDown}')
      const level2Trigger1 = screen.getByTestId('level2-trigger-1')
      expect(level2Trigger1).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      const level2Trigger2 = screen.getByTestId('level2-trigger-2')
      expect(level2Trigger2).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(level2Trigger1).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(link1).toHaveFocus()

      const level2Content1 = screen.getByTestId('level2-content-1')
      const level2Link1 = within(level2Content1).getByTestId('level2-link-1')
      level2Link1.focus()

      await user.keyboard('{ArrowDown}')
      const level3Trigger1 = screen.getByTestId('level3-trigger-1')
      expect(level3Trigger1).toHaveFocus()

      await user.keyboard('{ArrowDown}')
      const level3Trigger2 = screen.getByTestId('level3-trigger-2')
      expect(level3Trigger2).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(level3Trigger1).toHaveFocus()

      await user.keyboard('{ArrowUp}')
      expect(level2Link1).toHaveFocus()
    })
    it('updates popup sizing when inline nested content is inserted while active', async () => {
      const restoreResizeObserver = mockResizeObserver()
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        render(InlineNestedDynamicContentNavigationMenu)

        fireEvent.click(screen.getByTestId('trigger-1'))
        await waitFor(() => {
          expect(screen.queryByTestId('popup-root')).not.toBe(null)
        })

        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')
        const animations = mockAnimations(popupRoot)

        const popupWidth = 250
        let popupHeight = 120
        defineOffsetSize(
          popupRoot,
          () => popupWidth,
          () => popupHeight
        )

        popupHeight = 220
        animations.start()
        fireEvent.click(screen.getByTestId('insert-content'))

        await waitFor(() => {
          expect(screen.queryByTestId('extra-content')).not.toBe(null)
        })
        await waitFor(() => {
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('220px')
        })

        await animations.finish()

        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('auto')
        })
        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('auto')
        })
        expect(positioner.style.getPropertyValue('--positioner-width')).toBe('250px')
        expect(positioner.style.getPropertyValue('--positioner-height')).toBe('220px')
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        restoreResizeObserver()
      }
    })
    it('does not animate popup sizing when kept nested default content first moves into the portal', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      let setPopupPropertySpy: ReturnType<typeof vi.spyOn> | undefined

      try {
        render(InlineNested, { keepMountedContent: true })
        const trigger1 = screen.getByTestId('trigger-1')

        fireEvent.click(trigger1)
        flushSync()

        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')

        setPopupPropertySpy = vi.spyOn(popupRoot.style, 'setProperty')

        const popupHeightValues = [120, 220]
        const popupWidth = 250
        let popupHeight = 220
        defineOffsetSize(
          popupRoot,
          () => popupWidth,
          () => {
            const next = popupHeightValues.shift()
            if (next != null) popupHeight = next
            return popupHeight
          }
        )

        await waitFor(() => {
          expect(screen.getByTestId('nested-popup-1')).not.toHaveAttribute('hidden')
        })
        await waitFor(() => {
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('220px')
        })

        const calls = setPopupPropertySpy.mock.calls as Array<[string, string, string?]>
        const fixed = calls
          .filter((c) => c[0] === '--popup-height')
          .map((c) => c[1])
          .filter((v) => v !== 'auto' && v !== '0px')

        expect(fixed.length).toBeGreaterThan(0)
        expect(fixed.every((v) => v === '220px')).toBe(true)
      } finally {
        setPopupPropertySpy?.mockRestore()
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })
    it('updates popup sizing when switching kept inline nested content', async () => {
      const restoreResizeObserver = mockResizeObserver()
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        render(InlineNested, { keepMountedContent: true })
        const trigger1 = screen.getByTestId('trigger-1')

        fireEvent.click(trigger1)
        await waitFor(() => {
          expect(screen.queryByTestId('popup-root')).not.toBe(null)
        })

        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')
        const animations = mockAnimations(popupRoot)

        const popupWidth = 250
        let popupHeight = 220
        defineOffsetSize(
          popupRoot,
          () => popupWidth,
          () => popupHeight
        )

        primeOpenPopupSize(popupRoot, positioner, 250, 220)

        popupHeight = 300
        animations.start()
        fireEvent.click(screen.getByTestId('nested-trigger-2'))

        await waitFor(() => {
          expect(screen.getByTestId('nested-popup-2')).not.toHaveAttribute('hidden')
        })
        await waitFor(() => {
          expect(screen.getByTestId('nested-popup-1')).toHaveAttribute('hidden')
        })
        await waitFor(() => {
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('300px')
        })

        await animations.finish()

        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('auto')
          expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('auto')
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('250px')
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('300px')
        })
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        restoreResizeObserver()
      }
    })
    it('updates popup sizing when a kept nested content hidden attribute changes', async () => {
      const restoreResizeObserver = mockResizeObserver()
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        render(InlineNested, { keepMountedContent: true })
        const trigger1 = screen.getByTestId('trigger-1')

        fireEvent.click(trigger1)
        await waitFor(() => {
          expect(screen.queryByTestId('popup-root')).not.toBe(null)
        })

        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')

        const popupWidth = 250
        let popupHeight = 220
        defineOffsetSize(
          popupRoot,
          () => popupWidth,
          () => popupHeight
        )

        primeOpenPopupSize(popupRoot, positioner, 250, 220)

        popupHeight = 300
        screen.getByTestId('nested-popup-1').setAttribute('hidden', '')

        await waitFor(() => {
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('300px')
        })
        expect(positioner.style.getPropertyValue('--positioner-width')).toBe('250px')
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        restoreResizeObserver()
      }
    })
    it('keeps inline mutation resize interruptible when content updates again mid-transition', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        render(InlineNestedDynamicContentNavigationMenu, { initialContentStage: 1 })
        const trigger1 = screen.getByTestId('trigger-1')

        fireEvent.click(trigger1)
        await waitFor(() => {
          expect(screen.queryByTestId('popup-root')).not.toBe(null)
        })

        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')
        const animations = mockAnimations(popupRoot)

        const popupWidth = 250
        const popupHeightValues = [190, 260]
        let popupHeight = 260
        defineOffsetSize(
          popupRoot,
          () => popupWidth,
          () => {
            const next = popupHeightValues.shift()
            if (next != null) popupHeight = next
            return popupHeight
          }
        )

        popupRoot.style.setProperty('--popup-width', '250px')
        popupRoot.style.setProperty('--popup-height', '220px')
        positioner.style.setProperty('--positioner-width', '250px')
        positioner.style.setProperty('--positioner-height', '220px')

        const setPropertySpy = vi.spyOn(positioner.style, 'setProperty')

        animations.start()
        fireEvent.click(screen.getByTestId('insert-content'))

        await waitFor(() => {
          expect(screen.queryByTestId('extra-content-2')).not.toBe(null)
        })
        await waitFor(() => {
          expect(
            setPropertySpy.mock.calls.some(
              (call) => call[0] === '--positioner-height' && call[1] === '190px'
            )
          ).toBe(true)
        })

        await animations.finish()

        await waitFor(() => {
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('260px')
        })
        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('auto')
        })

        setPropertySpy.mockRestore()
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })
    it('preserves the current size when an interrupted mutation temporarily measures zero', async () => {
      const restoreResizeObserver = mockResizeObserver()

      try {
        render(InlineNestedDynamicContentNavigationMenu, { initialContentStage: 1 })

        fireEvent.click(screen.getByTestId('trigger-1'))
        await waitFor(() => {
          expect(screen.queryByTestId('popup-root')).not.toBe(null)
        })

        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')
        const popupWidths = [250, 0]
        const popupHeights = [220, 0]
        defineOffsetSize(
          popupRoot,
          () => popupWidths.shift() ?? 0,
          () => popupHeights.shift() ?? 0
        )

        popupRoot.style.setProperty('--popup-width', '250px')
        popupRoot.style.setProperty('--popup-height', '220px')
        positioner.style.setProperty('--positioner-width', '250px')
        positioner.style.setProperty('--positioner-height', '220px')

        fireEvent.click(screen.getByTestId('insert-content'))

        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('auto')
        })
        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('auto')
        })

        expect(positioner.style.getPropertyValue('--positioner-width')).toBe('250px')
        expect(positioner.style.getPropertyValue('--positioner-height')).toBe('220px')
      } finally {
        restoreResizeObserver()
      }
    })
    it('seeds the popup width from the exiting panel when reopening after hovering a top-level link', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      let popupWidthSpy: ReturnType<typeof vi.spyOn> | undefined

      try {
        render(TopLevelLinkScopedAnimation)

        const triggerProduct = screen.getByTestId('trigger-product')
        const triggerLearn = screen.getByTestId('trigger-learn')
        const topLevelLink = screen.getByTestId('top-level-link')
        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')
        const animations = mockAnimations(popupRoot)

        let nextPanelWidth = 675
        let nextPanelHeight = 220
        Object.defineProperty(popupRoot, 'offsetWidth', {
          configurable: true,
          get: () => {
            const fixedWidth = popupRoot.style.getPropertyValue('--popup-width')
            return fixedWidth && fixedWidth !== 'auto' ? parseInt(fixedWidth, 10) : nextPanelWidth
          }
        })
        Object.defineProperty(popupRoot, 'offsetHeight', {
          configurable: true,
          get: () => {
            const fixedHeight = popupRoot.style.getPropertyValue('--popup-height')
            return fixedHeight && fixedHeight !== 'auto'
              ? parseInt(fixedHeight, 10)
              : nextPanelHeight
          }
        })

        const openAnimation = animations.start()
        hoverOpen(triggerProduct)

        await animations.finish(openAnimation)

        await waitFor(() => {
          expect(triggerProduct).toHaveAttribute('aria-expanded', 'true')
        })
        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('auto')
        })

        const productContent = screen
          .getByText('Product panel')
          .closest('.test-navigation-menu-content') as HTMLElement
        const productContentAnimations = mockAnimations(productContent)
        const productContentCloseAnimation = productContentAnimations.start()

        const closeAnimation = animations.start()
        fireEvent.mouseLeave(triggerProduct, { relatedTarget: topLevelLink })
        hoverOpen(topLevelLink)

        await waitFor(() => {
          expect(triggerProduct).toHaveAttribute('aria-expanded', 'false')
        })

        nextPanelWidth = 500
        nextPanelHeight = 180
        popupWidthSpy = vi.spyOn(popupRoot.style, 'setProperty')

        const reopenAnimation = animations.start()
        hoverOpen(triggerLearn)

        await nextFrame()

        const popupWidthCalls = (popupWidthSpy.mock.calls as Array<[string, string, string?]>)
          .filter((call) => call[0] === '--popup-width')
          .map((call) => call[1])
        const exitingWidthIndex = popupWidthCalls.indexOf('675px')
        const reopeningWidthIndex = popupWidthCalls.lastIndexOf('500px')

        await waitFor(() => {
          expect(triggerLearn).toHaveAttribute('aria-expanded', 'true')
        })
        expect(positioner.style.getPropertyValue('--positioner-width')).toBe('500px')
        expect(exitingWidthIndex).toBeGreaterThan(-1)
        expect(reopeningWidthIndex).toBeGreaterThan(exitingWidthIndex)

        await productContentAnimations.finish(productContentCloseAnimation)
        await animations.finish(closeAnimation)
        await animations.finish(reopenAnimation)
      } finally {
        popupWidthSpy?.mockRestore()
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })
    it.skipIf(isJSDOM)('closes on the short exit path after switching content', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        const onOpenChangeComplete = vi.fn()
        render(ScopedPopupExitAnimation, { onOpenChangeComplete })

        const triggerProduct = screen.getByTestId('trigger-product')
        const triggerLearn = screen.getByTestId('trigger-learn')

        fireEvent.click(triggerProduct)

        const productContent = (await screen.findByText('Product panel')).closest(
          '.scoped-exit-content'
        ) as HTMLElement
        const productContentAnimations = mockAnimations(productContent)
        const productContentCloseAnimation = productContentAnimations.start()

        fireEvent.click(triggerLearn)

        await waitFor(() => {
          expect(triggerProduct).toHaveAttribute('aria-expanded', 'false')
        })
        await waitFor(() => {
          expect(triggerLearn).toHaveAttribute('aria-expanded', 'true')
        })

        const popupRoot = screen.getByTestId('popup-root')

        await nextFrame()
        await productContentAnimations.finish(productContentCloseAnimation)

        await waitFor(() => {
          expect(
            popupRoot.getAnimations().some((animation) => animation.playState !== 'finished')
          ).toBe(false)
        })

        triggerLearn.focus()

        const closeStart = performance.now()
        fireEvent.keyDown(triggerLearn, { key: 'Escape' })

        await waitFor(() => {
          expect(onOpenChangeComplete.mock.calls.length).toBe(1)
        })
        expect(onOpenChangeComplete.mock.calls[0][0]).toBe(false)
        expect(performance.now() - closeStart).toBeLessThan(325)
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })
    it('tabs from the last link of the last nested panel to the next top-level trigger', async () => {
      const user = userEvent.setup()
      render(TabForwardBoundary)
      const trigger1 = screen.getByTestId('trigger-1')

      await user.click(trigger1)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-1')).not.toBe(null)
      })

      const nestedLastLink = screen.getByTestId('nested-last-link')
      nestedLastLink.focus()
      expect(nestedLastLink).toHaveFocus()

      await user.tab()

      expect(screen.getByTestId('trigger-2')).toHaveFocus()
      await waitFor(() => {
        expect(screen.getByTestId('nested-trigger-2')).toHaveAttribute('aria-expanded', 'true')
      })
      expect(screen.queryByTestId('nested-popup-2')).not.toBe(null)
    })
    it('tabs between nested triggers and links without opening inactive panels', async () => {
      const user = userEvent.setup()
      render(TabFlow)
      const triggerProduct = screen.getByTestId('trigger-product')

      await user.click(triggerProduct)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-product')).not.toBe(null)
      })

      const nestedDevelopersTrigger = screen.getByTestId('nested-trigger-developers')
      nestedDevelopersTrigger.focus()
      expect(nestedDevelopersTrigger).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('nested-link-get-started')).toHaveFocus()

      await user.tab({ shift: true })
      expect(nestedDevelopersTrigger).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('nested-link-get-started')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('nested-link-composition')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('nested-trigger-design-systems')).toHaveFocus()
      expect(screen.queryByTestId('nested-popup-design-systems')).toBe(null)

      await user.tab()
      expect(screen.getByText('Engineering Leads')).toHaveFocus()
    })
    it('returns to the last inline submenu item when shift+tabbing after leaving it', async () => {
      const user = userEvent.setup()
      render(TabFlow)
      const triggerProduct = screen.getByTestId('trigger-product')

      await user.click(triggerProduct)
      await waitFor(() => {
        expect(screen.queryByTestId('popup-product')).not.toBe(null)
      })

      await user.tab()
      expect(screen.getByTestId('nested-trigger-developers')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('nested-link-get-started')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('nested-link-composition')).toHaveFocus()

      await user.tab()
      expect(screen.getByTestId('nested-trigger-design-systems')).toHaveFocus()

      await user.tab({ shift: true })
      expect(screen.getByTestId('nested-link-composition')).toHaveFocus()
    })
  })
})
