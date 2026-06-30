import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect } from 'vitest'
import { isJSDOM } from '../test-utils'
import DynamicLabelsToast from './fixtures/dynamic-labels-toast.svelte'
import FocusListToast from './fixtures/focus-list-toast.svelte'
import IndexKeyedCloseToast from './fixtures/index-keyed-close-toast.svelte'
import IndexKeyedToast from './fixtures/index-keyed-toast.svelte'
import MutatingContentToast from './fixtures/mutating-content-toast.svelte'
import ReaddEndingToast from './fixtures/readd-ending-toast.svelte'
import ReaddStackingToast from './fixtures/readd-stacking-toast.svelte'
import RecreatedToast from './fixtures/recreated-toast.svelte'
import RemountingToast from './fixtures/remounting-toast.svelte'
import SwipeGestureToast from './fixtures/swipe-gesture-toast.svelte'
import SwipeIgnoreToast from './fixtures/swipe-ignore-toast.svelte'
import SwipeReaddToast from './fixtures/swipe-readd-toast.svelte'

function simulateSwipe(
  element: HTMLElement,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  releaseTarget: HTMLElement | Document = element,
  releaseType: 'pointerup' | 'pointercancel' = 'pointerup'
) {
  fireEvent.pointerDown(element, {
    clientX: startX,
    clientY: startY,
    button: 0,
    bubbles: true,
    pointerId: 1
  })

  let deltaX = 0
  if (endX > startX) deltaX = 1
  else if (endX < startX) deltaX = -1

  let deltaY = 0
  if (endY > startY) deltaY = 1
  else if (endY < startY) deltaY = -1

  fireEvent.pointerMove(element, {
    clientX: startX + deltaX,
    clientY: startY + deltaY,
    bubbles: true,
    pointerId: 1
  })

  fireEvent.pointerMove(element, {
    clientX: endX,
    clientY: endY,
    bubbles: true,
    pointerId: 1
  })

  const releaseEvent = { clientX: endX, clientY: endY, bubbles: true, pointerId: 1 }

  if (releaseType === 'pointercancel') {
    fireEvent.pointerCancel(releaseTarget, releaseEvent)
  } else {
    fireEvent.pointerUp(releaseTarget, releaseEvent)
  }
}

