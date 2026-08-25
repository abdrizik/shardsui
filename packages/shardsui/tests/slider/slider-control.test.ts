import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicSlider from './fixtures/basic-slider.svelte'
import ControlOutsideRoot from './fixtures/control-outside-root.svelte'
import ControlSlider from './fixtures/control-slider.svelte'

function mockRect(
  element: HTMLElement,
  rect: { left?: number; top?: number; width?: number; height?: number }
) {
  const { left = 0, top = 0, width = 0, height = 0 } = rect
  vi.spyOn(element, 'getBoundingClientRect').mockImplementation(
    () => new DOMRect(left, top, width, height)
  )
}

function mockHorizontalControl(control: HTMLElement, width = 100) {
  mockRect(control, { width, height: 10 })
}

// jsdom has no `Touch` constructor, so `changedTouches` is defined on a plain Event instead.
function fireTouch(
  target: EventTarget,
  type: 'touchstart' | 'touchmove' | 'touchend',
  points: { identifier: number; clientX: number; clientY: number }[]
) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'changedTouches', { value: points, configurable: true })
  target.dispatchEvent(event)
}

describe('<Slider.Control />', () => {
  it('does not apply a tabindex by default', () => {
    render(BasicSlider, {})
    expect(screen.getByTestId('control')).not.toHaveAttribute('tabindex')
  })

  it('throws a descriptive error when rendered outside <Slider.Root>', () => {
    expect(() => render(ControlOutsideRoot)).toThrow(
      'ShardsUI: this part must be rendered inside <Slider.Root>.'
    )
  })

  it('moves the first of several thumbs stacked at the maximum', async () => {
    const onValueChange = vi.fn()
    render(ControlSlider, { value: [100, 100, 100], onValueChange })

    const control = screen.getByTestId('control')
    const lastThumb = screen.getByTestId('thumb-2')
    mockHorizontalControl(control)
    mockRect(lastThumb, { width: 20, height: 10, left: 90 })

    fireEvent.pointerDown(lastThumb, { buttons: 1, clientX: 100 })
    fireEvent.pointerMove(document.body, { buttons: 1, clientX: 50 })

    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith([50, 100, 100]))
  })

  it('clears the grabbed offset when swapping to a thumb that is not rendered', async () => {
    const onValueChange = vi.fn()
    render(ControlSlider, {
      value: [20, 40],
      thumbCollisionBehavior: 'swap',
      thumbCount: 1,
      onValueChange
    })

    const control = screen.getByTestId('control')
    const thumb = screen.getByTestId('thumb-0')
    mockHorizontalControl(control)
    mockRect(thumb, { width: 20, height: 10, left: 10 })

    fireEvent.pointerDown(thumb, { buttons: 1, clientX: 30 })
    fireEvent.pointerMove(document.body, { buttons: 1, clientX: 70 })
    fireEvent.pointerMove(document.body, { buttons: 1, clientX: 80 })

    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith([40, 80]))
  })

  it('ignores a drag when the collision behavior cannot satisfy the minimum distance', () => {
    const onValueChange = vi.fn()
    render(ControlSlider, {
      value: [20, 40],
      thumbCollisionBehavior: 'none',
      minStepsBetweenValues: 50,
      onValueChange
    })

    const control = screen.getByTestId('control')
    const thumb = screen.getByTestId('thumb-0')
    mockHorizontalControl(control)
    mockRect(thumb, { width: 20, height: 10, left: 10 })

    fireEvent.pointerDown(thumb, { button: 0, buttons: 1, clientX: 20 })
    fireEvent.pointerMove(document.body, { buttons: 1, clientX: 80 })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  const insetCases = [
    {
      name: 'horizontal',
      orientation: 'horizontal' as const,
      control: { width: 100, height: 10 },
      thumb: { width: 20, height: 10, left: 40 },
      pointer: { clientX: 10, clientY: 5 }
    },
    {
      name: 'vertical',
      orientation: 'vertical' as const,
      control: { width: 10, height: 100 },
      thumb: { width: 10, height: 20, top: 40 },
      pointer: { clientX: 5, clientY: 90 }
    }
  ]

  insetCases.forEach(({ name, orientation, control: controlRect, thumb: thumbRect, pointer }) => {
    it(`accounts for the thumb size when pressing an inset ${name} control`, async () => {
      const onValueChange = vi.fn()
      render(ControlSlider, { value: 50, orientation, thumbAlignment: 'edge', onValueChange })

      const control = screen.getByTestId('control')
      mockRect(control, controlRect)
      mockRect(screen.getByTestId('thumb-0'), thumbRect)

      fireEvent.pointerDown(control, { button: 0, buttons: 1, ...pointer })

      await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(0))
    })
  })

  it('releases pointer capture when the interaction ends', () => {
    render(ControlSlider, { value: 20 })

    const control = screen.getByTestId('control')
    mockHorizontalControl(control)
    const releasePointerCapture = vi.fn()
    Object.defineProperties(control, {
      setPointerCapture: { configurable: true, value: vi.fn() },
      hasPointerCapture: { configurable: true, value: () => true },
      releasePointerCapture: { configurable: true, value: releasePointerCapture }
    })

    fireEvent.pointerDown(control, {
      pointerId: 7,
      pointerType: 'mouse',
      button: 0,
      buttons: 1,
      clientX: 40
    })
    fireEvent.pointerUp(document.body, {
      pointerId: 7,
      pointerType: 'mouse',
      buttons: 0,
      clientX: 40
    })

    expect(releasePointerCapture).toHaveBeenCalledWith(7)
  })

  it.skipIf(isJSDOM)('handles touch interactions that originate on a text node', async () => {
    const onValueChange = vi.fn()
    render(ControlSlider, { value: 20, trackText: true, onValueChange })

    mockHorizontalControl(screen.getByTestId('control'))
    const textNode = screen.getByTestId('track-text').firstChild!

    fireTouch(textNode, 'touchstart', [{ identifier: 1, clientX: 60, clientY: 0 }])

    await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(60))
    fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 60, clientY: 0 }])
  })

  it.skipIf(isJSDOM)('ignores touch interactions when no thumbs are composed', () => {
    const onValueChange = vi.fn()
    render(ControlSlider, { value: 20, thumbCount: 0, onValueChange })

    const control = screen.getByTestId('control')
    mockHorizontalControl(control)

    fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 60, clientY: 0 }])
    fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 80, clientY: 0 }])

    expect(onValueChange).not.toHaveBeenCalled()
    fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 80, clientY: 0 }])
  })

  describe.skipIf(isJSDOM)('a range that changes length mid-drag', () => {
    it('does not resurrect a removed thumb value', async () => {
      const onValueChange = vi.fn()
      const onValueCommitted = vi.fn()
      render(ControlSlider, {
        value: [10, 20, 30],
        nextValue: [10, 20],
        onValueChange,
        onValueCommitted
      })

      mockHorizontalControl(screen.getByTestId('control'))

      fireEvent.pointerDown(screen.getByTestId('thumb-2'), { buttons: 1, clientX: 30 })
      fireEvent.pointerMove(document.body, { buttons: 1, clientX: 50 })
      await waitFor(() => expect(onValueChange.mock.lastCall?.[0]).toHaveLength(3))

      await fireEvent.click(screen.getByRole('button', { name: 'set' }))
      await waitFor(() => expect(screen.getAllByRole('slider')).toHaveLength(2))

      onValueChange.mockClear()
      onValueCommitted.mockClear()

      fireEvent.pointerMove(document.body, { buttons: 1, clientX: 50 })
      fireEvent.pointerUp(document.body, { buttons: 0, clientX: 50 })

      expect(onValueChange).not.toHaveBeenCalled()
      expect(onValueCommitted).not.toHaveBeenCalled()
    })

    it('does not commit a stale value when the pressed thumb stays valid', async () => {
      const onValueChange = vi.fn()
      const onValueCommitted = vi.fn()
      render(ControlSlider, {
        value: [10, 20, 30],
        nextValue: [10, 20],
        onValueChange,
        onValueCommitted
      })

      mockHorizontalControl(screen.getByTestId('control'))

      fireEvent.pointerDown(screen.getByTestId('thumb-1'), { buttons: 1, clientX: 20 })
      fireEvent.pointerMove(document.body, { buttons: 1, clientX: 40 })
      await waitFor(() => expect(onValueChange.mock.lastCall?.[0]).toHaveLength(3))

      await fireEvent.click(screen.getByRole('button', { name: 'set' }))
      await waitFor(() => expect(screen.getAllByRole('slider')).toHaveLength(2))

      onValueCommitted.mockClear()
      fireEvent.pointerUp(document.body, { buttons: 0, clientX: 40 })

      expect(onValueCommitted).not.toHaveBeenCalled()
    })

    it('clears cached interaction state when the range grows', async () => {
      const onValueChange = vi.fn()
      const onValueCommitted = vi.fn()
      render(ControlSlider, {
        value: [10, 20],
        nextValue: [10, 20, 30],
        writeBack: true,
        onValueChange,
        onValueCommitted
      })

      mockHorizontalControl(screen.getByTestId('control'))

      fireEvent.pointerDown(screen.getByTestId('thumb-1'), { buttons: 1, clientX: 20 })
      fireEvent.pointerMove(document.body, { buttons: 1, clientX: 40 })
      await fireEvent.click(screen.getByRole('button', { name: 'set' }))
      await waitFor(() => expect(screen.getAllByRole('slider')).toHaveLength(3))

      onValueChange.mockClear()
      onValueCommitted.mockClear()
      fireEvent.pointerUp(document.body, { buttons: 0, clientX: 40 })

      expect(onValueCommitted).not.toHaveBeenCalled()

      fireEvent.pointerDown(screen.getByTestId('thumb-2'), { buttons: 1, clientX: 30 })
      fireEvent.pointerMove(document.body, { buttons: 1, clientX: 80 })
      fireEvent.pointerUp(document.body, { buttons: 0, clientX: 80 })

      await waitFor(() => expect(onValueCommitted).toHaveBeenCalledTimes(1))
      const nextValue = onValueChange.mock.lastCall?.[0]
      expect(nextValue).toEqual([10, 20, 100])
      expect(onValueCommitted).toHaveBeenCalledWith(nextValue)
    })
  })
})
