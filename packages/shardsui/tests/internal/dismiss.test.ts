import { normalizeBubbles } from '$lib/internal/floating/dismiss.svelte'
import { REASONS } from '$lib/internal/reasons'
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import DismissEscapeNoTree from './fixtures/dismiss-escape-no-tree.svelte'
import DismissFixture from './fixtures/dismiss-fixture.svelte'
import DismissNestedModals from './fixtures/dismiss-nested-modals.svelte'
import DismissPortalContainers from './fixtures/dismiss-portal-containers.svelte'
import DismissPortaledChildren from './fixtures/dismiss-portaled-children.svelte'
import NestedDismissFixture from './fixtures/nested-dismiss-fixture.svelte'

describe.skipIf(!isJSDOM)('normalizeBubbles', () => {
  it('true → { escapeKey: true, outsidePress: true }', () => {
    expect(normalizeBubbles(true)).toEqual({ escapeKey: true, outsidePress: true })
  })

  it('false → { escapeKey: false, outsidePress: false }', () => {
    expect(normalizeBubbles(false)).toEqual({ escapeKey: false, outsidePress: false })
  })

  it('undefined → { escapeKey: false, outsidePress: true }', () => {
    expect(normalizeBubbles(undefined)).toEqual({ escapeKey: false, outsidePress: true })
  })

  it('{ escapeKey: true } → { escapeKey: true, outsidePress: true }', () => {
    expect(normalizeBubbles({ escapeKey: true })).toEqual({ escapeKey: true, outsidePress: true })
  })

  it('{ escapeKey: false } → { escapeKey: false, outsidePress: true }', () => {
    expect(normalizeBubbles({ escapeKey: false })).toEqual({ escapeKey: false, outsidePress: true })
  })

  it('{ outsidePress: false } → { escapeKey: false, outsidePress: false }', () => {
    expect(normalizeBubbles({ outsidePress: false })).toEqual({
      escapeKey: false,
      outsidePress: false
    })
  })

  it('{} → { escapeKey: false, outsidePress: true }', () => {
    expect(normalizeBubbles({})).toEqual({ escapeKey: false, outsidePress: true })
  })
})