describe('<Toast.Root />', () => {
  afterEach(() => cleanup())

  it('keeps the label ids synchronized with the mounted title and description parts', async () => {
    render(DynamicLabelsToast)

    const root = screen.getByTestId('root')

    await waitFor(() =>
      expect(root).toHaveAttribute('aria-labelledby', screen.getByTestId('title').id)
    )
    expect(root).toHaveAttribute('aria-describedby', screen.getByTestId('description').id)
    expect(screen.getByTestId('title')).toHaveTextContent('Toast title')
    expect(screen.getByTestId('description')).toHaveTextContent('Toast description')

    await fireEvent.click(screen.getByTestId('hide'))
    expect(root).not.toHaveAttribute('aria-labelledby')
    expect(root).not.toHaveAttribute('aria-describedby')

    await fireEvent.click(screen.getByTestId('restore'))
    expect(root).toHaveAttribute('aria-labelledby', screen.getByTestId('title').id)
    expect(root).toHaveAttribute('aria-describedby', screen.getByTestId('description').id)
    expect(screen.getByTestId('title')).toHaveTextContent('Toast title')
    expect(screen.getByTestId('description')).toHaveTextContent('Toast description')
  })

  it.skipIf(isJSDOM)('recalculates height when content mutates', async () => {
    render(MutatingContentToast)

    fireEvent.click(screen.getByTestId('add-button'))
    const root = await screen.findByTestId('toast-root')

    await waitFor(() => expect(root.style.getPropertyValue('--toast-height')).not.toBe(''))
    const initialHeight = parseInt(root.style.getPropertyValue('--toast-height'), 10)

    fireEvent.click(screen.getByTestId('update-button'))

    await waitFor(() =>
      expect(parseInt(root.style.getPropertyValue('--toast-height'), 10)).toBeGreaterThan(
        initialHeight
      )
    )
  })

  it.skipIf(isJSDOM)(
    'clears the starting state and restores the height when re-adding an ending toast',
    async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        const user = userEvent.setup()
        render(ReaddEndingToast)

        await user.click(screen.getByTestId('add'))
        const toastRoot = screen.getByTestId('toast-root')
        expect(toastRoot).not.toHaveAttribute('data-starting-style')
        const initialHeight = toastRoot.style.getPropertyValue('--toast-height')
        expect(initialHeight).not.toBe('')

        await user.click(screen.getByTestId('close'))
        expect(toastRoot).toHaveAttribute('data-ending-style')
        expect(toastRoot.style.getPropertyValue('--toast-height')).toBe('')

        await user.click(screen.getByTestId('add'))
        expect(screen.getByTestId('toast-root')).toBe(toastRoot)

        await waitFor(() => expect(toastRoot).not.toHaveAttribute('data-starting-style'))
        await waitFor(() =>
          expect(toastRoot.style.getPropertyValue('--toast-height')).toBe(initialHeight)
        )
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    }
  )

  it.skipIf(isJSDOM)(
    'keeps stacking intact when re-adding an ending toast among other toasts',
    async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        const user = userEvent.setup()
        render(ReaddStackingToast)

        await user.click(screen.getByTestId('add-1'))
        await user.click(screen.getByTestId('add-2'))
        await user.click(screen.getByTestId('close-1'))

        const toast1 = screen.getByTestId('toast-t1')
        expect(toast1).toHaveAttribute('data-ending-style')

        await user.click(screen.getByTestId('add-1'))

        await waitFor(() => expect(toast1).not.toHaveAttribute('data-starting-style'))
        await waitFor(() => expect(toast1.style.getPropertyValue('--toast-height')).not.toBe(''))

        expect(toast1.style.getPropertyValue('--toast-index')).toBe('0')
        expect(screen.getByTestId('content-t1')).not.toHaveAttribute('data-behind')

        const toast2 = screen.getByTestId('toast-t2')
        expect(toast2).not.toHaveAttribute('data-ending-style')
        expect(toast2.style.getPropertyValue('--toast-index')).toBe('1')
        expect(screen.getByTestId('content-t2')).toHaveAttribute('data-behind')
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    }
  )

  it.skipIf(isJSDOM)(
    'clears swipe state when a retained root is reused for another toast',
    async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        const user = userEvent.setup()
        render(IndexKeyedToast)

        const addButton = screen.getByTestId('add')
        await user.click(addButton)
        await user.click(addButton)
        await user.click(addButton)

        const swipedRoot = screen.getByTestId('root-1')
        Object.defineProperty(swipedRoot, 'setPointerCapture', {
          configurable: true,
          value: () => {}
        })
        Object.defineProperty(swipedRoot, 'releasePointerCapture', {
          configurable: true,
          value: () => {}
        })

        simulateSwipe(swipedRoot, 100, 100, 160, 100)
        await waitFor(() => expect(swipedRoot).toHaveAttribute('data-swipe-direction', 'right'))

        await user.click(addButton)
        expect(screen.getByTestId('root-1')).toBe(swipedRoot)

        await waitFor(() => expect(swipedRoot).not.toHaveAttribute('data-swipe-direction'))
        expect(swipedRoot).not.toHaveAttribute('data-ending-style')
        expect(swipedRoot.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px')
        expect(swipedRoot.style.getPropertyValue('--toast-swipe-movement-y')).toBe('0px')
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    }
  )

  it.skipIf(isJSDOM)(
    'moves focus to the next toast when closing in an index-keyed list',
    async () => {
      const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

      try {
        const user = userEvent.setup()
        render(IndexKeyedToast)

        await user.click(screen.getByTestId('add'))
        await user.click(screen.getByTestId('add'))
        await user.click(screen.getByTestId('add'))

        await user.keyboard('{F6}')
        await user.keyboard('{Tab}')
        expect(screen.getByTestId('root-0')).toHaveFocus()

        await user.keyboard('{Escape}')

        await waitFor(() => expect(screen.getByTestId('root-1')).toHaveFocus())
      } finally {
        globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
      }
    }
  )

  it.skipIf(isJSDOM)('closes when pressing escape', async () => {
    const user = userEvent.setup()
    render(FocusListToast)

    const button = screen.getByTestId('add-button')
    button.focus()
    await user.click(button)
    await screen.findByTestId('root')

    await user.keyboard('{F6}')
    await user.keyboard('{Tab}')
    await user.keyboard('{Escape}')

    await waitFor(() => expect(screen.queryByTestId('root')).toBeNull())
  })

  it.skipIf(isJSDOM)('registers an active toast after its root remounts', async () => {
    const user = userEvent.setup()
    render(RemountingToast)

    await user.click(screen.getByTestId('add-button'))
    const initialRoot = await screen.findByTestId('toast-root')
    expect(initialRoot).not.toHaveAttribute('data-starting-style')
    await waitFor(() => expect(initialRoot.style.getPropertyValue('--toast-height')).not.toBe(''))
    const initialHeight = parseInt(initialRoot.style.getPropertyValue('--toast-height'), 10)

    await user.click(screen.getByTestId('hide-button'))
    expect(screen.queryByTestId('toast-root')).toBeNull()

    await user.click(screen.getByTestId('show-button'))
    const remountedRoot = screen.getByTestId('toast-root')
    expect(remountedRoot).not.toBe(initialRoot)

    await waitFor(() =>
      expect(parseInt(remountedRoot.style.getPropertyValue('--toast-height'), 10)).toBeGreaterThan(
        initialHeight
      )
    )

    await user.keyboard('{F6}')
    await user.keyboard('{Tab}')

    expect(remountedRoot).toHaveFocus()
  })

  it.skipIf(isJSDOM)('clears swipe state when re-adding a swipe-dismissed toast', async () => {
    const previousAnimationsDisabled = globalThis.SHARDSUI_ANIMATIONS_DISABLED
    globalThis.SHARDSUI_ANIMATIONS_DISABLED = false

    try {
      render(SwipeReaddToast)

      fireEvent.click(screen.getByTestId('add'))
      const toast = await screen.findByTestId('toast-root')
      Object.defineProperty(toast, 'setPointerCapture', { configurable: true, value: () => {} })
      Object.defineProperty(toast, 'releasePointerCapture', { configurable: true, value: () => {} })

      simulateSwipe(toast, 100, 100, 160, 100)

      await waitFor(() => expect(toast).toHaveAttribute('data-ending-style'))
      expect(toast).toHaveAttribute('data-swipe-direction', 'right')

      fireEvent.click(screen.getByTestId('add'))
      expect(screen.getByTestId('toast-root')).toBe(toast)

      await waitFor(() => expect(toast).not.toHaveAttribute('data-starting-style'))
      await waitFor(() => expect(toast).not.toHaveAttribute('data-swipe-direction'))
      expect(toast.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px')
      expect(toast.style.getPropertyValue('--toast-swipe-movement-y')).toBe('0px')
    } finally {
      globalThis.SHARDSUI_ANIMATIONS_DISABLED = previousAnimationsDisabled
    }
  })

  describe.skipIf(isJSDOM)('swipe behavior', () => {
    it.each([
      ['left', -60, 0],
      ['right', 60, 0],
      ['up', 0, -60],
      ['down', 0, 60]
    ] as const)('dismisses with a real %s pointer swipe', async (direction, deltaX, deltaY) => {
      const user = userEvent.setup()
      render(SwipeGestureToast, { swipeDirection: direction })

      await user.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      const rect = toast.getBoundingClientRect()
      const start = { clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2 }

      await user.pointer([
        { target: toast, coords: start, keys: '[TouchA>]' },
        {
          target: toast,
          pointerName: 'TouchA',
          coords: {
            clientX: start.clientX + Math.sign(deltaX),
            clientY: start.clientY + Math.sign(deltaY)
          }
        },
        {
          target: toast,
          pointerName: 'TouchA',
          coords: { clientX: start.clientX + deltaX, clientY: start.clientY + deltaY }
        },
        { keys: '[/TouchA]' }
      ])

      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
    })

    it('closes toast when swiping in the specified direction beyond threshold', async () => {
      render(SwipeGestureToast, { swipeDirection: 'up' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')
      Object.defineProperty(toast, 'setPointerCapture', { configurable: true, value: undefined })

      simulateSwipe(toast, 100, 100, 100, 55)
      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
    })

    it('does not close toast when swiping in the specified direction below threshold', async () => {
      render(SwipeGestureToast, { swipeDirection: 'up' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      simulateSwipe(toast, 100, 100, 100, 90)
      expect(screen.queryByTestId('toast-root')).not.toBeNull()
    })

    it('does not close toast when swiping in a non-specified direction', async () => {
      render(SwipeGestureToast, { swipeDirection: 'up' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      simulateSwipe(toast, 100, 100, 100, 150)
      expect(screen.queryByTestId('toast-root')).not.toBeNull()
    })

    describe('supports multiple swipe directions', () => {
      it('up + right', async () => {
        render(SwipeGestureToast, { swipeDirection: ['up', 'right'] })
        const addButton = screen.getByRole('button', { name: 'add toast' })

        fireEvent.click(addButton)
        simulateSwipe(await screen.findByTestId('toast-root'), 100, 100, 150, 100)
        await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())

        fireEvent.click(addButton)
        simulateSwipe(await screen.findByTestId('toast-root'), 100, 100, 100, 50)
        await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
      })

      it('right + left', async () => {
        render(SwipeGestureToast, { swipeDirection: ['right', 'left'] })
        const addButton = screen.getByRole('button', { name: 'add toast' })

        fireEvent.click(addButton)
        simulateSwipe(await screen.findByTestId('toast-root'), 100, 100, 150, 100)
        await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())

        fireEvent.click(addButton)
        simulateSwipe(await screen.findByTestId('toast-root'), 100, 100, 50, 100)
        await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
      })

      it('up + down', async () => {
        render(SwipeGestureToast, { swipeDirection: ['up', 'down'] })
        const addButton = screen.getByRole('button', { name: 'add toast' })

        fireEvent.click(addButton)
        simulateSwipe(await screen.findByTestId('toast-root'), 100, 100, 100, 50)
        await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())

        fireEvent.click(addButton)
        simulateSwipe(await screen.findByTestId('toast-root'), 100, 100, 100, 150)
        await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
      })
    })

    it('locks to a single axis on the first move of a two-axis swipe', async () => {
      render(SwipeGestureToast, { swipeDirection: ['down', 'right'] })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      await fireEvent.pointerDown(toast, { clientX: 100, clientY: 100, button: 0, pointerId: 1 })
      await fireEvent.pointerMove(toast, { clientX: 101, clientY: 101, pointerId: 1 })
      await fireEvent.pointerMove(toast, { clientX: 120, clientY: 150, pointerId: 1 })

      expect(toast.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px')
      expect(toast.style.getPropertyValue('--toast-swipe-movement-y')).not.toBe('0px')

      await fireEvent.pointerUp(toast, { clientX: 120, clientY: 150, pointerId: 1 })
    })

    it('cancels a vertical swipe when the pointer changes its mind', async () => {
      render(SwipeGestureToast, { swipeDirection: 'up' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      await fireEvent.pointerDown(toast, { clientX: 100, clientY: 100, button: 0, pointerId: 1 })
      await fireEvent.pointerMove(toast, { clientX: 100, clientY: 99, movementY: -1, pointerId: 1 })
      await fireEvent.pointerMove(toast, {
        clientX: 100,
        clientY: 10,
        movementY: -89,
        pointerId: 1
      })
      expect(toast).toHaveAttribute('data-swipe-direction', 'up')

      await fireEvent.pointerMove(toast, { clientX: 100, clientY: 50, movementY: 40, pointerId: 1 })
      await fireEvent.pointerUp(toast, { clientX: 100, clientY: 50, pointerId: 1 })

      expect(screen.queryByTestId('toast-root')).not.toBeNull()
      expect(toast).not.toHaveAttribute('data-swipe-direction')
      expect(toast.style.getPropertyValue('--toast-swipe-movement-y')).toBe('0px')
    })

    it('cancels a horizontal swipe when the pointer changes its mind', async () => {
      render(SwipeGestureToast, { swipeDirection: 'right' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      await fireEvent.pointerDown(toast, { clientX: 100, clientY: 100, button: 0, pointerId: 1 })
      await fireEvent.pointerMove(toast, { clientX: 101, clientY: 100, movementX: 1, pointerId: 1 })
      await fireEvent.pointerMove(toast, {
        clientX: 190,
        clientY: 100,
        movementX: 89,
        pointerId: 1
      })
      expect(toast).toHaveAttribute('data-swipe-direction', 'right')

      await fireEvent.pointerMove(toast, {
        clientX: 150,
        clientY: 100,
        movementX: -40,
        pointerId: 1
      })
      await fireEvent.pointerUp(toast, { clientX: 150, clientY: 100, pointerId: 1 })

      expect(screen.queryByTestId('toast-root')).not.toBeNull()
      expect(toast).not.toHaveAttribute('data-swipe-direction')
      expect(toast.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px')
    })

    it('locks the gesture to the horizontal axis when it starts sideways', async () => {
      render(SwipeGestureToast, { swipeDirection: ['down', 'right'] })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      await fireEvent.pointerDown(toast, { clientX: 100, clientY: 100, button: 0, pointerId: 1 })
      await fireEvent.pointerMove(toast, { clientX: 100, clientY: 100, pointerId: 1 })
      await fireEvent.pointerMove(toast, { clientX: 95, clientY: 98, pointerId: 1 })

      await fireEvent.pointerMove(toast, { clientX: 90, clientY: 98, pointerId: 1 })
      expect(toast).not.toHaveAttribute('data-swipe-direction')

      await fireEvent.pointerMove(toast, { clientX: 100, clientY: 98, pointerId: 1 })
      expect(toast).not.toHaveAttribute('data-swipe-direction')

      await fireEvent.pointerMove(toast, { clientX: 110, clientY: 220, pointerId: 1 })
      expect(toast).toHaveAttribute('data-swipe-direction', 'right')

      await fireEvent.pointerMove(toast, { clientX: 160, clientY: 220, pointerId: 1 })
      await fireEvent.pointerUp(toast, { clientX: 160, clientY: 220, pointerId: 1 })

      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
    })

    it('locks the gesture to the vertical axis when it starts upright', async () => {
      render(SwipeGestureToast, { swipeDirection: ['down', 'right'] })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      await fireEvent.pointerDown(toast, { clientX: 100, clientY: 100, button: 0, pointerId: 1 })
      await fireEvent.pointerMove(toast, { clientX: 100, clientY: 100, pointerId: 1 })
      await fireEvent.pointerMove(toast, { clientX: 98, clientY: 95, pointerId: 1 })

      await fireEvent.pointerMove(toast, { clientX: 98, clientY: 90, pointerId: 1 })
      expect(toast).not.toHaveAttribute('data-swipe-direction')

      await fireEvent.pointerMove(toast, { clientX: 98, clientY: 100, pointerId: 1 })
      expect(toast).not.toHaveAttribute('data-swipe-direction')

      await fireEvent.pointerMove(toast, { clientX: 220, clientY: 110, pointerId: 1 })
      expect(toast).toHaveAttribute('data-swipe-direction', 'down')

      await fireEvent.pointerMove(toast, { clientX: 220, clientY: 160, pointerId: 1 })
      await fireEvent.pointerUp(toast, { clientX: 220, clientY: 160, pointerId: 1 })

      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
    })

    it('does not start a swipe from a non-primary pointer button', async () => {
      render(SwipeGestureToast, { swipeDirection: 'right' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      await fireEvent.pointerDown(toast, { clientX: 100, clientY: 100, button: 2, pointerId: 1 })
      expect(toast).not.toHaveAttribute('data-swiping')

      await fireEvent.pointerMove(toast, { clientX: 200, clientY: 100, pointerId: 1 })
      await fireEvent.pointerUp(toast, { clientX: 200, clientY: 100, pointerId: 1 })

      expect(screen.queryByTestId('toast-root')).not.toBeNull()
    })

    it('applies [data-swiping] attribute when swiping', async () => {
      render(SwipeGestureToast, { swipeDirection: 'up' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      expect(toast).not.toHaveAttribute('data-swiping')

      await fireEvent.pointerDown(toast, { clientX: 100, clientY: 100, button: 0, pointerId: 1 })
      expect(toast).toHaveAttribute('data-swiping', '')
    })

    it('dismisses toast when swiped down with downward swipe direction', async () => {
      render(SwipeGestureToast, { swipeDirection: 'down' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      simulateSwipe(toast, 100, 100, 100, 150)
      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
    })

    it('dismisses toast when swiped left with leftward swipe direction', async () => {
      render(SwipeGestureToast, { swipeDirection: 'left' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      simulateSwipe(toast, 100, 100, 45, 100)
      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
    })

    it('dismisses toast when swiped right with rightward swipe direction', async () => {
      render(SwipeGestureToast, { swipeDirection: 'right' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      simulateSwipe(toast, 100, 100, 155, 100)
      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
    })

    it('allows swiping in multiple directions when specified', async () => {
      render(SwipeGestureToast, { swipeDirection: ['up', 'right'] })
      const addButton = screen.getByRole('button', { name: 'add toast' })

      fireEvent.click(addButton)
      simulateSwipe(await screen.findByTestId('toast-root'), 100, 100, 100, 50)
      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())

      fireEvent.click(addButton)
      simulateSwipe(await screen.findByTestId('toast-root'), 100, 100, 150, 100)
      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
    })

    it('does not dismiss when swiped in non-specified direction', async () => {
      render(SwipeGestureToast, { swipeDirection: 'up' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      simulateSwipe(toast, 100, 100, 150, 100)
      expect(screen.queryByTestId('toast-root')).not.toBeNull()

      simulateSwipe(toast, 100, 100, 100, 150)
      expect(screen.queryByTestId('toast-root')).not.toBeNull()
    })

    it('does not dismiss when swipe distance is below threshold', async () => {
      render(SwipeGestureToast, { swipeDirection: 'up' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      simulateSwipe(toast, 100, 100, 100, 95)
      expect(screen.queryByTestId('toast-root')).not.toBeNull()
    })

    it('prevents native touchmove only during an active touch swipe', async () => {
      render(SwipeGestureToast, { swipeDirection: 'up' })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      const before = new Event('touchmove', { bubbles: true, cancelable: true })
      toast.dispatchEvent(before)
      expect(before.defaultPrevented).toBe(false)

      fireEvent.pointerDown(toast, {
        clientX: 100,
        clientY: 100,
        button: 0,
        pointerId: 1,
        pointerType: 'touch'
      })

      const during = new Event('touchmove', { bubbles: true, cancelable: true })
      toast.dispatchEvent(during)
      expect(during.defaultPrevented).toBe(true)

      fireEvent.pointerCancel(toast, { pointerId: 1, pointerType: 'touch' })

      const after = new Event('touchmove', { bubbles: true, cancelable: true })
      toast.dispatchEvent(after)
      expect(after.defaultPrevented).toBe(false)
    })

    it('does not start swiping from elements with the data-shards-ui-swipe-ignore attribute', async () => {
      render(SwipeIgnoreToast)
      await fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      fireEvent.pointerDown(screen.getByTestId('ignore-target'), {
        clientX: 100,
        clientY: 100,
        button: 0,
        pointerId: 1
      })

      expect(toast).not.toHaveAttribute('data-swiping')
    })

    it('ignores swipe gestures when toast is anchored', async () => {
      render(SwipeGestureToast, { swipeDirection: 'up', anchored: true })
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      simulateSwipe(toast, 100, 100, 100, 55)
      expect(screen.queryByTestId('toast-root')).not.toBeNull()
    })
  })

  describe('drag behavior regression', () => {
    it('resets drag state after releasing a far swipe even when the release lands on the document', async () => {
      render(SwipeGestureToast)
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      simulateSwipe(toast, 300, 100, -5000, 100, document)

      expect(toast).not.toHaveAttribute('data-swiping')
      expect(toast).not.toHaveAttribute('data-swipe-direction')
      expect(toast.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px')
      expect(toast.style.getPropertyValue('--toast-swipe-movement-y')).toBe('0px')
      expect(toast.style.transition).toBe('')
      expect(toast.style.transform).toBe('')

      simulateSwipe(toast, 100, 100, 150, 100)
      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
    })

    it('resets drag state after a document pointercancel', async () => {
      render(SwipeGestureToast)
      fireEvent.click(screen.getByRole('button', { name: 'add toast' }))
      const toast = await screen.findByTestId('toast-root')

      simulateSwipe(toast, 300, 100, -5000, 100, document, 'pointercancel')

      expect(toast).not.toHaveAttribute('data-swiping')
      expect(toast).not.toHaveAttribute('data-swipe-direction')
      expect(toast.style.getPropertyValue('--toast-swipe-movement-x')).toBe('0px')
      expect(toast.style.getPropertyValue('--toast-swipe-movement-y')).toBe('0px')
      expect(toast.style.transition).toBe('')
      expect(toast.style.transform).toBe('')
    })
  })

  describe('object identity', () => {
    it('works correctly when toast objects are recreated (not referentially equal)', async () => {
      render(RecreatedToast)
      await fireEvent.click(screen.getByRole('button', { name: 'add one' }))
      const toast = await screen.findByTestId('toast-root')

      await waitFor(() => expect(toast.style.getPropertyValue('--toast-index')).toBe('0'))

      await fireEvent.click(screen.getByTestId('toast-close'))
      await waitFor(() => expect(screen.queryByTestId('toast-root')).toBeNull())
    })

    it('correctly calculates indices for multiple toasts with recreated objects', async () => {
      render(RecreatedToast)
      await fireEvent.click(screen.getByRole('button', { name: 'add three' }))
      const toasts = await screen.findAllByTestId('toast-root')
      expect(toasts).toHaveLength(3)

      await waitFor(() => {
        for (const el of toasts) {
          expect(parseInt(el.style.getPropertyValue('--toast-index'), 10)).toBeGreaterThanOrEqual(0)
        }
      })
    })
  })

  it('closes the toast a retained root was reused for, not the one it first held', async () => {
    const user = userEvent.setup()
    render(IndexKeyedCloseToast)

    const addButton = screen.getByTestId('add')
    await user.click(addButton)
    await waitFor(() => expect(screen.getByTestId('title-0')).toHaveTextContent('Toast 1'))

    const retainedRoot = screen.getByTestId('root-0')
    await user.click(addButton)

    expect(screen.getByTestId('root-0')).toBe(retainedRoot)
    await waitFor(() => expect(screen.getByTestId('title-0')).toHaveTextContent('Toast 2'))

    await user.click(screen.getByTestId('close-0'))

    await waitFor(() => expect(screen.queryByText('Toast 2')).not.toBeInTheDocument())
    expect(screen.getByText('Toast 1')).toBeInTheDocument()
  })
})
