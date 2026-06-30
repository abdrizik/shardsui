import { Toast } from '$lib/components/toast'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { tick } from 'svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import CloseNewestToast from './fixtures/close-newest-toast.svelte'
import FocusCloseToast from './fixtures/focus-close-toast.svelte'
import FocusListToast from './fixtures/focus-list-toast.svelte'
import FocusNavToast from './fixtures/focus-nav-toast.svelte'
import PortaledViewportToast from './fixtures/portaled-viewport-toast.svelte'
import SwipeToast from './fixtures/swipe-toast.svelte'
import TimedToast from './fixtures/timed-toast.svelte'

const FAKE_TIMERS: Parameters<typeof vi.useFakeTimers>[0] = {
  toFake: ['setTimeout', 'clearTimeout']
}

async function advanceTime(ms: number) {
  vi.advanceTimersByTime(ms)
  await tick()
}

function blurWindow() {
  const event = new FocusEvent('blur')
  Object.defineProperty(event, 'composedPath', { value: () => [window] })
  window.dispatchEvent(event)
}

function focusWindow() {
  const event = new FocusEvent('focus')
  Object.defineProperty(event, 'composedPath', { value: () => [window] })
  window.dispatchEvent(event)
}

function mockPointerCapture(element: Element) {
  Object.defineProperty(element, 'setPointerCapture', { value: () => {}, configurable: true })
  Object.defineProperty(element, 'releasePointerCapture', { value: () => {}, configurable: true })
}

