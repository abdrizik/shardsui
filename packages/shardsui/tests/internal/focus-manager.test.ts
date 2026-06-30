import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isGecko, isJSDOM, isWebKit } from '../test-utils'
import FocusManagerApp from './fixtures/focus-manager-app.svelte'
import FocusManagerAutoFocusChild from './fixtures/focus-manager-auto-focus-child.svelte'
import FocusManagerComboboxOutsideNodes from './fixtures/focus-manager-combobox-outside-nodes.svelte'
import FocusManagerDisabled from './fixtures/focus-manager-disabled.svelte'
import FocusManagerFalsyReturn from './fixtures/focus-manager-falsy-return.svelte'
import FocusManagerFinalFocusTarget from './fixtures/focus-manager-final-focus-target.svelte'
import FocusManagerFloatingTabIndex from './fixtures/focus-manager-floating-tab-index.svelte'
import FocusManagerHover from './fixtures/focus-manager-hover.svelte'
import FocusManagerIframeApp from './fixtures/focus-manager-iframe-app.svelte'
import FocusManagerInsideElements from './fixtures/focus-manager-inside-elements.svelte'
import FocusManagerKeepMounted from './fixtures/focus-manager-keep-mounted.svelte'
import FocusManagerLastConnected from './fixtures/focus-manager-last-connected.svelte'
import FocusManagerManagedTabIndex from './fixtures/focus-manager-managed-tab-index.svelte'
import FocusManagerMixedModality from './fixtures/focus-manager-mixed-modality.svelte'
import FocusManagerModalCombobox from './fixtures/focus-manager-modal-combobox.svelte'
import FocusManagerNavigation from './fixtures/focus-manager-navigation.svelte'
import FocusManagerNestedClickTrigger from './fixtures/focus-manager-nested-click-trigger.svelte'
import FocusManagerNestedDialogs from './fixtures/focus-manager-nested-dialogs.svelte'
import FocusManagerNoTabbableContent from './fixtures/focus-manager-no-tabbable-content.svelte'
import FocusManagerNonFocusableReference from './fixtures/focus-manager-non-focusable-reference.svelte'
import FocusManagerNonModalPortalDialog from './fixtures/focus-manager-non-modal-portal-dialog.svelte'
import FocusManagerNonModalPortal from './fixtures/focus-manager-non-modal-portal.svelte'
import FocusManagerOutsideNodes from './fixtures/focus-manager-outside-nodes.svelte'
import FocusManagerPortalReferenceSiblings from './fixtures/focus-manager-portal-reference-siblings.svelte'
import FocusManagerRadioApp from './fixtures/focus-manager-radio-app.svelte'
import FocusManagerReferenceSiblings from './fixtures/focus-manager-reference-siblings.svelte'
import FocusManagerRemovableReference from './fixtures/focus-manager-removable-reference.svelte'
import FocusManagerReopenOnClose from './fixtures/focus-manager-reopen-on-close.svelte'
import FocusManagerRestoreApp from './fixtures/focus-manager-restore-app.svelte'
import FocusManagerRestore from './fixtures/focus-manager-restore.svelte'
import FocusManagerReturnModality from './fixtures/focus-manager-return-modality.svelte'
import FocusManagerReturn from './fixtures/focus-manager-return.svelte'
import FocusManagerTrappedCombobox from './fixtures/focus-manager-trapped-combobox.svelte'
import FocusManagerUntrappedCombobox from './fixtures/focus-manager-untrapped-combobox.svelte'
import FocusManagerWrapperFloating from './fixtures/focus-manager-wrapper-floating.svelte'

// `toHaveFocus` does not traverse into nested documents, so frame ownership is walked by hand.
function isFocused(element: Element): boolean {
  let doc: Document | null = element.ownerDocument
  let current: Element = element

  while (doc) {
    if (doc.activeElement !== current) return false

    const frame: Element | null = doc.defaultView?.frameElement ?? null
    if (!frame) return true

    current = frame
    doc = frame.ownerDocument
  }

  return true
}

const flushFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
const flushTimeout = () => new Promise<void>((resolve) => setTimeout(resolve))

