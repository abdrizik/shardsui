import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { flushSync, tick } from 'svelte'
import { expect, vi } from 'vitest'
import { popupConformanceTests } from '../popup-conformance'
import { createTouch, fireTouch, isGecko, isJSDOM, isWebKit } from '../test-utils'
import BasicPopover from './fixtures/basic-popover.svelte'
import PopoverConformance from './fixtures/conformance.svelte'
import DetachedBodyFocus from './fixtures/detached-body-focus.svelte'
import DisabledHover from './fixtures/disabled-hover.svelte'
import DisappearingTrigger from './fixtures/disappearing-trigger.svelte'
import PopoverDynamicLabels from './fixtures/dynamic-labels.svelte'
import HoverExitTransition from './fixtures/hover-exit-transition.svelte'
import HoverOut from './fixtures/hover-out.svelte'
import KeepMountedReopen from './fixtures/keep-mounted-reopen.svelte'
import PopoverAnimatedComplete from './fixtures/popover-animated-complete.svelte'
import PopoverComboboxScroll from './fixtures/popover-combobox-scroll.svelte'
import PopoverCombobox from './fixtures/popover-combobox.svelte'
import PopoverControlledOnChange from './fixtures/popover-controlled-on-change.svelte'
import PopoverFocusGuards from './fixtures/popover-focus-guards.svelte'
import PopoverHoverReopenTransition from './fixtures/popover-hover-reopen-transition.svelte'
import PopoverHover from './fixtures/popover-hover.svelte'
import PopoverMenu from './fixtures/popover-menu.svelte'
import PopoverModalClose from './fixtures/popover-modal-close.svelte'
import PopoverMultipleTriggers from './fixtures/popover-multiple-triggers.svelte'
import PopoverNestedMenuTab from './fixtures/popover-nested-menu-tab.svelte'
import PopoverNestedProgrammatic from './fixtures/popover-nested-programmatic.svelte'
import PopoverNested from './fixtures/popover-nested.svelte'
import PopoverPointerDownOutside from './fixtures/popover-pointer-down-outside.svelte'
import PopoverRemoveOnPointerDown from './fixtures/popover-remove-on-pointer-down.svelte'
import PopoverRewireDismiss from './fixtures/popover-rewire-dismiss.svelte'
import PopoverVetoClose from './fixtures/popover-veto-close.svelte'
import PopoverVetoOpen from './fixtures/popover-veto-open.svelte'
import PopoverWithClose from './fixtures/popover-with-close.svelte'
import PopoverWithOpenChangeComplete from './fixtures/popover-with-open-change-complete.svelte'
import ScrollLock from './fixtures/scroll-lock.svelte'

const PATIENT_CLICK_THRESHOLD = 500

