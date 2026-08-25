import { render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import type { Component } from 'svelte'
import { beforeEach, describe, expect, it } from 'vitest'
import { isJSDOM } from './test-utils'

type ConformanceProps = {
  open?: boolean
  popupId?: string
}

export type PopupConformanceConfig = {
  /**
   * Renders the component with `data-testid="trigger"` on its trigger and `data-testid="popup"` on
   * its popup, and accepts `open` and `popupId`.
   */
  component: Component<ConformanceProps>
  /** How the popup is opened by the pointer. */
  triggerMouseAction: 'click' | 'hover'
  /** Expected `role` on the popup element. */
  expectedPopupRole?: string
  /** Expected `aria-haspopup` on the trigger; defaults to the popup role. */
  expectedAriaHasPopupValue?: string
  /** Whether the popup stays in the DOM while closed. */
  alwaysMounted?: boolean | 'only-after-open'
  /** Whether the popup is a combobox listbox. */
  combobox?: boolean
}

/** Shared popup behaviour every trigger-and-popup component must satisfy. */
export function popupConformanceTests(config: PopupConformanceConfig): void {
  const {
    component,
    triggerMouseAction,
    expectedPopupRole,
    expectedAriaHasPopupValue = expectedPopupRole,
    alwaysMounted: alwaysMountedParam = false,
    combobox = false
  } = config

  const alwaysMounted = alwaysMountedParam === 'only-after-open' ? false : alwaysMountedParam

  const getTrigger = () => screen.getByTestId('trigger')
  const getPopup = () => screen.queryByTestId('popup')

  function expectClosed(mountedWhileClosed: boolean) {
    if (mountedWhileClosed) {
      expect(getPopup()).not.toBeVisible()
    } else {
      expect(getPopup()).toBeNull()
    }
  }

  describe('Popup conformance', () => {
    describe('controlled mode', () => {
      it('opens the popup with the `open` prop', async () => {
        const { rerender } = render(component, { open: false })
        expectClosed(alwaysMounted)

        await rerender({ open: true })
        await waitFor(() => expect(getPopup()).not.toBeNull())
      })
    })

    if (triggerMouseAction === 'click') {
      describe('uncontrolled mode', () => {
        it('opens the popup when clicking on the trigger', async () => {
          const user = userEvent.setup()
          render(component, {})
          expectClosed(alwaysMounted)

          await user.click(getTrigger())
          await waitFor(() => expect(getPopup()).not.toBeNull())
        })
      })
    }

    if (expectedPopupRole || triggerMouseAction === 'click') {
      describe('ARIA attributes', () => {
        if (expectedPopupRole) {
          it(`has the ${expectedPopupRole} role on the popup`, async () => {
            render(component, { open: true })
            const popup = await waitFor(() => {
              const found = getPopup()
              expect(found).not.toBeNull()
              return found
            })
            expect(popup).toHaveAttribute('role', expectedPopupRole)
          })
        }

        if (triggerMouseAction === 'click') {
          it('has the `aria-controls` attribute on the trigger', async () => {
            render(component, { open: true })
            await waitFor(() => expect(getPopup()).not.toBeNull())
            expect(getTrigger()).toHaveAttribute('aria-controls', getPopup()?.id)
          })

          it('has the `aria-expanded` attribute on the trigger when open', async () => {
            const user = userEvent.setup()
            render(component, {})
            expectClosed(alwaysMounted)
            expect(getTrigger()).toHaveAttribute('aria-expanded', 'false')

            await user.click(getTrigger())
            await waitFor(() => {
              if (combobox) {
                expect(getPopup()).toHaveAttribute('role', 'listbox')
              } else {
                expect(getPopup()).toHaveAttribute('data-open')
              }
            })
            expect(getTrigger()).toHaveAttribute('aria-expanded', 'true')
          })

          if (expectedAriaHasPopupValue) {
            it('has the `aria-haspopup` attribute on the trigger', async () => {
              render(component, { open: true })
              await waitFor(() => expect(getPopup()).not.toBeNull())
              expect(getTrigger()).toHaveAttribute('aria-haspopup', expectedAriaHasPopupValue)
            })
          }

          it('allows a custom `id` prop', async () => {
            render(component, { open: true, popupId: 'TestId' })
            await waitFor(() => expect(getPopup()).not.toBeNull())
            expect(getTrigger()?.getAttribute('aria-controls')).toBe(getPopup()?.getAttribute('id'))
          })
        }
      })
    }

    describe('animations', () => {
      beforeEach(() => {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
      })

      it.skipIf(isJSDOM)('removes the popup when there is no exit animation defined', async () => {
        const { rerender } = render(component, { open: true })
        await waitFor(() => expect(getPopup()).not.toBeNull())

        await rerender({ open: false })
        await waitFor(() => expectClosed(alwaysMounted || alwaysMountedParam === 'only-after-open'))
      })
    })
  })
}