describe('focus manager', () => {
  describe.skipIf(!isJSDOM)('jsdom-only coverage', () => {
    describe('initialFocus', () => {
      it('default behavior focuses first tabbable element', async () => {
        render(FocusManagerApp)

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('one')).toHaveFocus()
      })

      it('default behavior focuses the checked radio in a named group', async () => {
        render(FocusManagerRadioApp)

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('radio-two')).toHaveFocus()
      })

      it('focuses the element an initialFocus target resolves to', async () => {
        render(FocusManagerApp, { initialFocus: 'two' })

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('two')).toHaveFocus()
      })

      it('respects autofocus', async () => {
        render(FocusManagerAutoFocusChild)

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('input')).toHaveFocus()
      })
    })

    describe('finalFocus', () => {
      it('returns focus to the trigger by default', async () => {
        const { rerender } = render(FocusManagerApp)

        screen.getByTestId('reference').focus()
        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('one')).toHaveFocus()

        screen.getByTestId('two').focus()

        await rerender({ finalFocus: false })

        expect(screen.getByTestId('two')).toHaveFocus()

        await fireEvent.click(screen.getByTestId('three'))
        expect(screen.getByTestId('reference')).not.toHaveFocus()
      })

      it('when false', async () => {
        render(FocusManagerApp, { finalFocus: false })

        screen.getByTestId('reference').focus()
        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('one')).toHaveFocus()

        await fireEvent.click(screen.getByTestId('three'))
        expect(screen.getByTestId('reference')).not.toHaveFocus()
      })

      it('returns focus to the element a finalFocus target resolves to', async () => {
        render(FocusManagerFinalFocusTarget)

        screen.getByTestId('reference').focus()
        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        await fireEvent.click(screen.getByTestId('three'))
        await flushFrame()

        expect(screen.getByTestId('focus-target')).toHaveFocus()
      })

      it('always returns to the reference for nested elements', async () => {
        render(FocusManagerNestedDialogs)

        await userEvent.click(screen.getByTestId('open-dialog'))
        await userEvent.click(screen.getByTestId('open-nested-dialog'))

        expect(screen.getByTestId('close-nested-dialog')).toBeInTheDocument()

        await fireEvent.pointerDown(document.body)

        expect(screen.queryByTestId('close-nested-dialog')).not.toBeInTheDocument()

        await fireEvent.pointerDown(document.body)

        expect(screen.queryByTestId('close-dialog')).not.toBeInTheDocument()
      })

      it('returns to the first focusable descendant of a reference that is not focusable', async () => {
        render(FocusManagerNonFocusableReference)

        screen.getByTestId('open-dialog').focus()
        await userEvent.keyboard('{Enter}')

        expect(screen.getByTestId('close-dialog')).toBeInTheDocument()

        await userEvent.keyboard('{Escape}')

        expect(screen.queryByTestId('close-dialog')).not.toBeInTheDocument()

        await waitFor(() => {
          expect(screen.getByTestId('open-dialog')).toHaveFocus()
        })
      })

      it('preserves the tabbable context next to the reference if it is removed (modal)', async () => {
        render(FocusManagerRemovableReference)

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        await fireEvent.click(screen.getByTestId('remove'))
        await flushFrame()

        await userEvent.tab()

        expect(screen.getByTestId('fallback')).toHaveFocus()
      })

      it('preserves the tabbable context next to the reference if it is removed (non-modal)', async () => {
        render(FocusManagerRemovableReference, { modal: false })

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        await fireEvent.click(screen.getByTestId('remove'))
        await flushFrame()

        await userEvent.tab()

        expect(screen.getByTestId('fallback')).toHaveFocus()
      })

      it.skipIf(!isJSDOM)(
        'does not return focus to the trigger on outside press when preventScroll is not supported',
        async () => {
          render(FocusManagerReturn)

          await userEvent.click(screen.getByTestId('reference'))

          await waitFor(() => {
            expect(screen.getByTestId('floating')).toHaveFocus()
          })

          await userEvent.click(document.body)

          expect(screen.getByTestId('reference')).not.toHaveFocus()
        }
      )

      it('returns focus to the trigger on outside press when preventScroll is supported', async () => {
        const originalFocus = HTMLElement.prototype.focus
        Object.defineProperty(HTMLElement.prototype, 'focus', {
          configurable: true,
          writable: true,
          value(options: FocusOptions | undefined) {
            options && options.preventScroll
            return originalFocus.call(this, options)
          }
        })

        try {
          render(FocusManagerReturn)

          await userEvent.click(screen.getByTestId('reference'))

          await waitFor(() => {
            expect(screen.getByTestId('floating')).toHaveFocus()
          })

          await userEvent.click(document.body)

          await waitFor(() => {
            expect(screen.getByTestId('reference')).toHaveFocus()
          })
        } finally {
          HTMLElement.prototype.focus = originalFocus
        }
      })

      it('passes focusVisible when returning focus after keyboard close', async () => {
        render(FocusManagerReturnModality)

        const reference = screen.getByTestId('reference')
        await userEvent.click(reference)
        await flushFrame()

        expect(screen.getByTestId('floating')).toHaveFocus()

        const focusSpy = vi.spyOn(reference, 'focus')

        try {
          await userEvent.keyboard('{Escape}')

          await waitFor(() => {
            expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true, focusVisible: true })
          })
        } finally {
          focusSpy.mockRestore()
        }
      })

      it('omits focusVisible when returning focus after pointer close', async () => {
        render(FocusManagerReturnModality)

        const reference = screen.getByTestId('reference')
        await userEvent.click(reference)
        await flushFrame()

        expect(screen.getByTestId('floating')).toHaveFocus()

        const focusSpy = vi.spyOn(reference, 'focus')

        try {
          await userEvent.click(reference)

          await waitFor(() => {
            expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
          })
          expect(focusSpy).not.toHaveBeenCalledWith(expect.objectContaining({ focusVisible: true }))
        } finally {
          focusSpy.mockRestore()
        }
      })

      it('does not insert a fallback element when the return element resolves to nothing', async () => {
        render(FocusManagerFalsyReturn)

        const reference = screen.getByTestId('reference')
        await userEvent.click(reference)

        await waitFor(() => {
          expect(screen.getByTestId('floating')).toBeInTheDocument()
        })

        expect(reference.nextElementSibling).toBeNull()

        await userEvent.click(screen.getByTestId('close'))

        await waitFor(() => {
          expect(screen.queryByTestId('close')).toBeNull()
        })

        expect(reference.nextElementSibling).toBeNull()
      })
    })

    describe('iframe focus navigation', () => {
      it.skipIf(!isJSDOM)('tabs from the popover to the next element in the iframe', async () => {
        render(FocusManagerIframeApp)

        const iframe = (await screen.findByTestId('iframe')) as HTMLIFrameElement
        const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document
        const iframeWithin = iframeDocument ? within(iframeDocument.body) : screen

        const user = userEvent.setup({ document: iframeDocument })

        await user.click(iframeWithin.getByRole('button', { name: 'Open' }))

        // jest-dom matchers reject elements from another realm, so presence is checked by query.
        await waitFor(() => {
          expect(iframeWithin.queryByTestId('popover')).not.toBeNull()
        })
        await flushFrame()

        await user.tab()
        await user.tab()

        expect(isFocused(iframeWithin.getByText('next iframe link'))).toBe(true)
      })

      it.skipIf(!isJSDOM)(
        'shift+tab from the popover to the previous element in the iframe',
        async () => {
          render(FocusManagerIframeApp)

          const iframe = (await screen.findByTestId('iframe')) as HTMLIFrameElement
          const iframeDocument = iframe.contentDocument ?? iframe.contentWindow?.document
          const iframeWithin = iframeDocument ? within(iframeDocument.body) : screen

          const user = userEvent.setup({ document: iframeDocument })

          await user.click(iframeWithin.getByRole('button', { name: 'Open' }))

          await waitFor(() => {
            expect(iframeWithin.queryByTestId('popover')).not.toBeNull()
          })
          await flushFrame()

          await user.tab({ shift: true })

          expect(isFocused(iframeWithin.getByRole('button', { name: 'Open' }))).toBe(true)
        }
      )
    })

    describe('modal', () => {
      it('when true', async () => {
        render(FocusManagerApp, { modal: true })

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        await userEvent.tab()
        expect(screen.getByTestId('two')).toHaveFocus()

        await userEvent.tab()
        expect(screen.getByTestId('three')).toHaveFocus()

        await userEvent.tab()
        expect(screen.getByTestId('one')).toHaveFocus()

        await userEvent.tab({ shift: true })
        expect(screen.getByTestId('three')).toHaveFocus()

        await userEvent.tab({ shift: true })
        expect(screen.getByTestId('two')).toHaveFocus()

        await userEvent.tab({ shift: true })
        expect(screen.getByTestId('one')).toHaveFocus()

        await userEvent.tab({ shift: true })
        expect(screen.getByTestId('three')).toHaveFocus()

        await userEvent.tab()
        expect(screen.getByTestId('one')).toHaveFocus()
      })

      it('when false', async () => {
        render(FocusManagerApp, { modal: false })

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        await userEvent.tab()
        expect(screen.getByTestId('two')).toHaveFocus()

        await userEvent.tab()
        expect(screen.getByTestId('three')).toHaveFocus()

        await userEvent.tab()
        await flushTimeout()

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        expect(screen.getByTestId('last')).toHaveFocus()
      })

      it('closeOnFocusOut false keeps a non-modal element open when focus leaves', async () => {
        render(FocusManagerApp, { modal: false, closeOnFocusOut: false })

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('floating')).toBeInTheDocument()

        await userEvent.tab()
        expect(screen.getByTestId('two')).toHaveFocus()

        await userEvent.tab()
        expect(screen.getByTestId('three')).toHaveFocus()

        await userEvent.tab()
        await flushTimeout()

        expect(screen.getByTestId('floating')).toBeInTheDocument()
        expect(screen.getByTestId('last')).toHaveFocus()
      })

      it('clicking a nested click trigger does not suppress the next focus-out close', async () => {
        render(FocusManagerNestedClickTrigger)

        await userEvent.click(screen.getByTestId('reference'))

        await waitFor(() => {
          expect(screen.getByTestId('floating')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByTestId('nested-trigger'))
        await waitFor(() => {
          expect(screen.getByTestId('nested-floating')).toBeInTheDocument()
        })

        await userEvent.keyboard('{Escape}')
        await waitFor(() => {
          expect(screen.queryByTestId('nested-floating')).toBeNull()
        })

        await userEvent.tab()

        await waitFor(() => {
          expect(screen.queryByTestId('floating')).toBeNull()
        })
        expect(screen.getByTestId('last')).toHaveFocus()
      })

      it('false - comboboxes do not hide all other nodes', async () => {
        render(FocusManagerComboboxOutsideNodes)

        await fireEvent.focus(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('reference')).not.toHaveAttribute('inert')
        expect(screen.getByTestId('floating')).not.toHaveAttribute('inert')
        expect(screen.getByTestId('btn-1')).not.toHaveAttribute('inert')
        expect(screen.getByTestId('btn-2')).not.toHaveAttribute('inert')
      })

      it('falls back to the floating element when it has no tabbable content', async () => {
        render(FocusManagerNoTabbableContent)

        await waitFor(() => {
          expect(screen.getByTestId('floating')).toHaveFocus()
        })
        await userEvent.tab()
        expect(screen.getByTestId('floating')).toHaveFocus()
        await userEvent.tab({ shift: true })
        expect(screen.getByTestId('floating')).toHaveFocus()
      })

      it('mixed modality and nesting', async () => {
        render(FocusManagerMixedModality)

        await userEvent.click(screen.getByTestId('open-dialog'))
        await userEvent.click(screen.getByTestId('open-nested-dialog'))

        expect(screen.getByTestId('close-dialog')).toBeInTheDocument()
        expect(screen.getByTestId('close-nested-dialog')).toBeInTheDocument()
      })

      it('true - applies aria-hidden to outside nodes', async () => {
        render(FocusManagerOutsideNodes)

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('reference')).toHaveAttribute('aria-hidden', 'true')
        expect(screen.getByTestId('floating')).not.toHaveAttribute('aria-hidden')
        expect(screen.getByTestId('aria-live')).not.toHaveAttribute('aria-hidden')
        expect(screen.getByTestId('btn-1')).toHaveAttribute('aria-hidden', 'true')
        expect(screen.getByTestId('btn-2')).toHaveAttribute('aria-hidden', 'true')

        await fireEvent.click(screen.getByTestId('reference'))

        expect(screen.getByTestId('reference')).not.toHaveAttribute('aria-hidden')
        expect(screen.getByTestId('aria-live')).not.toHaveAttribute('aria-hidden')
        expect(screen.getByTestId('btn-1')).not.toHaveAttribute('aria-hidden')
        expect(screen.getByTestId('btn-2')).not.toHaveAttribute('aria-hidden')
      })

      it('true - keeps supplied inside elements outside the floating node exposed to assistive tech', async () => {
        render(FocusManagerInsideElements)

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('floating')).not.toHaveAttribute('aria-hidden')
        expect(screen.getByTestId('dismiss')).not.toHaveAttribute('aria-hidden')
        expect(screen.getByTestId('outside-wrapper')).toHaveAttribute('aria-hidden', 'true')
      })

      it('false - does not apply inert to outside nodes', async () => {
        render(FocusManagerOutsideNodes, { modal: false, floatingRole: 'listbox' })

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('floating')).not.toHaveAttribute('inert')
        expect(screen.getByTestId('aria-live')).not.toHaveAttribute('inert')
        expect(screen.getByTestId('btn-1')).not.toHaveAttribute('inert')
        expect(screen.getByTestId('btn-2')).not.toHaveAttribute('inert')
        expect(screen.getByTestId('reference')).toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('outside-wrapper')).toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('btn-1')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('btn-2')).not.toHaveAttribute('data-shards-ui-inert')

        await fireEvent.click(screen.getByTestId('reference'))

        expect(screen.getByTestId('reference')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('outside-wrapper')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('btn-1')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('btn-2')).not.toHaveAttribute('data-shards-ui-inert')
      })

      it('false - keeps the marker on the top-level outside ancestor when the reference has siblings', async () => {
        render(FocusManagerReferenceSiblings)

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('floating')).not.toHaveAttribute('inert')
        expect(screen.getByTestId('outside-wrapper')).toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('outside-sibling')).toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('reference')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('btn-1')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('btn-2')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('nested-wrapper')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('nested-btn')).not.toHaveAttribute('data-shards-ui-inert')

        await fireEvent.click(screen.getByTestId('reference'))

        expect(screen.getByTestId('outside-wrapper')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('outside-sibling')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('reference')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('btn-1')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('btn-2')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('nested-wrapper')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('nested-btn')).not.toHaveAttribute('data-shards-ui-inert')
      })
    })

    describe('disabled', () => {
      it('true -> false', async () => {
        render(FocusManagerDisabled)

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()
        expect(screen.getByTestId('floating')).not.toHaveFocus()

        await fireEvent.click(screen.getByTestId('toggle'))
        await flushFrame()
        await waitFor(() => {
          expect(screen.getByTestId('floating')).toHaveFocus()
        })
      })

      it('when false', async () => {
        render(FocusManagerDisabled, { disabled: false, floatingRole: undefined })

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()
        expect(screen.getByTestId('floating')).toHaveFocus()
      })

      it('supports keepMounted behavior', async () => {
        render(FocusManagerKeepMounted)

        await flushFrame()

        expect(screen.getByTestId('floating')).not.toHaveFocus()

        await fireEvent.click(screen.getByTestId('reference'))

        await flushFrame()

        await waitFor(() => {
          expect(screen.getByTestId('child')).toHaveFocus()
        })

        await userEvent.tab()

        expect(screen.getByTestId('after')).toHaveFocus()

        await userEvent.tab({ shift: true })

        await fireEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('child')).toHaveFocus()

        await userEvent.keyboard('{Escape}')

        await waitFor(() => {
          expect(screen.getByTestId('reference')).toHaveFocus()
        })
      })

      it('preserves keyboard close modality when reopening before focus restoration', async () => {
        render(FocusManagerReopenOnClose)

        const reference = screen.getByTestId('reference')
        const focusSpy = vi.spyOn(reference, 'focus')

        try {
          await userEvent.click(reference)
          await waitFor(() => {
            expect(screen.getByTestId('child')).toHaveFocus()
          })

          await fireEvent.click(screen.getByTestId('reopen-on-close'))
          await userEvent.keyboard('{Escape}')

          await waitFor(() => {
            expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true, focusVisible: true })
          })
          expect(screen.getByTestId('open-state')).toHaveTextContent('true')
        } finally {
          focusSpy.mockRestore()
        }
      })
    })

    describe('non-modal + portal', () => {
      it('focuses inside element, tabbing out focuses last document element', async () => {
        render(FocusManagerNonModalPortal)

        await userEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('inside')).toHaveFocus()

        await userEvent.tab()

        expect(screen.queryByTestId('floating')).not.toBeInTheDocument()
        expect(screen.getByTestId('last')).toHaveFocus()
      })

      it('does not mark reference siblings due to outside focus guards', async () => {
        render(FocusManagerPortalReferenceSiblings)

        await userEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        expect(screen.getByTestId('floating')).toBeInTheDocument()
        expect(screen.getByTestId('reference')).not.toHaveAttribute('data-shards-ui-inert')
        expect(screen.getByTestId('reference-sibling-1')).not.toHaveAttribute(
          'data-shards-ui-inert'
        )
        expect(screen.getByTestId('reference-sibling-2')).not.toHaveAttribute(
          'data-shards-ui-inert'
        )
      })

      it('shift+tab', async () => {
        render(FocusManagerNonModalPortal)

        await userEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        await userEvent.tab({ shift: true })

        expect(screen.getByTestId('floating')).toBeInTheDocument()

        await userEvent.tab({ shift: true })

        await waitFor(() => {
          expect(screen.queryByTestId('floating')).not.toBeInTheDocument()
        })
      })
    })

    describe('navigation', () => {
      it('does not focus the reference when hovering it', async () => {
        render(FocusManagerNavigation)

        await userEvent.hover(screen.getByText('Product'))
        await userEvent.unhover(screen.getByText('Product'))

        expect(screen.getByText('Product')).not.toHaveFocus()
      })

      it('returns focus to the reference when a hover-opened element is closed by Escape', async () => {
        render(FocusManagerNavigation)

        await userEvent.hover(screen.getByText('Product'))
        await flushFrame()
        await userEvent.keyboard('{Escape}')

        await waitFor(() => {
          expect(screen.getByText('Product')).toHaveFocus()
        })
      })

      it('returns focus to the reference when a hover-opened element is closed by its close button', async () => {
        render(FocusManagerNavigation)

        await userEvent.hover(screen.getByText('Product'))
        await flushFrame()

        await userEvent.click(screen.getByText('Close').parentElement!)
        await userEvent.keyboard('{Tab}')

        expect(screen.getByText('Close')).toHaveFocus()

        await userEvent.keyboard('{Enter}')

        await waitFor(() => {
          expect(screen.getByText('Product')).toHaveFocus()
        })
      })

      it('does not re-open after closing via the Escape key', async () => {
        render(FocusManagerNavigation)

        await userEvent.hover(screen.getByText('Product'))
        await userEvent.keyboard('{Escape}')

        expect(screen.queryByText('Link 1')).not.toBeInTheDocument()
      })

      it('closes when unhovering the floating element even when focus is inside it', async () => {
        render(FocusManagerNavigation)

        await userEvent.hover(screen.getByText('Product'))
        await userEvent.click(screen.getByTestId('subnavigation'))
        await userEvent.unhover(screen.getByTestId('subnavigation'))
        await userEvent.hover(screen.getByText('Product'))
        await userEvent.unhover(screen.getByText('Product'))

        expect(screen.queryByTestId('subnavigation')).not.toBeInTheDocument()
      })
    })
  })

  describe('restoreFocus', () => {
    it.skipIf(isJSDOM || isGecko || isWebKit)(
      'true: restores focus to the nearest tabbable element when the focused element is removed',
      async () => {
        render(FocusManagerRestoreApp)

        await userEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        const two = screen.getByRole('button', { name: 'two' })
        const three = screen.getByRole('button', { name: 'three' })
        const remove = screen.getByText('remove')

        expect(two).toHaveFocus()

        await fireEvent.click(remove)

        await waitFor(() => {
          expect(three).toHaveFocus()
        })
      }
    )

    it.skipIf(isJSDOM)(
      'false: does not restore focus to the nearest tabbable element when the focused element is removed',
      async () => {
        render(FocusManagerRestoreApp, { restoreFocus: false })

        await userEvent.click(screen.getByTestId('reference'))
        await flushFrame()

        const two = screen.getByRole('button', { name: 'two' })
        const remove = screen.getByText('remove')

        expect(two).toHaveFocus()

        await fireEvent.click(remove)
        await flushFrame()

        await waitFor(() => {
          expect(document.body).toHaveFocus()
        })
      }
    )

    it('restores focus to the nearest tabbable element when the focused element becomes hidden', async () => {
      render(FocusManagerRestoreApp)

      await userEvent.click(screen.getByTestId('reference'))
      await flushFrame()

      const two = screen.getByRole('button', { name: 'two' })
      const three = screen.getByRole('button', { name: 'three' })

      expect(two).toHaveFocus()

      document.body.tabIndex = -1
      two.style.visibility = 'hidden'
      document.body.focus()

      await waitFor(() => {
        expect(three).toHaveFocus()
      })
    })

    it.skipIf(isJSDOM || isGecko || isWebKit)(
      'popup: moves focus back into the popup when the focused child is removed',
      async () => {
        const { rerender } = render(FocusManagerRestore, { removed: false })

        await userEvent.click(screen.getByTestId('reference'))

        await waitFor(() => {
          expect(screen.getByTestId('two')).toHaveFocus()
        })

        await rerender({ removed: true })

        await waitFor(() => {
          expect(screen.getByTestId('floating')).toHaveFocus()
        })
      }
    )
  })

  describe.skipIf(!isJSDOM)('jsdom-only coverage', () => {
    it('trapped combobox prevents focus moving outside the floating element', async () => {
      render(FocusManagerTrappedCombobox)

      await userEvent.click(screen.getByTestId('input'))
      await flushFrame()

      expect(screen.getByTestId('input')).not.toHaveFocus()
      expect(screen.getByRole('button', { name: 'one' })).toHaveFocus()
      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'two' })).toHaveFocus()
      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'one' })).toHaveFocus()
    })

    it('untrapped combobox creates non-modal focus management', async () => {
      render(FocusManagerUntrappedCombobox)

      await userEvent.click(screen.getByTestId('input'))
      await flushFrame()

      expect(screen.getByTestId('input')).toHaveFocus()
      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'one' })).toHaveFocus()
      await userEvent.tab({ shift: true })
      expect(screen.getByTestId('input')).toHaveFocus()
    })

    it('returns focus to the last connected element', async () => {
      render(FocusManagerLastConnected)

      await userEvent.click(screen.getByTestId('parent-reference'))

      await waitFor(() => {
        expect(screen.getByTestId('parent-floating-reference')).toHaveFocus()
      })

      await userEvent.click(screen.getByTestId('parent-floating-reference'))

      await waitFor(() => {
        expect(screen.getByTestId('child-reference')).toHaveFocus()
      })

      await userEvent.keyboard('{Escape}')

      await waitFor(() => {
        expect(screen.getByTestId('parent-reference')).toHaveFocus()
      })
    })

    it('places focus on the element carrying the floating props when the floating element is a wrapper', async () => {
      render(FocusManagerWrapperFloating)

      await userEvent.click(screen.getByRole('button'))
      await flushFrame()

      expect(screen.getByTestId('inner')).toHaveFocus()
    })

    it('floating element closes upon tabbing out of a modal combobox', async () => {
      render(FocusManagerModalCombobox)

      await userEvent.click(screen.getByTestId('input'))
      await flushFrame()

      expect(screen.getByTestId('input')).toHaveFocus()
      await userEvent.tab()
      await flushFrame()

      expect(screen.getByTestId('after')).toHaveFocus()
    })

    it('untrapped typeable combobox closes on the second tab sequence (click -> tab -> click -> tab)', async () => {
      render(FocusManagerModalCombobox)

      await userEvent.click(screen.getByTestId('input'))
      await flushFrame()

      expect(screen.getByTestId('input')).toHaveFocus()

      await userEvent.tab()
      await flushFrame()

      expect(screen.getByTestId('after')).toHaveFocus()
      expect(screen.queryByTestId('floating')).not.toBeInTheDocument()

      await userEvent.click(screen.getByTestId('input'))
      await flushFrame()

      expect(screen.getByTestId('input')).toHaveFocus()

      await userEvent.tab()
      await flushFrame()

      expect(screen.getByTestId('after')).toHaveFocus()
      expect(screen.queryByTestId('floating')).not.toBeInTheDocument()
    })

    it('focus does not return to the trigger when the floating element is triggered by hover', async () => {
      render(FocusManagerHover)

      const reference = screen.getByTestId('reference')

      reference.focus()

      await userEvent.hover(reference)
      await flushFrame()

      expect(screen.getByTestId('floating')).toHaveFocus()

      await userEvent.unhover(screen.getByTestId('floating'))

      expect(screen.getByTestId('reference')).not.toHaveFocus()
    })

    it('uses aria-hidden instead of inert on outside nodes if opened with hover and modal', async () => {
      render(FocusManagerHover)

      await userEvent.hover(screen.getByTestId('reference'))
      await flushFrame()

      expect(screen.getByText('outside')).not.toHaveAttribute('inert')
      expect(screen.getByText('outside')).toHaveAttribute('aria-hidden', 'true')
    })

    it('floating element with no focusable elements and no listbox role gets tabindex 0 when initialFocus is false', async () => {
      render(FocusManagerFloatingTabIndex, { initialFocus: false })

      const reference = screen.getByTestId('reference')
      await userEvent.click(reference)
      await flushFrame()
      await fireEvent.focusOut(reference)
      await flushFrame()

      expect(screen.getByTestId('floating')).toHaveAttribute('tabindex', '0')
    })

    it('floating element with a managed tabindex is downgraded once content becomes tabbable', async () => {
      const { rerender } = render(FocusManagerManagedTabIndex)
      await flushFrame()

      const reference = screen.getByTestId('reference')
      reference.focus()

      expect(screen.getByTestId('floating')).toHaveAttribute('tabindex', '0')

      await rerender({ hasTabbableContent: true })
      await flushFrame()

      await fireEvent.focusOut(reference, { relatedTarget: screen.getByTestId('inside') })
      await flushFrame()

      expect(screen.getByTestId('floating')).toHaveAttribute('tabindex', '-1')
    })

    it('floating element with a listbox role ignores the tabindex setting', async () => {
      render(FocusManagerFloatingTabIndex, { initialFocus: false, floatingRole: 'listbox' })

      await userEvent.click(screen.getByTestId('reference'))
      await flushFrame()

      expect(screen.getByTestId('floating')).toHaveAttribute('tabindex', '-1')
    })

    it('handles a manual tabindex on a dialog floating element', async () => {
      render(FocusManagerFloatingTabIndex)

      await userEvent.click(screen.getByTestId('reference'))
      await flushFrame()

      expect(screen.getByTestId('floating')).toHaveAttribute('tabindex', '0')
      await userEvent.tab({ shift: true })
      expect(screen.getByTestId('reference')).toHaveFocus()
      await userEvent.tab()
      expect(screen.getByTestId('floating')).toHaveFocus()
    })

    it('standard tabbing back and forth of a non-modal floating element', async () => {
      render(FocusManagerNonModalPortalDialog)

      await userEvent.click(screen.getByTestId('reference'))
      await flushFrame()

      expect(screen.getByTestId('floating')).toHaveAttribute('tabindex', '-1')
      expect(screen.getByTestId('inner')).toHaveFocus()
      await userEvent.tab({ shift: true })
      expect(screen.getByTestId('reference')).toHaveFocus()
      await userEvent.tab()
      expect(screen.getByTestId('inner')).toHaveFocus()
    })
  })
})