describe('<Toast.Viewport />', () => {
  it.skipIf(!isJSDOM)(
    'rebinds owner-document listeners once across empty store cycles',
    async () => {
      const user = userEvent.setup()
      const iframe = document.createElement('iframe')
      document.body.appendChild(iframe)
      const iframeWindow = iframe.contentWindow
      const iframeDocument = iframe.contentDocument
      if (!iframeWindow || !iframeDocument) throw new Error('Expected iframe window and document.')
      const iframeGlobal = iframeWindow as Window & typeof globalThis

      const container = iframeDocument.createElement('div')
      iframeDocument.body.appendChild(container)

      const portaledToast = () => iframeDocument.querySelector('[data-testid="root"]')
      expect(portaledToast()).toBe(null)

      const addWindowListener = vi.spyOn(iframeWindow, 'addEventListener')
      const removeWindowListener = vi.spyOn(iframeWindow, 'removeEventListener')
      const addDocumentListener = vi.spyOn(iframeDocument, 'addEventListener')
      const removeDocumentListener = vi.spyOn(iframeDocument, 'removeEventListener')

      const countCalls = (spy: typeof addWindowListener, type: string) =>
        spy.mock.calls.filter(([eventType]) => eventType === type).length

      try {
        render(PortaledViewportToast, { container })

        await user.click(screen.getByTestId('add'))
        await waitFor(() => expect(portaledToast()).not.toBe(null))

        expect(countCalls(addWindowListener, 'keydown')).toBe(1)
        expect(countCalls(addWindowListener, 'blur')).toBe(1)
        expect(countCalls(addWindowListener, 'focus')).toBe(1)
        expect(countCalls(addDocumentListener, 'pointerdown')).toBe(1)

        iframeWindow.dispatchEvent(new iframeGlobal.KeyboardEvent('keydown', { key: 'F6' }))
        await tick()
        expect(iframeDocument.activeElement).toBe(
          iframeDocument.querySelector('[data-testid="alternate-viewport"]')
        )

        await user.click(screen.getByTestId('close'))
        await waitFor(() => expect(portaledToast()).toBe(null))

        expect(countCalls(removeWindowListener, 'keydown')).toBe(1)
        expect(countCalls(removeWindowListener, 'blur')).toBe(1)
        expect(countCalls(removeWindowListener, 'focus')).toBe(1)
        expect(countCalls(removeDocumentListener, 'pointerdown')).toBe(1)

        await user.click(screen.getByTestId('add'))
        await waitFor(() => expect(portaledToast()).not.toBe(null))

        expect(countCalls(addWindowListener, 'keydown')).toBe(2)
        expect(countCalls(addWindowListener, 'blur')).toBe(2)
        expect(countCalls(addWindowListener, 'focus')).toBe(2)
        expect(countCalls(addDocumentListener, 'pointerdown')).toBe(2)
      } finally {
        addWindowListener.mockRestore()
        removeWindowListener.mockRestore()
        addDocumentListener.mockRestore()
        removeDocumentListener.mockRestore()
        iframe.remove()
      }
    }
  )

  it('throws a descriptive error when rendered outside <Toast.Provider>', () => {
    expect(() => render(Toast.Viewport)).toThrow(
      'ShardsUI: this part must be rendered inside <Toast.Provider>.'
    )
  })

  describe('focus navigation', () => {
    afterEach(() => cleanup())

    it('gets focused when F6 is pressed', async () => {
      const user = userEvent.setup()
      render(FocusNavToast)

      await user.click(screen.getByTestId('add-button'))
      await user.keyboard('{F6}')

      expect(screen.getByTestId('viewport')).toHaveFocus()
    })

    it('focuses first toast upon tab after viewport is focused', async () => {
      const user = userEvent.setup()
      render(FocusNavToast)

      await user.click(screen.getByTestId('add-button'))
      await user.keyboard('{F6}')
      await user.keyboard('{Tab}')

      expect(screen.getByTestId('root')).toHaveFocus()
    })

    it('returns focus to previous element when pressing shift+Tab on first toast', async () => {
      const user = userEvent.setup()
      render(FocusNavToast)

      const button = screen.getByTestId('add-button')
      await user.click(button)
      await user.keyboard('{F6}')
      await user.tab()
      await user.tab({ shift: true })

      expect(button).toHaveFocus()
    })

    it('returns focus to previous element when pressing shift+Tab on last toast', async () => {
      const user = userEvent.setup()
      render(FocusNavToast)

      const button = screen.getByTestId('add-button')
      await user.click(button)
      await user.click(button)

      await user.keyboard('{F6}')
      for (let i = 0; i < 7; i++) {
        await user.tab()
      }

      expect(button).toHaveFocus()
    })
  })

  describe('expanded state', () => {
    afterEach(() => cleanup())

    it('removes expanded on mouseleave when focus-visible not inside', async () => {
      const user = userEvent.setup()
      render(FocusNavToast)

      await user.click(screen.getByTestId('add-button'))
      await screen.findByTestId('root')
      const viewport = screen.getByTestId('viewport')

      await fireEvent.mouseEnter(viewport)
      expect(viewport).toHaveAttribute('data-expanded')

      await fireEvent.mouseLeave(viewport)
      expect(viewport).not.toHaveAttribute('data-expanded')
    })

    it('keeps expanded on mouseleave when focus-visible is inside', async () => {
      const user = userEvent.setup()
      render(FocusNavToast)

      await user.click(screen.getByTestId('add-button'))
      await screen.findByTestId('root')
      const viewport = screen.getByTestId('viewport')

      await user.keyboard('{F6}')
      await user.keyboard('{Tab}')

      await fireEvent.mouseEnter(viewport)
      expect(viewport).toHaveAttribute('data-expanded')

      await fireEvent.mouseLeave(viewport)
      expect(viewport).toHaveAttribute('data-expanded')
    })

    it('keeps expanded during an active touch swipe even if mouseleave fires', async () => {
      render(SwipeToast, { swipeDirection: 'down' })
      await fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const root = screen.getByTestId('toast-root')
      const viewport = screen.getByTestId('viewport')
      mockPointerCapture(root)

      await fireEvent.pointerDown(root, {
        clientX: 100,
        clientY: 100,
        button: 0,
        pointerId: 1,
        pointerType: 'touch'
      })
      await fireEvent.pointerMove(root, {
        clientX: 100,
        clientY: 120,
        pointerId: 1,
        pointerType: 'touch'
      })
      expect(viewport).toHaveAttribute('data-expanded')

      await fireEvent.mouseLeave(viewport)
      expect(viewport).toHaveAttribute('data-expanded')

      await fireEvent.pointerUp(root, {
        clientX: 100,
        clientY: 120,
        pointerId: 1,
        pointerType: 'touch'
      })
      expect(viewport).not.toHaveAttribute('data-expanded')
    })

    it('keeps expanded when a touch swipe is canceled without leaving the viewport', async () => {
      render(SwipeToast, { swipeDirection: 'down' })
      await fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const root = screen.getByTestId('toast-root')
      const viewport = screen.getByTestId('viewport')
      mockPointerCapture(root)

      await fireEvent.pointerDown(root, {
        clientX: 100,
        clientY: 100,
        button: 0,
        pointerId: 1,
        pointerType: 'touch'
      })
      await fireEvent.pointerMove(root, {
        clientX: 100,
        clientY: 120,
        pointerId: 1,
        pointerType: 'touch'
      })
      expect(root).toHaveAttribute('data-swiping')
      expect(viewport).toHaveAttribute('data-expanded')

      await fireEvent.pointerCancel(root, {
        clientX: 100,
        clientY: 120,
        pointerId: 1,
        pointerType: 'touch'
      })
      expect(root).not.toHaveAttribute('data-swiping')
      expect(viewport).toHaveAttribute('data-expanded')
    })

    it('collapses after a touch swipe is canceled if mouseleave already fired', async () => {
      render(SwipeToast, { swipeDirection: 'down' })
      await fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const root = screen.getByTestId('toast-root')
      const viewport = screen.getByTestId('viewport')
      mockPointerCapture(root)

      await fireEvent.pointerDown(root, {
        clientX: 100,
        clientY: 100,
        button: 0,
        pointerId: 1,
        pointerType: 'touch'
      })
      await fireEvent.pointerMove(root, {
        clientX: 100,
        clientY: 120,
        pointerId: 1,
        pointerType: 'touch'
      })

      await fireEvent.mouseLeave(viewport)
      await fireEvent.pointerCancel(root, {
        clientX: 100,
        clientY: 120,
        pointerId: 1,
        pointerType: 'touch'
      })

      expect(root).not.toHaveAttribute('data-swiping')
      expect(viewport).not.toHaveAttribute('data-expanded')
    })

    it.skipIf(!isJSDOM)(
      'collapses a deferred mouseleave after a closing toast is removed while blurred',
      async () => {
        const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

        try {
          render(CloseNewestToast)

          const addButton = screen.getByTestId('add-button')
          fireEvent.click(addButton)
          fireEvent.click(addButton)
          await tick()

          const newest = screen.getAllByTestId('root')[0]
          let finishAnimation!: () => void
          const animationFinished = new Promise<void>((resolve) => {
            finishAnimation = resolve
          })
          Object.defineProperty(newest, 'getAnimations', {
            configurable: true,
            value: () => [{ finished: animationFinished }]
          })

          const viewport = screen.getByTestId('viewport')
          await fireEvent.mouseEnter(viewport)
          expect(viewport).toHaveAttribute('data-expanded')

          await fireEvent.click(screen.getByTestId('close-newest'))
          expect(newest).toHaveAttribute('data-ending-style')

          await fireEvent.mouseLeave(viewport)
          expect(viewport).toHaveAttribute('data-expanded')

          blurWindow()
          await tick()

          finishAnimation()

          await waitFor(() => expect(screen.getAllByTestId('root')).toHaveLength(1))
          await waitFor(() => expect(viewport).not.toHaveAttribute('data-expanded'))
        } finally {
          globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
        }
      }
    )
  })

  describe('timers', () => {
    beforeEach(() => vi.useFakeTimers(FAKE_TIMERS))
    afterEach(() => {
      vi.clearAllTimers()
      vi.useRealTimers()
      cleanup()
    })

    it('pauses timers when hovering', async () => {
      render(TimedToast, { timeout: 5000 })
      fireEvent.click(screen.getByTestId('add-button'))
      await tick()
      expect(screen.getByTestId('root')).toBeInTheDocument()

      fireEvent.mouseEnter(screen.getByTestId('viewport'))
      await advanceTime(5001)
      expect(screen.queryByTestId('root')).not.toBeNull()
    })

    it('resumes timers when not hovering', async () => {
      render(TimedToast, { timeout: 3000 })
      fireEvent.click(screen.getByTestId('add-button'))
      await tick()

      const viewport = screen.getByTestId('viewport')
      fireEvent.mouseEnter(viewport)
      await tick()

      await advanceTime(5000)
      expect(screen.queryByTestId('root')).not.toBeNull()

      fireEvent.mouseLeave(viewport)
      await tick()

      await advanceTime(3100)
      expect(screen.queryByTestId('root')).toBeNull()
    })

    it('restores focus and resumes timers on shift+Tab out of the focused viewport', async () => {
      render(TimedToast, { timeout: 5000 })
      const button = screen.getByTestId('add-button')
      button.focus()
      fireEvent.click(button)
      await tick()

      fireEvent.keyDown(button, { key: 'F6' })
      await tick()

      const viewport = screen.getByTestId('viewport')
      expect(viewport).toHaveFocus()

      await advanceTime(5001)
      expect(screen.queryByTestId('root')).not.toBeNull()

      fireEvent.keyDown(viewport, { key: 'Tab', shiftKey: true })
      await tick()
      expect(button).toHaveFocus()

      await advanceTime(5001)
      expect(screen.queryByTestId('root')).toBeNull()
    })

    it('keeps timers paused when shift+Tab returns focus inside the viewport', async () => {
      render(TimedToast, { timeout: 5000 })
      fireEvent.click(screen.getByTestId('add-button'))
      await tick()

      const close = screen.getByTestId('close')
      close.focus()
      fireEvent.keyDown(close, { key: 'F6' })
      await tick()

      const viewport = screen.getByTestId('viewport')
      expect(viewport).toHaveFocus()

      fireEvent.keyDown(viewport, { key: 'Tab', shiftKey: true })
      await tick()
      expect(close).toHaveFocus()

      await advanceTime(5001)
      expect(screen.queryByTestId('root')).not.toBeNull()
    })

    it('keeps the viewport focused when Tab is pressed without shift', async () => {
      render(TimedToast, { timeout: 5000 })
      const button = screen.getByTestId('add-button')
      button.focus()
      fireEvent.click(button)
      await tick()

      fireEvent.keyDown(button, { key: 'F6' })
      await tick()

      const viewport = screen.getByTestId('viewport')
      fireEvent.keyDown(viewport, { key: 'Tab' })
      await tick()

      expect(button).not.toHaveFocus()

      await advanceTime(5001)
      expect(screen.queryByTestId('root')).not.toBeNull()
    })

    it('collapses and resumes timers on a touch outside the viewport', async () => {
      render(TimedToast, { timeout: 5000 })
      fireEvent.click(screen.getByTestId('add-button'))
      await tick()

      const viewport = screen.getByTestId('viewport')
      fireEvent.mouseEnter(viewport)
      await tick()
      expect(viewport).toHaveAttribute('data-expanded')

      await advanceTime(5001)
      expect(screen.queryByTestId('root')).not.toBeNull()

      fireEvent.pointerDown(document.body, { pointerType: 'touch' })
      await tick()
      expect(viewport).not.toHaveAttribute('data-expanded')

      await advanceTime(5001)
      expect(screen.queryByTestId('root')).toBeNull()
    })

    it('stays expanded on a touch inside the viewport', async () => {
      render(TimedToast, { timeout: 5000 })
      fireEvent.click(screen.getByTestId('add-button'))
      await tick()

      const viewport = screen.getByTestId('viewport')
      fireEvent.mouseEnter(viewport)
      await tick()

      fireEvent.pointerDown(screen.getByTestId('root'), { pointerType: 'touch' })
      await tick()
      expect(viewport).toHaveAttribute('data-expanded')

      await advanceTime(5001)
      expect(screen.queryByTestId('root')).not.toBeNull()
    })

    it('ignores a mouse pointerdown outside the viewport', async () => {
      render(TimedToast, { timeout: 5000 })
      fireEvent.click(screen.getByTestId('add-button'))
      await tick()

      const viewport = screen.getByTestId('viewport')
      fireEvent.mouseEnter(viewport)
      await tick()

      fireEvent.pointerDown(document.body, { pointerType: 'mouse' })
      await tick()
      expect(viewport).toHaveAttribute('data-expanded')

      await advanceTime(5001)
      expect(screen.queryByTestId('root')).not.toBeNull()
    })

    it('pauses timers when the viewport is focused', async () => {
      render(TimedToast, { timeout: 5000 })
      fireEvent.click(screen.getByTestId('add-button'))
      await tick()
      expect(screen.getByTestId('root')).toBeInTheDocument()

      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'F6' })
      await advanceTime(5001)
      expect(screen.queryByTestId('root')).not.toBeNull()
    })

    it.skipIf(!isJSDOM)('resumes timers when the viewport is blurred', async () => {
      render(TimedToast, { timeout: 5000 })
      const button = screen.getByTestId('add-button')
      fireEvent.click(button)
      await tick()
      expect(screen.getByTestId('root')).toBeInTheDocument()

      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'F6' })
      await advanceTime(5001)
      expect(screen.queryByTestId('root')).not.toBeNull()

      button.focus()
      await tick()

      await advanceTime(5001)
      expect(screen.queryByTestId('root')).toBeNull()
    })

    it.skipIf(!isJSDOM)('resumes timers when the window regains focus', async () => {
      render(TimedToast, { timeout: 5000 })
      fireEvent.click(screen.getByTestId('add-button'))
      await tick()
      expect(screen.getByTestId('root')).toBeInTheDocument()

      blurWindow()
      await tick()

      await advanceTime(5000)
      expect(screen.queryByTestId('root')).not.toBeNull()

      focusWindow()
      await tick()

      await advanceTime(5001)
      expect(screen.queryByTestId('root')).toBeNull()
    })

    it.skipIf(!isJSDOM)(
      'keeps timers paused on mouseleave while the window is blurred',
      async () => {
        render(TimedToast, { timeout: 5000 })
        fireEvent.click(screen.getByTestId('add-button'))
        await tick()
        expect(screen.getByTestId('root')).toBeInTheDocument()

        const viewport = screen.getByTestId('viewport')
        fireEvent.mouseEnter(viewport)
        await advanceTime(1000)

        blurWindow()
        await tick()

        fireEvent.mouseLeave(viewport)
        await advanceTime(10000)

        expect(screen.queryByTestId('root')).not.toBeNull()
      }
    )

    it.skipIf(!isJSDOM)(
      'keeps timers paused on viewport blur while the window is blurred',
      async () => {
        render(TimedToast, { timeout: 5000 })
        const button = screen.getByTestId('add-button')
        fireEvent.click(button)
        await tick()
        expect(screen.getByTestId('root')).toBeInTheDocument()

        fireEvent.keyDown(document.activeElement ?? document.body, { key: 'F6' })
        await advanceTime(1000)

        blurWindow()
        await tick()

        button.focus()
        await advanceTime(10000)

        expect(screen.queryByTestId('root')).not.toBeNull()
      }
    )
  })

  describe('focus management', () => {
    afterEach(() => cleanup())

    it.skipIf(!isJSDOM)('skips toasts animating out when tabbing into the viewport', async () => {
      render(FocusListToast)

      const addButton = screen.getByTestId('add-button')
      fireEvent.click(addButton)
      fireEvent.click(addButton)
      await tick()

      const [newest, survivor] = screen.getAllByTestId('root')

      const closeButtons = document.querySelectorAll('[aria-label="close-press"]')
      fireEvent.click(closeButtons[0] as HTMLElement)

      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'F6' })
      await tick()

      const viewport = screen.getByTestId('viewport')
      const guard = document.querySelector('[data-shards-ui-focus-guard]') as HTMLElement
      fireEvent.focus(guard, { relatedTarget: viewport })

      expect(survivor).toHaveFocus()
      expect(newest).not.toHaveFocus()
    })

    it.skipIf(!isJSDOM)('returns focus when no toast can receive focus', async () => {
      render(FocusListToast, { limit: 0 })

      const button = screen.getByTestId('add-button')
      button.focus()
      fireEvent.click(button)
      await tick()

      fireEvent.keyDown(button, { key: 'F6' })
      await tick()

      const viewport = screen.getByTestId('viewport')
      expect(viewport).toHaveFocus()

      const guard = document.querySelector('[data-shards-ui-focus-guard]') as HTMLElement
      fireEvent.focus(guard, { relatedTarget: viewport })

      expect(button).toHaveFocus()
    })

    it.skipIf(!isJSDOM)('returns focus to the trigger when every toast is closed', async () => {
      render(FocusCloseToast)

      const button = screen.getByTestId('add-button')
      button.focus()
      fireEvent.click(button)
      await tick()

      fireEvent.keyDown(button, { key: 'F6' })
      await tick()

      const viewport = screen.getByTestId('viewport')
      const guard = document.querySelector('[data-shards-ui-focus-guard]') as HTMLElement
      fireEvent.focus(guard, { relatedTarget: viewport })

      expect(screen.getByTestId('root')).toHaveFocus()

      fireEvent.click(screen.getByTestId('close-all'))
      await tick()

      expect(button).toHaveFocus()
    })

    it.skipIf(!isJSDOM)('moves focus past toasts animating out when one is closed', async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        render(FocusCloseToast)

        const button = screen.getByTestId('add-button')
        button.focus()

        fireEvent.click(screen.getByTestId('add-oldest'))
        fireEvent.click(screen.getByTestId('add-middle'))
        fireEvent.click(screen.getByTestId('add-newest'))
        await tick()

        const [newest, middle, oldest] = screen.getAllByTestId('root')
        expect(middle).toHaveTextContent('middle')

        fireEvent.keyDown(button, { key: 'F6' })
        await tick()

        const viewport = screen.getByTestId('viewport')
        const guard = document.querySelector('[data-shards-ui-focus-guard]') as HTMLElement
        fireEvent.focus(guard, { relatedTarget: viewport })

        expect(newest).toHaveFocus()

        fireEvent.click(screen.getByTestId('close-middle-and-newest'))

        expect(middle).toHaveAttribute('data-ending-style')
        expect(oldest).toHaveFocus()
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    })

    it.skipIf(!isJSDOM)('leaves focus alone when it is outside the viewport', async () => {
      render(FocusCloseToast)

      const button = screen.getByTestId('add-button')
      button.focus()
      fireEvent.click(button)
      fireEvent.click(button)
      await tick()

      fireEvent.keyDown(button, { key: 'F6' })
      await tick()

      const closeAll = screen.getByTestId('close-all')
      closeAll.focus()

      fireEvent.click(closeAll)
      await tick()

      expect(closeAll).toHaveFocus()
    })
  })
})
