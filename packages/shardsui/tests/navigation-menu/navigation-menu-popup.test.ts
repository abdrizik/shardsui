import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import InlineNestedDynamicContentNavigationMenu from './fixtures/inline-nested-dynamic-content-navigation-menu.svelte'
import InlineNestedNavigationMenu from './fixtures/inline-nested-navigation-menu.svelte'
import KeepMountedSizingNavigationMenu from './fixtures/keep-mounted-sizing-navigation-menu.svelte'
import NavigationMenu from './fixtures/navigation-menu.svelte'
import WithArrow from './fixtures/with-arrow.svelte'
import {
  defineOffsetSize,
  mockAnimations,
  mockBoundingClientRect,
  mockResizeObserver,
  nextFrame,
  primeOpenPopupSize,
  type MockAnimation
} from './helpers'

describe('<NavigationMenu.Popup />', () => {
  describe('positioner / viewport sizing', () => {
    it('does not animate popup sizing when nested default content mounts during opening', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        render(InlineNestedNavigationMenu)
        fireEvent.click(screen.getByTestId('trigger-1'))
        flushSync()

        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')

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
          expect(screen.queryByTestId('nested-popup-1')).not.toBeNull()
        })
        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('auto')
          expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('auto')
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('250px')
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('220px')
        })
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })

    it('updates popup sizing when the window is resized while the popup is open', async () => {
      const restoreResizeObserver = mockResizeObserver()

      try {
        render(KeepMountedSizingNavigationMenu, {
          initialValue: 'item-1',
          portalKeepMounted: true
        })

        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')

        let popupWidth = 675
        let popupHeight = 220
        defineOffsetSize(
          popupRoot,
          () => popupWidth,
          () => popupHeight
        )

        primeOpenPopupSize(popupRoot, positioner, 675, 220)

        popupWidth = 500
        popupHeight = 180

        await waitFor(() => {
          expect(positioner).not.toHaveAttribute('data-instant')
        })

        fireEvent(window, new Event('resize'))
        expect(positioner).toHaveAttribute('data-instant')

        await nextFrame()
        expect(positioner).toHaveAttribute('data-instant')

        await waitFor(() => {
          expect(positioner).not.toHaveAttribute('data-instant')
        })

        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('auto')
          expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('auto')
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('500px')
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('180px')
        })
      } finally {
        restoreResizeObserver()
      }
    })

    it('updates popup sizing immediately when switching to a keepMounted trigger', async () => {
      const restoreResizeObserver = mockResizeObserver()
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        render(KeepMountedSizingNavigationMenu, {
          initialValue: 'item-1',
          portalKeepMounted: false
        })

        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')
        const animations = mockAnimations(popupRoot)

        let popupWidth = 675
        let popupHeight = 220
        defineOffsetSize(
          popupRoot,
          () => popupWidth,
          () => popupHeight
        )

        primeOpenPopupSize(popupRoot, positioner, 675, 220)

        popupWidth = 500
        popupHeight = 180
        animations.start()
        fireEvent.click(screen.getByTestId('trigger-learn'))

        await waitFor(() => {
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('500px')
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('180px')
        })

        await animations.finish()

        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('auto')
          expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('auto')
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('500px')
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('180px')
        })
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        restoreResizeObserver()
      }
    })

    it('ignores the initial open size reset once a trigger switch has started', async () => {
      const restoreResizeObserver = mockResizeObserver()
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        render(KeepMountedSizingNavigationMenu, { initialValue: null, portalKeepMounted: true })

        const popupRoot = screen.getByTestId('popup-root')
        const positioner = screen.getByTestId('positioner')
        const animations = mockAnimations(popupRoot)

        const settle = async () => {
          await nextFrame()
          await nextFrame()
        }
        const finishAnimation = async (animation: MockAnimation) => {
          await animations.finish(animation)
          await nextFrame()
          await nextFrame()
        }

        let popupWidth = 675
        let popupHeight = 220
        defineOffsetSize(
          popupRoot,
          () => popupWidth,
          () => popupHeight
        )

        const openAnimation = animations.start()
        fireEvent.click(screen.getByTestId('trigger-product'))
        await settle()

        popupWidth = 500
        popupHeight = 180

        const switchAnimation = animations.start()
        fireEvent.click(screen.getByTestId('trigger-learn'))
        await settle()

        await waitFor(() => {
          expect(positioner.style.getPropertyValue('--positioner-width')).toBe('500px')
          expect(positioner.style.getPropertyValue('--positioner-height')).toBe('180px')
        })

        await finishAnimation(openAnimation)

        expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('500px')
        expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('180px')

        await finishAnimation(switchAnimation)

        await waitFor(() => {
          expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('auto')
          expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('auto')
        })
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        restoreResizeObserver()
      }
    })

    it('does not collapse auto-sized popup to zero on close if measurement temporarily returns 0', async () => {
      render(InlineNestedDynamicContentNavigationMenu)
      const trigger1 = screen.getByTestId('trigger-1')

      fireEvent.click(trigger1)

      await waitFor(() => {
        expect(screen.queryByTestId('popup-root')).not.toBeNull()
      })

      const popupRoot = screen.getByTestId('popup-root')
      const positioner = screen.getByTestId('positioner')

      await nextFrame()
      await nextFrame()

      popupRoot.style.setProperty('--popup-width', '250px')
      popupRoot.style.setProperty('--popup-height', '120px')
      positioner.style.setProperty('--positioner-width', '250px')
      positioner.style.setProperty('--positioner-height', '120px')

      defineOffsetSize(
        popupRoot,
        () => 0,
        () => 0
      )
      defineOffsetSize(
        positioner,
        () => 0,
        () => 0
      )

      fireEvent.blur(trigger1, { relatedTarget: document.body })

      expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('250px')
      expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('120px')
      expect(positioner.style.getPropertyValue('--positioner-width')).toBe('250px')
      expect(positioner.style.getPropertyValue('--positioner-height')).toBe('120px')
    })
  })

  describe('controlled close size preservation', () => {
    async function assertPreserved(keepMountedPortal: boolean) {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      const originalOffsetWidth = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'offsetWidth'
      )
      const originalOffsetHeight = Object.getOwnPropertyDescriptor(
        HTMLElement.prototype,
        'offsetHeight'
      )
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        function isPopupOpen() {
          return screen.queryByTestId('popup-1')?.hasAttribute('data-open') ?? false
        }

        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
          configurable: true,
          get() {
            if (this.getAttribute('data-testid') === 'popup-root') {
              return isPopupOpen() ? 675 : 0
            }
            return originalOffsetWidth?.get?.call(this) ?? 0
          }
        })
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
          configurable: true,
          get() {
            if (this.getAttribute('data-testid') === 'popup-root') {
              return isPopupOpen() ? 220 : 0
            }
            return originalOffsetHeight?.get?.call(this) ?? 0
          }
        })

        const { rerender } = render(NavigationMenu, { value: 'item-1', keepMountedPortal })

        const positioner = screen.getByTestId('top-level-positioner')
        const popupRoot = screen.getByTestId('popup-root')
        const animations = mockAnimations(popupRoot)

        animations.start()
        await rerender({ value: null, keepMountedPortal })

        await waitFor(() => {
          expect(popupRoot).toHaveAttribute('data-ending-style')
        })
        expect(popupRoot.style.getPropertyValue('--popup-width')).toBe('675px')
        expect(popupRoot.style.getPropertyValue('--popup-height')).toBe('220px')
        expect(positioner.style.getPropertyValue('--positioner-width')).toBe('675px')
        expect(positioner.style.getPropertyValue('--positioner-height')).toBe('220px')

        await animations.finish()
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        if (originalOffsetWidth) {
          Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth)
        } else {
          Reflect.deleteProperty(HTMLElement.prototype, 'offsetWidth')
        }
        if (originalOffsetHeight) {
          Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight)
        } else {
          Reflect.deleteProperty(HTMLElement.prototype, 'offsetHeight')
        }
      }
    }
    it('preserves popup size when controlled value closes externally', async () => {
      await assertPreserved(false)
    })
    it('preserves popup size when controlled value closes externally with keepMounted portal', async () => {
      await assertPreserved(true)
    })
    it('clears activation direction when controlled value closes externally after switching triggers', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        const { rerender } = render(NavigationMenu, { value: 'item-1' })

        const trigger1 = screen.getByTestId('trigger-1')
        const trigger2 = screen.getByTestId('trigger-2')

        mockBoundingClientRect(trigger1, { x: 0, y: 0, width: 80, height: 32 })
        mockBoundingClientRect(trigger2, { x: 120, y: 0, width: 80, height: 32 })

        fireEvent.click(trigger2)
        await rerender({ value: 'item-2' })

        await waitFor(() => {
          expect(screen.getByTestId('popup-2')).toHaveAttribute(
            'data-activation-direction',
            'right'
          )
        })

        const exitingContent = screen.getByTestId('popup-2')
        const animations = mockAnimations(exitingContent)

        animations.start()
        await rerender({ value: null })

        await waitFor(() => {
          expect(exitingContent).toHaveAttribute('data-ending-style')
        })
        expect(exitingContent).not.toHaveAttribute('data-activation-direction')

        await animations.finish()
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })
  })

  describe('kept portal open transitions', () => {
    it('disables popup and arrow transitions while a kept portal opens', async () => {
      render(WithArrow)

      fireEvent.click(screen.getByTestId('trigger-1'))

      // jsdom applies the starting style synchronously; a real browser applies it a
      // microtask later.
      if (isJSDOM) {
        expect(screen.getByTestId('popup-root')).toHaveStyle({ transition: 'none' })
      } else {
        await waitFor(() => {
          expect(screen.getByTestId('popup-root')).toHaveStyle({ transition: 'none' })
        })
      }
      expect(screen.getByTestId('arrow')).toHaveStyle({ transition: 'none' })

      await waitFor(() => {
        expect(screen.getByTestId('popup-root')).not.toHaveStyle({ transition: 'none' })
      })
      expect(screen.getByTestId('arrow')).not.toHaveStyle({ transition: 'none' })
    })
  })
})
