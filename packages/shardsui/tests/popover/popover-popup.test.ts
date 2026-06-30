import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicPopover from './fixtures/basic-popover.svelte'
import PopoverDisplayNone from './fixtures/popover-display-none.svelte'
import PopoverFinalFocus from './fixtures/popover-final-focus.svelte'
import PopoverHover from './fixtures/popover-hover.svelte'
import PopoverInitialFocusFn from './fixtures/popover-initial-focus-fn.svelte'
import PopoverInitialFocus from './fixtures/popover-initial-focus.svelte'
import PopoverPopupOutsidePositioner from './fixtures/popover-popup-outside-positioner.svelte'
import PopoverPopupOutsideRoot from './fixtures/popover-popup-outside-root.svelte'
import PopoverToolbar from './fixtures/popover-toolbar.svelte'

describe('<Popover.Popup />', () => {
  it('throws a descriptive error when rendered outside <Popover.Root>', () => {
    expect(() => render(PopoverPopupOutsideRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <Popover.Root>.'
    )
  })

  it('throws a descriptive error when rendered outside <Popover.Positioner>', () => {
    expect(() => render(PopoverPopupOutsidePositioner)).toThrow(
      'ShardsUI: this part must be rendered inside <Popover.Positioner>.'
    )
  })

  it('renders the children', async () => {
    const user = userEvent.setup()
    render(BasicPopover, { open: false })

    await user.click(screen.getByTestId('trigger'))

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  describe('prop: initialFocus', () => {
    it('focuses the first focusable element within the popup by default', async () => {
      render(PopoverInitialFocus, { open: false })

      fireEvent.click(screen.getByTestId('trigger'))

      await waitFor(() => expect(screen.getByTestId('input-1')).toHaveFocus())
    })

    it('focuses the element provided to initialFocus when opened', async () => {
      render(PopoverInitialFocus, { open: false, useSecondInput: true })

      await fireEvent.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.getByTestId('input-2')).toHaveFocus()
      })
    })

    it('focuses the element provided to initialFocus as a function when open', async () => {
      const user = userEvent.setup()
      render(PopoverInitialFocus, {
        open: false,
        initialFocus: () => document.querySelector<HTMLInputElement>('[data-testid="input-2"]')
      })

      await user.click(screen.getByTestId('trigger'))

      await waitFor(() => {
        expect(screen.getByTestId('input-2')).toHaveFocus()
      })
    })

    it('supports element-returning function and no-op via void for initialFocus (keyboard vs pointer)', async () => {
      const user = userEvent.setup()
      render(PopoverInitialFocusFn, { open: false })

      const trigger = screen.getByTestId('trigger')

      trigger.focus()
      await user.click(trigger)

      await waitFor(() => {
        expect(trigger).toHaveFocus()
      })

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(screen.getByTestId('input-2')).toHaveFocus()
      })
    })

    it('passes the latest interaction type to initialFocus after reopening (keyboard then touch)', async () => {
      const user = userEvent.setup()
      const types: string[] = []
      render(PopoverInitialFocusFn, {
        open: false,
        onInteractionType: (t: string) => types.push(t)
      })

      const trigger = screen.getByTestId('trigger')
      trigger.focus()
      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(types.at(-1)).toBe('keyboard')
      })

      await user.keyboard('{Escape}')
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.click(trigger, { detail: 1 })

      await waitFor(() => {
        expect(types.at(-1)).toBe('touch')
      })
    })

    it('does not move focus into the popup when initialFocus is false', async () => {
      render(PopoverInitialFocus, { open: false, initialFocus: false })

      await fireEvent.click(screen.getByTestId('trigger'))

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())
      expect(screen.getByTestId('input-1')).not.toHaveFocus()
      expect(screen.getByTestId('input-2')).not.toHaveFocus()
      expect(screen.getByTestId('input-3')).not.toHaveFocus()
    })

    it('does not move focus when initialFocus returns false', async () => {
      const user = userEvent.setup()
      render(PopoverInitialFocus, { open: false, initialFocus: () => false })

      const trigger = screen.getByTestId('trigger')
      trigger.focus()
      await user.click(trigger)

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())
      expect(trigger).toHaveFocus()
      expect(screen.getByTestId('input-1')).not.toHaveFocus()
    })

    it('default focus when initialFocus returns true', async () => {
      render(PopoverInitialFocus, { open: false, initialFocus: () => true })

      fireEvent.click(screen.getByTestId('trigger'))

      await waitFor(() => expect(screen.getByTestId('input-1')).toHaveFocus())
    })

    it('uses default behavior when initialFocus returns null', async () => {
      render(PopoverInitialFocus, { open: false, initialFocus: () => null })

      fireEvent.click(screen.getByTestId('trigger'))

      await waitFor(() => expect(screen.getByTestId('input-1')).toHaveFocus())
    })

    it.skipIf(isJSDOM)(
      'focuses the popup when the active element becomes display:none',
      async () => {
        const user = userEvent.setup()
        render(PopoverDisplayNone)

        await waitFor(() => expect(screen.getByTestId('hide-button')).toHaveFocus())

        await user.click(screen.getByTestId('hide-button'))

        await waitFor(() => expect(screen.getByTestId('popup')).toHaveFocus())
      }
    )
  })

  describe('openOnHover: delay + click', () => {
    it('returns focus to the trigger if opened by click before the hover delay completes', async () => {
      render(PopoverHover, { openOnHover: true, delay: 300, includeClose: true })
      const trigger = screen.getByTestId('trigger')

      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)
      fireEvent.click(trigger)

      await waitFor(() => expect(screen.getByTestId('close')).toBeInTheDocument())

      fireEvent.click(screen.getByTestId('close'))

      await waitFor(() => expect(trigger).toHaveFocus())
    })
  })

  describe('prop: finalFocus', () => {
    it('returns focus to the trigger by default when closed', async () => {
      render(PopoverInitialFocus, { open: true })

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())

      await fireEvent.keyDown(document, { key: 'Escape' })

      await waitFor(() => {
        expect(screen.getByTestId('trigger')).toHaveFocus()
      })
    })

    it('focuses the element provided to finalFocus (ref) when closed', async () => {
      const user = userEvent.setup()
      render(PopoverFinalFocus, { open: true, variant: 'ref' })

      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(screen.getByTestId('final-input')).toHaveFocus()
      })
    })

    it('focuses the element provided to finalFocus as a function when closed', async () => {
      const user = userEvent.setup()
      render(PopoverFinalFocus, { open: true, variant: 'fn-element' })

      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(screen.getByTestId('final-input')).toHaveFocus()
      })
    })

    it('does not move focus when finalFocus is false', async () => {
      const user = userEvent.setup()
      render(PopoverFinalFocus, { open: true, variant: 'false' })

      const trigger = screen.getByTestId('trigger')
      await user.click(screen.getByTestId('close'))

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
      expect(trigger).not.toHaveFocus()
    })

    it('moves focus to the trigger when finalFocus returns true', async () => {
      const user = userEvent.setup()
      render(PopoverFinalFocus, { open: true, variant: 'true' })

      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(screen.getByTestId('trigger')).toHaveFocus()
      })
    })

    it('selects element vs trigger based on closeType (keyboard returns input — pointer returns true)', async () => {
      const user = userEvent.setup()
      render(PopoverFinalFocus, { open: false, variant: 'by-close-type' })

      const trigger = screen.getByTestId('trigger')

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())
      await user.click(screen.getByTestId('close'))
      await waitFor(() => {
        expect(trigger).toHaveFocus()
      })

      await user.click(trigger)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())
      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(screen.getByTestId('final-input')).toHaveFocus()
      })
    })

    it('uses default behavior (focuses trigger) when finalFocus returns null', async () => {
      const user = userEvent.setup()
      render(PopoverFinalFocus, { open: true, variant: 'null' })

      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(screen.getByTestId('trigger')).toHaveFocus()
      })
    })
  })

  describe('inside a toolbar', () => {
    it('does not relay composite keys from the popup to the toolbar', async () => {
      const user = userEvent.setup()
      render(PopoverToolbar)

      const first = screen.getByTestId('first')
      const last = screen.getByTestId('last')

      await user.tab()
      expect(first).toHaveFocus()
      await user.keyboard('{ArrowRight}')
      await waitFor(() => expect(last).toHaveFocus())
      await user.keyboard('{ArrowLeft}')
      await waitFor(() => expect(first).toHaveFocus())

      await user.click(screen.getByTestId('trigger'))
      const inside = screen.getByTestId('inside')
      await waitFor(() => expect(inside).toHaveFocus())

      await user.keyboard('{ArrowRight}')

      expect(inside).toHaveFocus()
      expect(last).not.toHaveFocus()
      expect(first).toHaveAttribute('tabindex', '0')
      expect(last).toHaveAttribute('tabindex', '-1')
    })

    it('keeps composite keys working inside the popup content', async () => {
      const user = userEvent.setup()
      render(PopoverToolbar, { content: 'input' })

      await user.click(screen.getByTestId('trigger'))

      const input = screen.getByTestId('inside') as HTMLInputElement
      await waitFor(() => expect(input).toHaveFocus())

      input.setSelectionRange(0, 0)
      await user.keyboard('{ArrowRight}')

      expect(input.selectionStart).toBe(1)
      expect(screen.getByTestId('last')).not.toHaveFocus()
    })
  })
})