describe.skipIf(!isJSDOM)('Dismiss', () => {
  describe('Escape key', () => {
    it('closes popup on Escape key press', async () => {
      const spy = vi.fn()
      render(DismissFixture, { onDismiss: spy })
      expect(screen.getByTestId('popup')).toBeInTheDocument()
      fireEvent.keyDown(document.body, { key: 'Escape' })
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
      expect(spy).toHaveBeenCalledWith(REASONS.escapeKey, expect.anything())
    })

    it('calls preventDefault on escape key dismiss', async () => {
      render(DismissFixture)
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true
      })
      document.body.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(true)
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
    })

    it('does not close when escapeKey=false', async () => {
      render(DismissFixture, { escapeKey: false })
      fireEvent.keyDown(document.body, { key: 'Escape' })
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()
    })

    it('does not close during IME composition', async () => {
      render(DismissFixture)
      fireEvent(document.body, new Event('compositionstart', { bubbles: true }))
      fireEvent.keyDown(document.body, { key: 'Escape' })
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()
    })

    it('closes after IME compositionend + 0 ms delay', async () => {
      render(DismissFixture)
      fireEvent(document.body, new Event('compositionstart', { bubbles: true }))
      fireEvent(document.body, new Event('compositionend', { bubbles: true }))
      await new Promise((r) => setTimeout(r, 10))
      fireEvent.keyDown(document.body, { key: 'Escape' })
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
    })
  })

  describe('outside press (sloppy mode)', () => {
    it('closes on outside pointerdown', async () => {
      const spy = vi.fn()
      render(DismissFixture, { onDismiss: spy })
      fireEvent.pointerDown(screen.getByTestId('outside'))
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
      expect(spy).toHaveBeenCalledWith(REASONS.outsidePress, expect.anything())
    })

    it('does not close when outsidePress=false', async () => {
      render(DismissFixture, { outsidePress: false })
      fireEvent.pointerDown(screen.getByTestId('outside'))
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()
    })

    it('outsidePress ignored for third party elements', async () => {
      render(DismissFixture, { markOutside: true })
      await new Promise((r) => setTimeout(r, 0))

      const thirdParty = document.createElement('div')
      thirdParty.setAttribute('data-testid', 'third-party')
      document.body.append(thirdParty)

      fireEvent.pointerDown(thirdParty)
      await new Promise((r) => setTimeout(r, 0))

      expect(screen.getByTestId('popup')).toBeInTheDocument()
      thirdParty.remove()
    })

    it('calls outsidePress guard function; does not close when it returns false', async () => {
      const guard = vi.fn().mockReturnValue(false)
      render(DismissFixture, { outsidePress: guard })
      fireEvent.pointerDown(screen.getByTestId('outside'))
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()
      expect(guard).toHaveBeenCalled()
    })

    it('calls outsidePress guard function; closes when it returns true', async () => {
      const guard = vi.fn().mockReturnValue(true)
      render(DismissFixture, { outsidePress: guard })
      fireEvent.pointerDown(screen.getByTestId('outside'))
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
    })

    it('outsidePress not ignored for nested floating elements', async () => {
      for (const [outerModal, innerModal] of [
        [true, true],
        [true, false],
        [false, true],
        [true, null]
      ] as const) {
        const { unmount } = render(DismissNestedModals, { outerModal, innerModal })

        const popover1 = screen.getByTestId('popover-1')
        expect(screen.getByTestId('popover-2')).toBeInTheDocument()

        await userEvent.click(screen.getByTestId('popover-2'))
        expect(screen.getByTestId('popover-1')).toBeInTheDocument()
        expect(screen.getByTestId('popover-2')).toBeInTheDocument()

        await userEvent.click(popover1)
        await waitFor(() => expect(screen.queryByTestId('popover-2')).not.toBeInTheDocument())
        expect(screen.getByTestId('popover-1')).toBeInTheDocument()

        unmount()
      }
    })

    it('does not dismiss when clicking portaled children', async () => {
      render(DismissPortaledChildren)

      fireEvent.pointerDown(screen.getByTestId('portaled-button'), { bubbles: true })
      await new Promise((r) => setTimeout(r, 0))

      expect(screen.getByTestId('portaled-button')).toBeInTheDocument()
    })
  })

  describe('triggerPress', () => {
    it('closes on trigger pointerdown when triggerPress=true', async () => {
      const spy = vi.fn()
      render(DismissFixture, { triggerPress: true, onDismiss: spy })
      fireEvent.pointerDown(screen.getByTestId('trigger'))
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
      expect(spy).toHaveBeenCalledWith(REASONS.triggerPress, expect.anything())
    })

    it('dismisses with native click', async () => {
      render(DismissFixture, { triggerPress: true })
      fireEvent.click(screen.getByTestId('trigger'))
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
    })

    it('does not close on trigger pointerdown when triggerPress=false (default)', async () => {
      render(DismissFixture, { triggerPress: false })
      fireEvent.pointerDown(screen.getByTestId('trigger'))
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()
    })
  })

  describe('intentional press mode', () => {
    it('dragging outside the floating element does not close', async () => {
      render(DismissFixture, { outsidePressEvent: 'intentional' })
      fireEvent.mouseDown(screen.getByTestId('popup'))
      fireEvent.mouseUp(document.body)
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()
    })

    it('dragging inside the floating element does not close', async () => {
      render(DismissFixture, { outsidePressEvent: 'intentional' })
      fireEvent.mouseDown(document.body)
      fireEvent.mouseUp(screen.getByTestId('popup'))
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()
    })

    it('inside click then programmatic outside click closes', async () => {
      render(DismissFixture, { outsidePressEvent: 'intentional' })
      const insideInput = screen.getByTestId('inside-input')

      fireEvent.mouseDown(insideInput)
      fireEvent.mouseUp(insideInput)
      fireEvent.click(insideInput)
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()

      fireEvent.click(document.body)
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
    })

    it('drag from popup to outside: first click suppressed, second click closes', async () => {
      render(DismissFixture, { outsidePressEvent: 'intentional' })
      const popup = screen.getByTestId('popup')
      const outside = screen.getByTestId('outside')

      fireEvent.pointerDown(popup, { button: 0, pointerId: 1, pointerType: 'mouse' })
      fireEvent.pointerUp(outside, { button: 0, pointerId: 1, pointerType: 'mouse' })
      fireEvent.click(outside)
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()

      fireEvent.click(outside)
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
    })

    it('press start prevented inside does not require double outside click', async () => {
      render(DismissFixture, { outsidePressEvent: 'intentional' })
      const scrubber = screen.getByTestId('scrubber')

      fireEvent.pointerDown(scrubber, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseDown(scrubber, { button: 0 })
      fireEvent.pointerUp(document.body, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseUp(document.body, { button: 0 })

      await new Promise((r) => setTimeout(r, 0))

      fireEvent.pointerDown(document.body, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseDown(document.body, { button: 0 })
      fireEvent.pointerUp(document.body, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseUp(document.body, { button: 0 })
      fireEvent.click(document.body)

      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
    })

    it('press start prevented inside suppresses only immediate outside click', async () => {
      render(DismissFixture, { outsidePressEvent: 'intentional' })
      const scrubber = screen.getByTestId('scrubber')

      fireEvent.pointerDown(scrubber, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseDown(scrubber, { button: 0 })
      fireEvent.pointerUp(document.body, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseUp(document.body, { button: 0 })

      fireEvent.click(document.body)
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()

      fireEvent.click(document.body)
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
    })

    it('pointercancel after prevented press start suppresses immediate outside click', async () => {
      render(DismissFixture, { outsidePressEvent: 'intentional' })
      const scrubber = screen.getByTestId('scrubber')

      fireEvent.pointerDown(scrubber, { pointerType: 'mouse', button: 0 })
      fireEvent.mouseDown(scrubber, { button: 0 })
      fireEvent.pointerCancel(document.body, { pointerType: 'mouse' })

      fireEvent.click(document.body)
      await new Promise((r) => setTimeout(r, 0))
      expect(screen.getByTestId('popup')).toBeInTheDocument()

      fireEvent.click(document.body)
      await waitFor(() => expect(screen.queryByTestId('popup')).not.toBeInTheDocument())
    })
  })

  describe('bubbles.outsidePress', () => {
    it('when true', async () => {
      render(NestedDismissFixture, { parentBubbles: true, childBubbles: true })

      expect(screen.getByTestId('parent-popup')).toBeInTheDocument()
      expect(screen.getByTestId('child-popup')).toBeInTheDocument()

      fireEvent.pointerDown(document.body)

      await waitFor(() => {
        expect(screen.queryByTestId('parent-popup')).not.toBeInTheDocument()
        expect(screen.queryByTestId('child-popup')).not.toBeInTheDocument()
      })
    })

    it('when false', async () => {
      const onParentDismiss = vi.fn()
      render(NestedDismissFixture, {
        parentBubbles: { outsidePress: false },
        childBubbles: { outsidePress: false },
        onParentDismiss
      })

      expect(screen.getByTestId('parent-popup')).toBeInTheDocument()
      expect(screen.getByTestId('child-popup')).toBeInTheDocument()

      fireEvent.pointerDown(document.body)

      await waitFor(() => expect(screen.queryByTestId('child-popup')).not.toBeInTheDocument())
      expect(screen.getByTestId('parent-popup')).toBeInTheDocument()

      fireEvent.pointerDown(document.body)

      await waitFor(() => expect(screen.queryByTestId('parent-popup')).not.toBeInTheDocument())
      expect(onParentDismiss).toHaveBeenCalledWith(REASONS.outsidePress, expect.anything())
    })

    it('mixed', async () => {
      render(NestedDismissFixture, {
        parentBubbles: { outsidePress: true },
        childBubbles: { outsidePress: false }
      })

      expect(screen.getByTestId('parent-popup')).toBeInTheDocument()
      expect(screen.getByTestId('child-popup')).toBeInTheDocument()

      fireEvent.pointerDown(document.body)

      await waitFor(() => expect(screen.queryByTestId('child-popup')).not.toBeInTheDocument())
      expect(screen.getByTestId('parent-popup')).toBeInTheDocument()

      fireEvent.pointerDown(document.body)

      await waitFor(() => expect(screen.queryByTestId('parent-popup')).not.toBeInTheDocument())
    })
  })

  describe('bubbles.escapeKey', () => {
    it('without a floating tree', async () => {
      render(DismissEscapeNoTree)

      screen.getByTestId('focus-button').focus()

      await waitFor(() => expect(screen.getByTestId('tooltip')).toBeInTheDocument())

      await userEvent.keyboard('{Escape}')

      await waitFor(() => expect(screen.queryByTestId('tooltip')).not.toBeInTheDocument())
      expect(screen.getByTestId('popover')).toBeInTheDocument()
    })

    it('when true', async () => {
      const onParentDismiss = vi.fn()
      render(NestedDismissFixture, {
        parentBubbles: true,
        childBubbles: true,
        onParentDismiss
      })

      expect(screen.getByTestId('parent-popup')).toBeInTheDocument()
      expect(screen.getByTestId('child-popup')).toBeInTheDocument()

      fireEvent.keyDown(screen.getByTestId('child-popup'), { key: 'Escape' })

      await waitFor(() => {
        expect(screen.queryByTestId('child-popup')).not.toBeInTheDocument()
        expect(screen.queryByTestId('parent-popup')).not.toBeInTheDocument()
      })
      expect(onParentDismiss).toHaveBeenCalledWith(REASONS.escapeKey, expect.anything())
    })

    it('when false', async () => {
      render(NestedDismissFixture, {
        parentBubbles: { escapeKey: false },
        childBubbles: { escapeKey: false }
      })

      expect(screen.getByTestId('parent-popup')).toBeInTheDocument()
      expect(screen.getByTestId('child-popup')).toBeInTheDocument()

      fireEvent.keyDown(screen.getByTestId('child-popup'), { key: 'Escape' })

      await waitFor(() => expect(screen.queryByTestId('child-popup')).not.toBeInTheDocument())
      expect(screen.getByTestId('parent-popup')).toBeInTheDocument()

      fireEvent.keyDown(screen.getByTestId('parent-popup'), { key: 'Escape' })

      await waitFor(() => expect(screen.queryByTestId('parent-popup')).not.toBeInTheDocument())
    })

    it('mixed', async () => {
      render(NestedDismissFixture, {
        parentBubbles: { escapeKey: true },
        childBubbles: { escapeKey: false }
      })

      expect(screen.getByTestId('parent-popup')).toBeInTheDocument()
      expect(screen.getByTestId('child-popup')).toBeInTheDocument()

      fireEvent.keyDown(screen.getByTestId('child-popup'), { key: 'Escape' })

      await waitFor(() => expect(screen.queryByTestId('child-popup')).not.toBeInTheDocument())
      expect(screen.getByTestId('parent-popup')).toBeInTheDocument()

      fireEvent.keyDown(screen.getByTestId('parent-popup'), { key: 'Escape' })

      await waitFor(() => expect(screen.queryByTestId('parent-popup')).not.toBeInTheDocument())
    })
  })

  it('nested floating elements with different portal containers', async () => {
    render(DismissPortalContainers)

    await userEvent.click(screen.getByText('open 1'))
    expect(screen.getByText('open 2')).toBeInTheDocument()

    await userEvent.click(screen.getByText('open 2'))

    expect(screen.getByText('open 1')).toBeInTheDocument()
    expect(screen.getByText('open 2')).toBeInTheDocument()
    expect(screen.getByText('nested')).toBeInTheDocument()
  })
})
