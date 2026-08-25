import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import DrawerFinalFocusByType from './fixtures/drawer-final-focus-by-type.svelte'
import DrawerFocusTest from './fixtures/drawer-focus-test.svelte'
import DrawerInitialFocusDisabled from './fixtures/drawer-initial-focus-disabled.svelte'
import DrawerNoViewport from './fixtures/drawer-no-viewport.svelte'
import DrawerUpwardSnapOffset from './fixtures/drawer-upward-snap-offset.svelte'
import DrawerWithNestedAlertDialog from './fixtures/drawer-with-nested-alert-dialog.svelte'
import DrawerWithNestedDialog from './fixtures/drawer-with-nested-dialog.svelte'
import NestedAnimatedExit from './fixtures/nested-animated-exit.svelte'
import NestedAnimatedHeight from './fixtures/nested-animated-height.svelte'
import NestedBorderPopup from './fixtures/nested-border-popup.svelte'
import NestedDrawer from './fixtures/nested-drawer.svelte'

describe('<Drawer.Popup />', () => {
  it('warns in development when not rendered within a viewport', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(DrawerNoViewport)

    await waitFor(() => {
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('<Drawer.Popup> expected to be rendered within <Drawer.Viewport>.')
      )
    })

    warnSpy.mockRestore()
  })

  it('defaults initial focus to the popup element', async () => {
    const user = userEvent.setup()
    render(DrawerFocusTest)

    await user.click(screen.getByRole('button', { name: 'Open' }))

    await waitFor(() => {
      expect(screen.getByTestId('popup')).toHaveFocus()
      expect(screen.getByTestId('popup-input')).not.toHaveFocus()
    })
  })

  it('leaves focus on the trigger when initial focus is disabled', async () => {
    const user = userEvent.setup()
    render(DrawerInitialFocusDisabled)

    const trigger = screen.getByRole('button', { name: 'Open' })
    await user.click(trigger)

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible()
    })
    expect(trigger).toHaveFocus()
  })

  it('applies a negative snap point offset to upward drawers', async () => {
    const heights = { popup: 300, viewport: 400 }
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get(this: HTMLElement) {
        const testid = this.getAttribute('data-testid')
        return (
          (testid === 'popup' || testid === 'viewport' ? heights[testid] : undefined) ??
          original.get!.call(this)
        )
      }
    })

    try {
      render(DrawerUpwardSnapOffset)

      const popup = screen.getByTestId('popup')

      await waitFor(() => {
        expect(popup.style.getPropertyValue('--drawer-snap-point-offset')).toBe('-200px')
      })
      expect(popup).toHaveAttribute('data-swipe-direction', 'up')
    } finally {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original)
    }
  })

  it.skipIf(isJSDOM)(
    'includes border size in frontmost height CSS variable for nested drawers',
    async () => {
      render(NestedBorderPopup)

      const parentPopup = screen.getByTestId('parent-popup')
      const childPopup = screen.getByTestId('child-popup')

      await waitFor(() => {
        expect(childPopup.offsetHeight).toBeGreaterThan(childPopup.scrollHeight)
        expect(parentPopup.style.getPropertyValue('--drawer-frontmost-height')).toBe(
          `${childPopup.offsetHeight}px`
        )
      })
    }
  )

  it('does not treat dialogs inside nested drawers as nested drawers', async () => {
    const user = userEvent.setup()
    render(DrawerWithNestedDialog)

    const parentPopup = screen.getByTestId('parent-popup')
    const childPopup = screen.getByTestId('child-popup')
    const observedNestedDrawerCounts = [parentPopup.style.getPropertyValue('--nested-drawers')]

    const observer = new MutationObserver(() => {
      observedNestedDrawerCounts.push(parentPopup.style.getPropertyValue('--nested-drawers'))
    })
    observer.observe(parentPopup, { attributeFilter: ['style'], attributes: true })

    await waitFor(() => {
      expect(parentPopup.style.getPropertyValue('--nested-drawers')).toBe('1')
    })
    expect(childPopup.style.getPropertyValue('--nested-drawers')).toBe('0')
    expect(childPopup).not.toHaveAttribute('data-nested-drawer-open')

    await user.click(screen.getByRole('button', { name: 'Open dialog' }))

    await waitFor(() => {
      expect(screen.getByTestId('dialog-popup')).toBeVisible()
    })

    expect(parentPopup.style.getPropertyValue('--nested-drawers')).toBe('1')
    expect(childPopup.style.getPropertyValue('--nested-drawers')).toBe('0')
    expect(childPopup).not.toHaveAttribute('data-nested-drawer-open')

    observer.disconnect()

    expect(observedNestedDrawerCounts).not.toContain('2')
  })

  it('does not treat alert dialogs inside nested drawers as nested drawers', async () => {
    const user = userEvent.setup()
    render(DrawerWithNestedAlertDialog)

    const parentPopup = screen.getByTestId('parent-popup')
    const childPopup = screen.getByTestId('child-popup')
    const observedNestedDrawerCounts = [parentPopup.style.getPropertyValue('--nested-drawers')]

    const observer = new MutationObserver(() => {
      observedNestedDrawerCounts.push(parentPopup.style.getPropertyValue('--nested-drawers'))
    })
    observer.observe(parentPopup, { attributeFilter: ['style'], attributes: true })

    await waitFor(() => {
      expect(parentPopup.style.getPropertyValue('--nested-drawers')).toBe('1')
    })
    expect(childPopup.style.getPropertyValue('--nested-drawers')).toBe('0')
    expect(childPopup).not.toHaveAttribute('data-nested-drawer-open')

    await user.click(screen.getByRole('button', { name: 'Open alert dialog' }))

    await waitFor(() => {
      expect(screen.getByTestId('alert-dialog-popup')).toBeVisible()
    })

    expect(parentPopup.style.getPropertyValue('--nested-drawers')).toBe('1')
    expect(childPopup.style.getPropertyValue('--nested-drawers')).toBe('0')
    expect(childPopup).not.toHaveAttribute('data-nested-drawer-open')

    observer.disconnect()

    expect(observedNestedDrawerCounts).not.toContain('2')
  })

  it('clears parent nested drawer state as soon as a nested drawer closes', async () => {
    const user = userEvent.setup()
    render(NestedDrawer)

    const parentPopup = screen.getByTestId('parent-popup')
    const childPopup = screen.getByTestId('child-popup')

    expect(parentPopup.style.getPropertyValue('--nested-drawers')).toBe('0')
    expect(parentPopup).not.toHaveAttribute('data-nested-drawer-open')

    await user.click(screen.getByRole('button', { name: 'Open nested drawer' }))

    await waitFor(() => {
      expect(parentPopup.style.getPropertyValue('--nested-drawers')).toBe('1')
    })
    expect(parentPopup).toHaveAttribute('data-nested-drawer-open', '')

    await user.click(screen.getByRole('button', { name: 'Close nested drawer' }))

    expect(childPopup).toBeInTheDocument()
    expect(parentPopup.style.getPropertyValue('--nested-drawers')).toBe('0')
    expect(parentPopup).not.toHaveAttribute('data-nested-drawer-open')
  })

  describe.skipIf(isJSDOM)('with exit animations', () => {
    beforeEach(() => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
    })

    it('clears parent nested drawer state when a nested drawer starts closing before unmount', async () => {
      render(NestedAnimatedExit)

      const parentPopup = screen.getByTestId('parent-popup')

      await waitFor(() => {
        expect(parentPopup.style.getPropertyValue('--nested-drawers')).toBe('1')
      })
      expect(parentPopup).toHaveAttribute('data-nested-drawer-open', '')

      screen.getByRole('button', { name: 'Close nested drawer' }).click()

      await waitFor(() => {
        expect(screen.getByTestId('child-popup')).toHaveAttribute('data-ending-style')
      })
      expect(parentPopup.style.getPropertyValue('--nested-drawers')).toBe('0')
      expect(parentPopup).not.toHaveAttribute('data-nested-drawer-open')

      await waitFor(() => {
        expect(screen.queryByTestId('child-popup')).toBeNull()
      })
    })

    it('keeps a fixed height applied while a nested drawer closes', async () => {
      render(NestedAnimatedHeight)

      const parentPopup = screen.getByTestId('parent-popup')
      screen.getByRole('button', { name: 'Open nested drawer' }).click()

      await waitFor(() => {
        expect(parentPopup).toHaveAttribute('data-nested-drawer-open', '')
      })
      await waitFor(() => {
        expect(parentPopup.style.getPropertyValue('--drawer-height')).not.toBe('')
      })

      const mutations: Array<{ hasNested: boolean; drawerHeight: string }> = []
      const observer = new MutationObserver(() => {
        mutations.push({
          hasNested: parentPopup.hasAttribute('data-nested-drawer-open'),
          drawerHeight: parentPopup.style.getPropertyValue('--drawer-height')
        })
      })
      observer.observe(parentPopup, {
        attributeFilter: ['data-nested-drawer-open', 'style'],
        attributes: true
      })

      screen.getByRole('button', { name: 'Close nested drawer' }).click()

      await waitFor(() => {
        expect(screen.getByTestId('child-popup')).toHaveAttribute('data-ending-style')
      })
      await waitFor(() => {
        expect(parentPopup).not.toHaveAttribute('data-nested-drawer-open')
      })
      await waitFor(() => {
        expect(parentPopup.style.getPropertyValue('--drawer-height')).not.toBe('')
      })
      await waitFor(() => {
        expect(
          mutations.some((mutation) => !mutation.hasNested && mutation.drawerHeight !== '')
        ).toBe(true)
      })

      observer.disconnect()

      await waitFor(() => {
        expect(screen.queryByTestId('child-popup')).toBeNull()
      })
    })

    it('restores a fixed height before nested state when reopening a nested drawer', async () => {
      render(NestedAnimatedHeight)

      const parentPopup = screen.getByTestId('parent-popup')
      screen.getByRole('button', { name: 'Open nested drawer' }).click()

      await waitFor(() => {
        expect(parentPopup).toHaveAttribute('data-nested-drawer-open', '')
      })

      screen.getByRole('button', { name: 'Close nested drawer' }).click()

      await waitFor(() => {
        expect(parentPopup).not.toHaveAttribute('data-nested-drawer-open')
      })
      await waitFor(() => {
        expect(screen.queryByTestId('child-popup')).toBeNull()
      })

      const mutations: Array<{ hasNested: boolean; drawerHeight: string }> = []
      const observer = new MutationObserver(() => {
        mutations.push({
          hasNested: parentPopup.hasAttribute('data-nested-drawer-open'),
          drawerHeight: parentPopup.style.getPropertyValue('--drawer-height')
        })
      })
      observer.observe(parentPopup, {
        attributeFilter: ['data-nested-drawer-open', 'style'],
        attributes: true
      })

      screen.getByRole('button', { name: 'Open nested drawer' }).click()

      await waitFor(() => {
        expect(parentPopup).toHaveAttribute('data-nested-drawer-open', '')
      })
      await waitFor(() => {
        expect(mutations.find((mutation) => mutation.hasNested)?.drawerHeight).not.toBe('')
      })
      observer.disconnect()
    })
  })

  it('reports the close type of a Close press after an earlier Escape close', async () => {
    const user = userEvent.setup()
    render(DrawerFinalFocusByType, { keepMounted: true })

    const trigger = screen.getByText('Open')

    await user.click(trigger)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.getByTestId('final-input')).toHaveFocus())

    await user.click(trigger)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBe(null))
    await user.click(screen.getByText('Close'))
    await waitFor(() => expect(trigger).toHaveFocus())
  })
})