describe('<Popover.Root />', () => {
  it('keeps accessible names and descriptions in sync when label parts change', async () => {
    const user = userEvent.setup()
    render(PopoverDynamicLabels)

    const popup = screen.getByRole('dialog')
    const firstTitleId = screen.getByText('Title 1').getAttribute('id')
    const firstDescriptionId = screen.getByText('Description 1').getAttribute('id')

    expect(popup.getAttribute('aria-labelledby')).toBe(firstTitleId)
    expect(popup.getAttribute('aria-describedby')).toBe(firstDescriptionId)

    await user.click(screen.getByRole('button', { name: 'Change labels' }))

    const secondTitleId = screen.getByText('Title 2').getAttribute('id')
    const secondDescriptionId = screen.getByText('Description 2').getAttribute('id')

    await waitFor(() => expect(popup.getAttribute('aria-labelledby')).toBe(secondTitleId))
    await waitFor(() => expect(popup.getAttribute('aria-describedby')).toBe(secondDescriptionId))
    expect(secondTitleId).not.toBe(firstTitleId)
    expect(secondDescriptionId).not.toBe(firstDescriptionId)

    await user.click(screen.getByRole('button', { name: 'Change labels' }))

    await waitFor(() => expect(popup).not.toHaveAttribute('aria-labelledby'))
    await waitFor(() => expect(popup).not.toHaveAttribute('aria-describedby'))
  })
  popupConformanceTests({
    component: PopoverConformance,
    triggerMouseAction: 'click',
    expectedPopupRole: 'dialog'
  })

  it('renders the children', async () => {
    render(BasicPopover, { open: false })

    expect(screen.getByText('Toggle')).not.toBeNull()
  })

  describe('open / close behaviour', () => {
    it('is not open by default — content not in DOM', () => {
      render(BasicPopover, { open: false })

      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.queryByText('Content')).toBeNull()
    })

    it('opens when trigger is clicked', async () => {
      const user = userEvent.setup()
      render(BasicPopover, { open: false })

      await user.click(screen.getByTestId('trigger'))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('closes when anchor is clicked twice (fireEvent)', async () => {
      render(BasicPopover, { open: false })

      const anchor = screen.getByRole('button', { name: 'Toggle' })

      await fireEvent.click(anchor)
      expect(screen.getByText('Content')).toBeInTheDocument()

      await fireEvent.click(anchor)
      expect(screen.queryByText('Content')).toBeNull()
    })
  })

  describe('initial open', () => {
    it('open when the component is rendered with open=true', async () => {
      render(BasicPopover, { open: true })

      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('closes on trigger click when open is not bound', async () => {
      render(BasicPopover, { open: true })

      expect(screen.getByText('Content')).toBeInTheDocument()

      const anchor = screen.getByTestId('trigger')
      await fireEvent.click(anchor)

      expect(screen.queryByText('Content')).toBeNull()
    })
  })

  describe('prop: delay, openOnHover', () => {
    it('does not open before the delay elapses', async () => {
      render(PopoverHover, { openOnHover: true, delay: 200 })

      const trigger = screen.getByTestId('trigger')
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      expect(screen.queryByTestId('popover-popup')).toBeNull()
    })

    it('opens after the delay elapses', async () => {
      vi.useFakeTimers()
      try {
        render(PopoverHover, { openOnHover: true, delay: 100 })

        const trigger = screen.getByTestId('trigger')
        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)

        expect(screen.queryByTestId('popover-popup')).toBeNull()

        await vi.advanceTimersByTimeAsync(100)

        expect(screen.getByTestId('popover-popup')).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('prop: closeDelay, openOnHover', () => {
    it('does not close immediately — stays visible right after mouseleave', async () => {
      render(PopoverHover, { openOnHover: true, delay: 0, closeDelay: 200 })

      const trigger = screen.getByTestId('trigger')
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      await waitFor(() => {
        expect(screen.getByTestId('popover-popup')).toBeInTheDocument()
      })

      fireEvent.mouseLeave(trigger)
      expect(screen.getByTestId('popover-popup')).toBeInTheDocument()
    })

    it('closes after the close delay elapses', async () => {
      vi.useFakeTimers()
      try {
        render(PopoverHover, { openOnHover: true, delay: 0, closeDelay: 100 })

        const trigger = screen.getByTestId('trigger')
        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(screen.getByTestId('popover-popup')).toBeInTheDocument()

        fireEvent.mouseLeave(trigger)
        expect(screen.getByTestId('popover-popup')).toBeInTheDocument()

        await vi.advanceTimersByTimeAsync(100)

        expect(screen.queryByTestId('popover-popup')).toBeNull()
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('impatient/patient clicks with openOnHover', () => {
    it('does not close the popover if the user clicks impatiently (within threshold)', async () => {
      vi.useFakeTimers()
      try {
        render(PopoverHover, { openOnHover: true, delay: 0 })
        const trigger = screen.getByTestId('trigger')

        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        await vi.advanceTimersByTimeAsync(0)
        expect(trigger).toHaveAttribute('data-popup-open')

        await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD - 1)
        fireEvent.click(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(trigger).toHaveAttribute('data-popup-open')
      } finally {
        vi.useRealTimers()
      }
    })

    it('closes the popover if the user clicks patiently (after threshold)', async () => {
      vi.useFakeTimers()
      try {
        render(PopoverHover, { openOnHover: true, delay: 0 })
        const trigger = screen.getByTestId('trigger')

        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        await vi.advanceTimersByTimeAsync(0)
        expect(trigger).toHaveAttribute('data-popup-open')

        await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD)
        fireEvent.click(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(trigger).not.toHaveAttribute('data-popup-open')
      } finally {
        vi.useRealTimers()
      }
    })

    it('sticks (stays open after mouseleave) if clicked impatiently', async () => {
      vi.useFakeTimers()
      try {
        render(PopoverHover, { openOnHover: true, delay: 0 })
        const trigger = screen.getByTestId('trigger')

        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD - 1)
        fireEvent.click(trigger)
        fireEvent.mouseLeave(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(trigger).toHaveAttribute('data-popup-open')
        await vi.advanceTimersByTimeAsync(1)
        expect(trigger).toHaveAttribute('data-popup-open')
      } finally {
        vi.useRealTimers()
      }
    })

    it('does not stick if clicked patiently', async () => {
      vi.useFakeTimers()
      try {
        render(PopoverHover, { openOnHover: true, delay: 0 })
        const trigger = screen.getByTestId('trigger')

        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        await vi.advanceTimersByTimeAsync(PATIENT_CLICK_THRESHOLD)
        fireEvent.click(trigger)
        fireEvent.mouseLeave(trigger)
        await vi.advanceTimersByTimeAsync(0)

        expect(trigger).not.toHaveAttribute('data-popup-open')
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe('modal focus management (Close rendered)', () => {
    function isElementOrAncestorInert(element: HTMLElement): boolean {
      let current: HTMLElement | null = element
      while (current) {
        if (
          current.getAttribute('aria-hidden') === 'true' ||
          current.hasAttribute('inert') ||
          current.hasAttribute('data-shards-ui-inert')
        ) {
          return true
        }
        current = current.parentElement
      }
      return false
    }

    it('enables modal focus management when modal=true and Close is rendered', async () => {
      render(PopoverModalClose, { open: true, modal: true, includeClose: true })

      await waitFor(() => {
        expect(isElementOrAncestorInert(screen.getByTestId('outside'))).toBe(true)
      })
    })

    it('enables modal focus management when modal="trap-focus" and Close is rendered', async () => {
      render(PopoverModalClose, { open: true, modal: 'trap-focus', includeClose: true })

      await waitFor(() => {
        expect(isElementOrAncestorInert(screen.getByTestId('outside'))).toBe(true)
      })
    })
  })

  describe('controlled onOpenChange', () => {
    it('observes the pre-toggle open value at call time across open -> close', async () => {
      const seen: boolean[] = []
      render(PopoverControlledOnChange, { onSeen: (value: boolean) => seen.push(value) })

      const anchor = screen.getByTestId('trigger')

      await fireEvent.click(anchor)
      await waitFor(() => expect(screen.getByText('Content')).toBeInTheDocument())

      await fireEvent.click(anchor)
      await waitFor(() => expect(screen.queryByText('Content')).toBeNull())

      expect(seen).toEqual([false, true])
    })
  })

  describe('focus management', () => {
    it('focuses the trigger after the popover is closed via Close button', async () => {
      const user = userEvent.setup()
      render(PopoverWithClose, { open: true })

      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

      await user.click(screen.getByTestId('close'))

      await waitFor(() => {
        expect(screen.getByTestId('trigger')).toHaveFocus()
      })
    })

    it('focuses the trigger after the popover is closed but not unmounted', async () => {
      const user = userEvent.setup()
      render(PopoverWithClose, { keepMounted: true })

      const trigger = screen.getByTestId('trigger')
      await user.click(trigger)
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())

      await user.click(screen.getByTestId('close'))

      await waitFor(() => expect(trigger).toHaveFocus(), { timeout: 1500 })
      expect(screen.getByTestId('popup')).toBeInTheDocument()
    })
  })

  it('does not close after hovering out of a popup opened externally', async () => {
    const user = userEvent.setup()
    render(HoverOut, { external: true, openOnHover: true, delay: 0 })

    await user.click(screen.getByTestId('show'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())

    const positioner = screen.getByTestId('positioner')
    fireEvent.mouseEnter(positioner)
    fireEvent.mouseLeave(positioner)

    expect(screen.queryByRole('dialog')).not.toBeNull()
  })

  it('closes after hovering out of a popup opened by its trigger', async () => {
    render(HoverOut, { openOnHover: true, delay: 0 })

    const trigger = screen.getByTestId('trigger')
    fireEvent.mouseEnter(trigger)
    fireEvent.mouseMove(trigger)

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())

    const positioner = screen.getByTestId('positioner')
    fireEvent.mouseEnter(positioner)
    fireEvent.mouseLeave(positioner)

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('does not close after hovering out of a popup opened without trigger hover', async () => {
    render(HoverOut, { open: true, openOnHover: true })

    expect(screen.getByText('Content')).toBeInTheDocument()

    const positioner = screen.getByTestId('positioner')
    fireEvent.mouseEnter(positioner)
    fireEvent.mouseLeave(positioner)

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('close child popover when clicking parent popover', async () => {
    const user = userEvent.setup()
    render(PopoverNested)

    const parentPopup = screen.getByTestId('parent-popup')
    expect(parentPopup).not.toBeNull()

    await user.click(screen.getByTestId('child-trigger'))
    await waitFor(() => expect(screen.getByTestId('child-popup')).toBeInTheDocument())

    await user.click(parentPopup)

    await waitFor(() => expect(screen.queryByTestId('child-popup')).toBeNull())
    expect(screen.queryByTestId('parent-popup')).not.toBeNull()
  })

  it('does not open on hover when disabled', async () => {
    const user = userEvent.setup()
    render(DisabledHover)

    const trigger = screen.getByTestId('trigger')
    expect(trigger).toHaveAttribute('data-disabled')

    await user.hover(trigger)

    expect(screen.queryByText('Content')).toBeNull()
    expect(trigger).not.toHaveAttribute('data-popup-open')
  })

  it('has data-popup-open but not data-pressed when opened by hover', async () => {
    const user = userEvent.setup()
    render(PopoverHover, { openOnHover: true, delay: 0 })

    const trigger = screen.getByTestId('trigger')
    await user.hover(trigger)

    await waitFor(() => expect(trigger).toHaveAttribute('data-popup-open'))
    expect(trigger).not.toHaveAttribute('data-pressed')
  })

  it('sticks when clicked before the hover delay completes', async () => {
    vi.useFakeTimers()
    try {
      render(PopoverHover, { openOnHover: true, delay: 300 })
      const trigger = screen.getByTestId('trigger')

      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      vi.advanceTimersByTime(100)

      fireEvent.click(trigger)
      flushSync()

      expect(trigger).toHaveAttribute('data-popup-open')

      fireEvent.mouseLeave(trigger)

      expect(trigger).toHaveAttribute('data-popup-open')
    } finally {
      vi.useRealTimers()
    }
  })

  it('keep the popover open when re-hovered and clicked within the patient threshold', async () => {
    vi.useFakeTimers()
    try {
      render(PopoverHover, { openOnHover: true, delay: 100 })
      const trigger = screen.getByTestId('trigger')

      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      vi.advanceTimersByTime(100)
      flushSync()

      expect(screen.getByText('Content')).toBeInTheDocument()

      vi.advanceTimersByTime(PATIENT_CLICK_THRESHOLD)

      fireEvent.mouseLeave(trigger)
      fireEvent.mouseEnter(trigger)
      fireEvent.mouseMove(trigger)

      fireEvent.click(trigger)
      flushSync()

      expect(screen.getByText('Content')).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })

  it('does not move focus to the popover when opened with hover', async () => {
    const user = userEvent.setup()
    render(PopoverHover, { openOnHover: true, delay: 0, includeClose: true })

    const trigger = screen.getByTestId('trigger')
    trigger.focus()

    await user.hover(trigger)
    await waitFor(() => expect(screen.getByTestId('close')).toBeInTheDocument())

    expect(screen.getByTestId('close')).not.toHaveFocus()
  })

  it('uses intentional outside press with internal backdrop (modal=true): closes on click not mousedown', async () => {
    const onOpenChange = vi.fn()
    render(BasicPopover, { open: true, modal: true, onOpenChange })

    const internalBackdrop = document.querySelector('[role="presentation"]') as HTMLElement
    expect(internalBackdrop).not.toBeNull()

    fireEvent.mouseDown(internalBackdrop)
    expect(screen.queryByRole('dialog')).not.toBeNull()
    expect(onOpenChange).toHaveBeenCalledTimes(0)

    fireEvent.click(internalBackdrop)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(onOpenChange).toHaveBeenCalledTimes(1)
  })

  it('restores temporarily disabled focus before focusing a reopened keepMounted popover', async () => {
    const user = userEvent.setup()
    render(KeepMountedReopen)

    const trigger = screen.getByTestId('trigger')
    await user.click(trigger)

    const inside = screen.getByTestId('inside')
    await waitFor(() => expect(inside).toHaveFocus())

    await user.tab()

    expect(screen.getByTestId('after')).toHaveFocus()
    await waitFor(() =>
      expect(screen.getByTestId('popover-popup')).not.toHaveAttribute('data-open')
    )

    await user.click(trigger)

    await waitFor(() => expect(inside).toHaveFocus())
  })

  it('keeps the popover open when a nested Menu opens via Enter using a shared container', async () => {
    const user = userEvent.setup()
    render(PopoverMenu)

    const trigger = screen.getByTestId('trigger')
    trigger.focus()
    await user.keyboard('{Enter}')
    await screen.findByTestId('popover-popup')

    const nestedTrigger = screen.getByTestId('menu-trigger')
    nestedTrigger.focus()
    await user.keyboard('{Enter}')
    await screen.findByTestId('menu-popup')

    expect(screen.getByTestId('popover-popup')).not.toBeNull()
  })

  it('keeps the popover open when a nested Menu opens via pointer using a shared container', async () => {
    const user = userEvent.setup()
    render(PopoverMenu, { closeOnClick: false })

    await user.click(screen.getByTestId('trigger'))
    await screen.findByTestId('popover-popup')

    await user.click(screen.getByTestId('menu-trigger'))
    await screen.findByTestId('menu-popup')

    await user.click(screen.getByTestId('menu-item'))

    await waitFor(() => expect(screen.getByTestId('popover-popup')).not.toBeNull())
  })

  it.skipIf(isJSDOM)('closes a nested Combobox popup when tabbing out of the popover', async () => {
    const user = userEvent.setup()
    render(PopoverCombobox, { withFocusTarget: true })

    const comboboxInput = screen.getByTestId('combobox-input')
    await user.click(comboboxInput)

    await waitFor(() => expect(screen.getByRole('listbox')).toBeVisible())

    await user.tab()

    expect(screen.getByTestId('focus-target')).toHaveFocus()

    await waitFor(() => expect(screen.getByTestId('popover-popup')).toHaveAttribute('data-closed'))
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  })

  it('closes a nested Combobox popup when tabbing backward to the trigger', async () => {
    const user = userEvent.setup()
    render(PopoverCombobox, { withFocusTarget: false })

    const comboboxInput = screen.getByTestId('combobox-input')
    await user.click(comboboxInput)

    await waitFor(() => expect(screen.getByRole('listbox')).toBeVisible())

    const trigger = screen.getByTestId('trigger')
    expect(trigger).not.toHaveAttribute('aria-hidden', 'true')

    await user.tab({ shift: true })

    expect(trigger).toHaveFocus()
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull())
  })

  it('returns focus to the active trigger when opening programmatically from body focus', async () => {
    const user = userEvent.setup()
    render(DetachedBodyFocus)

    const trigger1 = screen.getByTestId('trigger-1')
    const trigger2 = screen.getByTestId('trigger-2')

    await user.click(trigger1)
    await user.click(screen.getByTestId('close'))
    await waitFor(() => expect(trigger1).toHaveFocus())

    trigger1.blur()
    expect(document.body).toHaveFocus()

    await user.click(screen.getByTestId('open-trigger-2'))
    await waitFor(() => expect(screen.getByTestId('content')).toBeVisible())

    await user.click(screen.getByTestId('close'))
    await waitFor(() => expect(trigger2).toHaveFocus())
  })

  it('returns focus to the previous element when the trigger unmounts while open', async () => {
    const user = userEvent.setup()
    render(DisappearingTrigger)

    const fallback = screen.getByTestId('fallback')
    await user.click(fallback)
    expect(fallback).toHaveFocus()

    await user.click(screen.getByTestId('trigger'))
    await waitFor(() => expect(screen.getByTestId('content')).toBeInTheDocument())

    await user.click(screen.getByTestId('close'))
    await waitFor(() => expect(screen.queryByTestId('content')).toBeNull())
    expect(fallback).toHaveFocus()
  })

  it('does not change focus when opened with hover and closed', async () => {
    const user = userEvent.setup()
    render(HoverExitTransition)

    const trigger = screen.getByTestId('trigger')
    const firstInput = screen.getByTestId('first-input')
    const lastInput = screen.getByTestId('last-input')

    lastInput.focus()

    await user.hover(trigger)
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())

    await user.hover(firstInput)

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

    expect(lastInput).toHaveFocus()
  })

  it.skipIf(isJSDOM)('does not close when scrolling a nested popup on touch', async () => {
    render(PopoverComboboxScroll)

    const popoverPopup = screen.getByTestId('popover-popup')
    expect(popoverPopup).not.toBeNull()

    const comboboxPopup = await screen.findByTestId('combobox-popup')

    const start = createTouch(comboboxPopup, { clientX: 100, clientY: 100 })
    fireTouch(comboboxPopup, 'touchstart', { touches: [start] })

    await new Promise((resolve) => setTimeout(resolve))

    const move = createTouch(comboboxPopup, { clientX: 100, clientY: 50 })
    fireTouch(comboboxPopup, 'touchmove', { touches: [move] })
    fireTouch(comboboxPopup, 'touchend', { changedTouches: [move] })

    await tick()

    expect(screen.queryByTestId('popover-popup')).not.toBeNull()
    expect(screen.queryByTestId('combobox-popup')).not.toBeNull()
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

    it('applies scroll lock when a touch-opened popup covers the viewport width', async () => {
      render(ScrollLock, { wide: true })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })

      const popup = await screen.findByRole('dialog')
      const doc = popup.ownerDocument

      await waitFor(() => {
        const isScrollLocked =
          doc.documentElement.style.overflow === 'hidden' ||
          doc.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
          doc.body.style.overflow === 'hidden'
        expect(isScrollLocked).toBe(true)
      })
    })

    it('does not apply scroll lock when a touch-opened popup is narrower than the viewport', async () => {
      render(ScrollLock, { wide: false })

      const trigger = screen.getByTestId('trigger')
      fireEvent.pointerDown(trigger, { pointerType: 'touch' })
      fireEvent.mouseDown(trigger)
      fireEvent.click(trigger, { detail: 1 })

      const popup = await screen.findByRole('dialog')
      const doc = popup.ownerDocument

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

      const isScrollLocked =
        doc.documentElement.style.overflow === 'hidden' ||
        doc.documentElement.hasAttribute('data-shards-ui-scroll-locked') ||
        doc.body.style.overflow === 'hidden'
      expect(isScrollLocked).toBe(false)
    })
  })

  describe('dismiss rewiring', () => {
    it('rewires dismiss interactions after closing and reopening', async () => {
      render(PopoverRewireDismiss)

      const trigger = screen.getByTestId('trigger')

      await fireEvent.click(trigger)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())

      await fireEvent.keyDown(document, { key: 'Escape' })
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

      await fireEvent.click(trigger)
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())

      await fireEvent.click(document.body)
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    })
  })

  describe('refused open changes', () => {
    it('stays closed when the open transition is refused', async () => {
      render(PopoverVetoOpen)

      await fireEvent.click(screen.getByTestId('trigger'))
      await tick()

      expect(screen.queryByText('Content')).toBeNull()
    })

    it('stays open and keeps the trigger marked open when a close press is refused', async () => {
      render(PopoverVetoClose)

      const trigger = screen.getByTestId('trigger')
      await fireEvent.click(trigger)

      await waitFor(() => expect(screen.getByTestId('popover-popup')).toBeInTheDocument())

      await fireEvent.click(screen.getByTestId('close'))
      await tick()

      expect(screen.getByTestId('popover-popup')).toHaveAttribute('data-open')
      expect(trigger).toHaveAttribute('data-popup-open')
      expect(screen.queryByTestId('close')).not.toBeNull()
    })
  })

  describe('prop: modal', () => {
    it('renders only inside (popup) focus guards when modal=true (no trigger guards)', async () => {
      render(PopoverModalClose, { open: true, modal: true, includeClose: true })

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())

      const trigger = screen.getByTestId('trigger')
      expect(
        trigger.previousElementSibling?.hasAttribute('data-shards-ui-focus-guard') ?? false
      ).toBe(false)
      expect(trigger.nextElementSibling?.hasAttribute('data-shards-ui-focus-guard') ?? false).toBe(
        false
      )
      expect(document.querySelectorAll('[data-shards-ui-focus-guard]')).toHaveLength(2)
    })

    it('keeps trigger focus guards when modal=true but no Close part is rendered', async () => {
      const user = userEvent.setup()
      render(PopoverModalClose, { open: true, modal: true, includeClose: false })

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeNull())

      const trigger = screen.getByTestId('trigger')
      expect(trigger.previousElementSibling).toHaveAttribute('data-shards-ui-focus-guard')
      expect(trigger.nextElementSibling).toHaveAttribute('data-shards-ui-focus-guard')

      screen.getByTestId('input-inside').focus()
      await user.tab()

      expect(screen.getByTestId('focus-target')).toHaveFocus()
      await waitFor(() => expect(screen.queryByTestId('popover-popup')).toBeNull())
    })
  })

  describe('nested popup interactions', () => {
    it('keeps the parent popover open when a press starts in the nested popup and ends outside', async () => {
      render(PopoverNested)

      await waitFor(() => expect(screen.getByTestId('parent-popup')).toBeInTheDocument())

      fireEvent.click(screen.getByTestId('child-trigger'))
      flushSync()

      const childPopup = screen.getByTestId('child-popup')
      fireEvent.pointerDown(childPopup, { pointerType: 'mouse', button: 0 })
      fireEvent.click(screen.getByTestId('outside'))

      await waitFor(() => expect(screen.queryByTestId('parent-popup')).not.toBeNull())
      expect(screen.queryByTestId('child-popup')).not.toBeNull()
    })

    it('returns focus through nested programmatic popovers in close order', async () => {
      const user = userEvent.setup()
      render(PopoverNestedProgrammatic)

      const parentTrigger = screen.getByTestId('parent-trigger')
      await user.click(parentTrigger)

      await waitFor(() => expect(screen.queryByTestId('parent-popup')).not.toBeNull())

      const childOpener = screen.getByTestId('child-opener')
      await user.click(childOpener)

      await waitFor(() => expect(screen.queryByTestId('child-popup')).not.toBeNull())

      await user.click(screen.getByTestId('close-child'))

      await waitFor(() => expect(screen.queryByTestId('child-popup')).toBeNull())
      expect(childOpener).toHaveFocus()
      expect(screen.queryByTestId('parent-popup')).not.toBeNull()

      await user.click(screen.getByTestId('close-parent'))

      await waitFor(() => expect(screen.queryByTestId('parent-popup')).toBeNull())
      expect(parentTrigger).toHaveFocus()
    })
  })

  describe.skipIf(isJSDOM)('prop: onOpenChangeComplete', () => {
    it('is called with true after opening from a closed state', async () => {
      const onOpenChangeComplete = vi.fn()
      render(PopoverWithOpenChangeComplete, { onOpenChangeComplete })

      await fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))

      await waitFor(() => expect(screen.getByTestId('popover-popup')).toBeInTheDocument())

      await waitFor(() => {
        expect(onOpenChangeComplete.mock.calls[0]?.[0]).toBe(true)
      })
    })

    it('is called with false after the popup finishes closing', async () => {
      const onOpenChangeComplete = vi.fn()
      render(PopoverWithOpenChangeComplete, { open: true, onOpenChangeComplete })

      await waitFor(() => {
        expect(onOpenChangeComplete).toHaveBeenCalledWith(true)
      })

      onOpenChangeComplete.mockClear()

      await fireEvent.click(screen.getByRole('button', { name: 'Toggle' }))
      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())

      await waitFor(() => {
        expect(onOpenChangeComplete).toHaveBeenCalledWith(false)
      })
    })

    it('does not get called on mount when not open', async () => {
      const onOpenChangeComplete = vi.fn()
      render(PopoverWithOpenChangeComplete, { onOpenChangeComplete })

      await Promise.resolve()
      expect(onOpenChangeComplete).not.toHaveBeenCalled()
    })
  })

  describe('focus management: tab order with focus guards', () => {
    it('moves focus to the element following the trigger — excluding the popup, when tabbing forward from the open popup', async () => {
      const user = userEvent.setup()
      render(PopoverFocusGuards, { triggerPlacement: 'before-content' })

      await waitFor(() => expect(screen.getByTestId('popover-popup')).toBeInTheDocument())

      const inputInside = screen.getByTestId('input-inside')
      inputInside.focus()

      await user.tab()

      expect(screen.getByTestId('focus-target')).toHaveFocus()

      await waitFor(() => expect(screen.queryByTestId('popover-popup')).toBeNull())
    })

    it('moves focus to the element following the trigger — excluding the popup, when tabbing forward from the open popup (popup preceding the trigger)', async () => {
      const user = userEvent.setup()
      render(PopoverFocusGuards, { triggerPlacement: 'after-content' })

      await waitFor(() => expect(screen.getByTestId('popover-popup')).toBeInTheDocument())

      const inputInside = screen.getByTestId('input-inside')
      inputInside.focus()

      await user.tab()

      expect(screen.getByTestId('focus-target')).toHaveFocus()

      await waitFor(() => expect(screen.queryByTestId('popover-popup')).toBeNull())
    })
  })

  describe('prop: modal with openOnHover', () => {
    it('enables modal behavior after a hover-open is clicked', async () => {
      vi.useFakeTimers()
      try {
        render(PopoverHover, { openOnHover: true, delay: 0, modal: true })

        const trigger = screen.getByTestId('trigger')

        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        flushSync()

        expect(screen.getByTestId('popover-popup')).toBeInTheDocument()

        const positioner = screen.getByTestId('positioner')
        expect(positioner.previousElementSibling).toBeNull()

        vi.advanceTimersByTime(PATIENT_CLICK_THRESHOLD - 1)
        fireEvent.click(trigger)
        flushSync()

        expect(positioner.previousElementSibling).toHaveAttribute('role', 'presentation')
      } finally {
        vi.useRealTimers()
      }
    })

    it('reopens on hover after an impatient click is followed by a close button press', async () => {
      vi.useFakeTimers()
      try {
        render(PopoverHover, { openOnHover: true, delay: 100, includeClose: true })

        const trigger = screen.getByTestId('trigger')

        fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger, { movementX: 10, movementY: 0 })

        vi.advanceTimersByTime(100)
        flushSync()

        expect(screen.getByTestId('popover-popup')).toBeInTheDocument()

        vi.advanceTimersByTime(PATIENT_CLICK_THRESHOLD - 1)
        fireEvent.click(trigger)
        flushSync()

        fireEvent.click(screen.getByTestId('close'))
        flushSync()

        expect(screen.queryByTestId('popover-popup')).toBeNull()

        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger, { movementX: 10, movementY: 0 })

        vi.advanceTimersByTime(100)
        flushSync()

        expect(screen.getByTestId('popover-popup')).toBeInTheDocument()
      } finally {
        vi.useRealTimers()
      }
    })

    it('cleans up the safe polygon handler after a hover-opened popup becomes click-sticky', async () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      try {
        render(PopoverHover, { openOnHover: true, delay: 0, closeDelay: 0 })

        const trigger = screen.getByTestId('trigger')

        fireEvent.mouseEnter(trigger)
        fireEvent.mouseMove(trigger)
        flushSync()

        expect(screen.getByTestId('popover-popup')).toBeInTheDocument()

        const positioner = screen.getByTestId('positioner')

        fireEvent.mouseLeave(trigger, { relatedTarget: positioner })
        fireEvent.mouseEnter(positioner)

        let documentMouseMoveHandler: EventListenerOrEventListenerObject | undefined
        for (let i = addEventListenerSpy.mock.calls.length - 1; i >= 0; i -= 1) {
          const [eventName, listener] = addEventListenerSpy.mock.calls[i]
          if (eventName === 'mousemove') {
            documentMouseMoveHandler = listener
            break
          }
        }

        expect(documentMouseMoveHandler).toEqual(expect.any(Function))

        fireEvent.click(trigger)
        flushSync()

        fireEvent.mouseLeave(positioner)

        expect(screen.getByTestId('popover-popup')).toBeInTheDocument()
        expect(removeEventListenerSpy).toHaveBeenCalledWith(
          'mousemove',
          documentMouseMoveHandler,
          expect.anything()
        )
      } finally {
        addEventListenerSpy.mockRestore()
        removeEventListenerSpy.mockRestore()
      }
    })
  })

  describe('non-modal focus transitions', () => {
    it('closes as soon as focus leaves the popup on pointer down outside', async () => {
      render(PopoverPointerDownOutside)

      const inside = screen.getByTestId('inside')
      inside.focus()

      const outside = screen.getByTestId('outside')

      fireEvent.pointerDown(outside)
      outside.focus()
      fireEvent.focusOut(inside, { relatedTarget: outside })

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    })

    it.skipIf(isJSDOM)('moves focus past a nested Menu when tabbing out of it', async () => {
      const user = userEvent.setup()
      render(PopoverNestedMenuTab)

      await user.click(screen.getByTestId('menu-trigger'))

      const menu = await screen.findByRole('menu')
      await waitFor(() => expect(menu).toHaveFocus())

      await user.tab()

      expect(screen.getByTestId('after')).toHaveFocus()
      expect(screen.queryByRole('menu')).toBeNull()
      expect(screen.getByTestId('popover-popup')).toBeVisible()
    })
  })

  describe.skipIf(isJSDOM || isGecko || isWebKit)('pointerdown removal', () => {
    it('focuses the popup when the focused child is removed and still dismisses on outside press', async () => {
      const user = userEvent.setup()
      render(PopoverRemoveOnPointerDown)

      const removeButton = screen.getByTestId('remove')
      await waitFor(() => expect(removeButton).toHaveFocus())

      fireEvent.pointerDown(removeButton)

      const popup = screen.getByTestId('popover-popup')
      await waitFor(() => expect(popup).toHaveFocus())

      await user.click(document.body)

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    })
  })

  describe('multiple triggers within Root', () => {
    it('opens the popover from any of the triggers', async () => {
      const user = userEvent.setup()
      render(PopoverMultipleTriggers)

      expect(screen.queryByTestId('popup')).toBeNull()

      for (const testId of ['trigger-1', 'trigger-2', 'trigger-3']) {
        await user.click(screen.getByTestId(testId))
        await waitFor(() => expect(screen.getByTestId('popup')).toBeInTheDocument())

        await user.click(screen.getByTestId('close'))
        await waitFor(() => expect(screen.queryByTestId('popup')).toBeNull())
      }
    })
  })

  describe.skipIf(isJSDOM)('hover close transitions', () => {
    let previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED

    beforeEach(() => {
      previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
    })

    afterEach(() => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
    })

    it('reopens immediately when re-hovering the trigger during a hover close transition', async () => {
      const user = userEvent.setup()
      render(PopoverHoverReopenTransition)

      const trigger = screen.getByTestId('trigger')

      await user.hover(trigger)
      await waitFor(() => expect(screen.getByTestId('popover-popup')).toHaveAttribute('data-open'))

      await user.unhover(trigger)
      await waitFor(() =>
        expect(screen.getByTestId('popover-popup')).toHaveAttribute('data-ending-style')
      )

      fireEvent.pointerEnter(trigger, { pointerType: 'mouse' })
      fireEvent.mouseEnter(trigger)

      await waitFor(() => expect(screen.getByTestId('popover-popup')).toHaveAttribute('data-open'))
      expect(screen.getByTestId('popover-popup')).not.toHaveAttribute('data-closed')
    })
  })

  describe.skipIf(isJSDOM)('prop: onOpenChangeComplete with animations', () => {
    let previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED

    beforeEach(() => {
      previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false
    })

    afterEach(() => {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
    })

    it('is called with true only after the enter animation finishes', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(PopoverAnimatedComplete, { open: false, onOpenChangeComplete })

      await user.click(screen.getByTestId('open-external'))

      await waitFor(() => expect(onOpenChangeComplete.mock.calls[0]?.[0]).toBe(true))
      expect(screen.queryByTestId('popover-popup')).not.toBeNull()
    })

    it('is called with false only after the exit animation finishes', async () => {
      const user = userEvent.setup()
      const onOpenChangeComplete = vi.fn()
      render(PopoverAnimatedComplete, { open: true, onOpenChangeComplete })

      await waitFor(() => expect(onOpenChangeComplete.mock.calls[0]?.[0]).toBe(true))

      await user.click(screen.getByTestId('close-external'))

      await waitFor(() => expect(screen.queryByTestId('popover-popup')).toBeNull())
      expect(onOpenChangeComplete.mock.lastCall?.[0]).toBe(false)
    })
  })

  describe.skipIf(isJSDOM)('focus management: reverse tab order', () => {
    it.each([
      { name: 'popup following the trigger', triggerPlacement: 'before-content' as const },
      { name: 'popup preceding the trigger', triggerPlacement: 'after-content' as const }
    ])(
      'moves focus to the trigger when tabbing backward, then back into the popup ($name)',
      async ({ triggerPlacement }) => {
        const user = userEvent.setup()
        render(PopoverFocusGuards, { triggerPlacement })

        const inputInside = screen.getByTestId('input-inside')
        await waitFor(() => expect(inputInside).toHaveFocus())

        await new Promise((r) => setTimeout(r, 50))
        await user.tab({ shift: true })

        await waitFor(() => expect(screen.getByTestId('trigger')).toHaveFocus())
        await waitFor(() => expect(screen.queryByTestId('popover-popup')).toBeVisible())

        await new Promise((r) => setTimeout(r, 50))
        await user.keyboard('{Tab}')
        await waitFor(() => expect(screen.getByTestId('input-inside')).toHaveFocus())
      }
    )
  })
})
