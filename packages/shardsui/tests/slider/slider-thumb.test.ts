import { fireEvent, render, screen, waitFor } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicSlider from './fixtures/basic-slider.svelte'
import ExtraThumbSlider from './fixtures/extra-thumb-slider.svelte'
import RangeThumbsOnBlur from './fixtures/range-thumbs-on-blur.svelte'
import SizedSlider from './fixtures/sized-slider.svelte'
import Stacking from './fixtures/stacking.svelte'
import ThumbAlignment from './fixtures/thumb-alignment.svelte'
import ThumbFull from './fixtures/thumb-full.svelte'
import ThumbKeydown from './fixtures/thumb-keydown.svelte'

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

function mockControlRect(control: HTMLElement, width: number) {
  vi.spyOn(control, 'getBoundingClientRect').mockImplementation(
    () =>
      ({
        width,
        height: 10,
        bottom: 10,
        left: 0,
        x: 0,
        y: 0,
        top: 0,
        right: width
      }) as DOMRect
  )
}

describe('<Slider.Thumb />', () => {
  describe('attributes', () => {
    it('forwards aria-describedby to the input', () => {
      render(BasicSlider, { value: 50, thumbAriaDescribedby: 'desc-id' })
      expect(screen.getByRole('slider')).toHaveAttribute('aria-describedby', 'desc-id')
    })

    it('forwards aria-label to the input', () => {
      render(BasicSlider, { value: 50, thumbAriaLabel: 'test' })
      expect(screen.getByRole('slider')).toHaveAttribute('aria-label', 'test')
    })

    it('handles non-integer step values via input change with exponent notation', async () => {
      render(BasicSlider, { value: 50, min: -100, max: 100, step: 0.00000001 })
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('step', '1e-8')

      await fireEvent.input(slider, { target: { value: '51.1' } })
      expect(slider).toHaveAttribute('aria-valuenow', '51.1')

      await fireEvent.input(slider, { target: { value: '0.00000005' } })
      expect(slider).toHaveAttribute('aria-valuenow', '5e-8')

      await fireEvent.input(slider, { target: { value: '1e-7' } })
      expect(slider).toHaveAttribute('aria-valuenow', '1e-7')
    })
  })

  describe('ARIA attributes', () => {
    it('forwards aria-labelledby to the input', () => {
      render(ThumbFull, { value: 50, thumbAriaLabelledby: 'test' })
      expect(screen.getByRole('slider')).toHaveAttribute('aria-labelledby', 'test')
    })

    it('forwards aria-valuetext to the input', () => {
      render(ThumbFull, { value: 50, thumbAriaValuetext: 'test' })
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', 'test')
    })
  })

  describe('prop: onkeydown', () => {
    it('forwards unhandled key events (Enter)', () => {
      const handleKeyDown = vi.fn()
      render(ThumbKeydown, { value: 50, onkeydown: handleKeyDown })
      const slider = screen.getByRole('slider')
      slider.focus()
      fireEvent.keyDown(slider, { key: 'Enter' })
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })

    it.each(['ArrowRight', 'PageUp'])('forwards handled %s key events', (key) => {
      const handleKeyDown = vi.fn()
      render(ThumbKeydown, { value: 50, onkeydown: handleKeyDown })
      const slider = screen.getByRole('slider')
      slider.focus()
      fireEvent.keyDown(slider, { key })
      expect(handleKeyDown).toHaveBeenCalledTimes(1)
    })

    it('can prevent internal key handling via preventDefault', () => {
      const handleKeyDown = vi.fn((event: KeyboardEvent) => event.preventDefault())
      render(ThumbKeydown, { value: 50, onkeydown: handleKeyDown })
      const slider = screen.getByRole('slider')
      slider.focus()
      fireEvent.keyDown(slider, { key: 'ArrowRight' })

      expect(handleKeyDown).toHaveBeenCalledTimes(1)
      expect(slider).toHaveAttribute('aria-valuenow', '50')
    })
  })

  describe('prop: tabindex', () => {
    it('does not apply tabindex to the thumb element by default (input keeps 0)', () => {
      render(ThumbFull, { value: 50 })
      expect(screen.getByTestId('thumb')).not.toHaveAttribute('tabindex')
      expect(screen.getByRole('slider')).toHaveProperty('tabIndex', 0)
    })

    it('tabindex={-1} removes the input from the tab sequence', async () => {
      const user = userEvent.setup()
      render(ThumbFull, { value: 50, thumbTabindex: -1 })

      expect(screen.getByRole('slider')).toHaveProperty('tabIndex', -1)
      expect(document.body).toHaveFocus()
      await user.keyboard('{Tab}')
      expect(document.body).toHaveFocus()
    })
  })

  describe('prop: children', () => {
    it('renders the nested input as a sibling to children', () => {
      render(ThumbFull, { value: 50, showChild: true })
      const thumb = screen.getByTestId('thumb')
      expect(thumb.querySelector('input[type="range"]')).toBe(screen.getByRole('slider'))
      expect(thumb.querySelector('[data-testid="child"]')).toBe(screen.getByTestId('child'))
    })
  })

  describe('stacking order', () => {
    it('relies on DOM order before any thumb is used', () => {
      render(Stacking, { value: [20, 20] })
      expect(screen.getByTestId('thumb-0').style.zIndex).toBe('')
      expect(screen.getByTestId('thumb-1').style.zIndex).toBe('')
    })

    it('keeps the most recently active thumb on top after focus moves away', async () => {
      const user = userEvent.setup()
      render(Stacking, { value: [20, 20] })

      const thumb0 = screen.getByTestId('thumb-0')
      const thumb1 = screen.getByTestId('thumb-1')

      await user.keyboard('{Tab}')
      expect(screen.getAllByRole('slider')[0]).toHaveFocus()
      expect(thumb0.style.zIndex).toBe('2')

      await user.keyboard('{Tab}')
      expect(screen.getAllByRole('slider')[1]).toHaveFocus()
      expect(thumb1.style.zIndex).toBe('2')

      await user.keyboard('{Tab}')
      expect(document.body).toHaveFocus()
      expect(thumb1.style.zIndex).toBe('1')
      expect(thumb0.style.zIndex).toBe('')
    })
  })

  describe.skipIf(isJSDOM)('focus and blur', () => {
    it('forwards focus and blur as the input enters and leaves the tab sequence', async () => {
      const user = userEvent.setup()
      const focusSpy = vi.fn((event: FocusEvent) => event.target)
      const blurSpy = vi.fn((event: FocusEvent) => event.target)
      render(ThumbFull, { value: 50, thumbOnfocus: focusSpy, thumbOnblur: blurSpy })

      const input = screen.getByRole('slider')
      expect(document.body).toHaveFocus()

      await user.keyboard('{Tab}')
      expect(input).toHaveFocus()
      expect(focusSpy).toHaveBeenCalledTimes(1)
      expect(focusSpy.mock.results[0]?.value).toBe(input)

      await user.keyboard('{Tab}')
      expect(document.body).toHaveFocus()
      expect(blurSpy).toHaveBeenCalledTimes(1)
      expect(blurSpy.mock.results[0]?.value).toBe(input)
    })

    it('forwards focus and blur per thumb when tabbing across a range', async () => {
      const user = userEvent.setup()
      const focusSpy = vi.fn((event: FocusEvent) => event.target)
      const blurSpy = vi.fn((event: FocusEvent) => event.target)
      render(Stacking, { value: [50, 70], onfocus: focusSpy, onblur: blurSpy })

      const [input0, input1] = screen.getAllByRole('slider')

      await user.keyboard('{Tab}')
      expect(input0).toHaveFocus()
      expect(focusSpy.mock.results.at(-1)?.value).toBe(input0)

      await user.keyboard('{Tab}')
      expect(input1).toHaveFocus()
      expect(blurSpy.mock.results.at(-1)?.value).toBe(input0)
      expect(focusSpy.mock.results.at(-1)?.value).toBe(input1)

      await user.keyboard('{Tab}')
      expect(document.body).toHaveFocus()
      expect(blurSpy.mock.results.at(-1)?.value).toBe(input1)
    })

    it('forwards focus and blur to the input so `currentTarget` is the input', async () => {
      const user = userEvent.setup()
      const focusSpy = vi.fn()
      const blurSpy = vi.fn()
      render(ThumbFull, {
        value: 50,
        thumbOnfocus: (event: FocusEvent) => focusSpy(event.currentTarget),
        thumbOnblur: (event: FocusEvent) => blurSpy(event.currentTarget)
      })

      await user.keyboard('{Tab}')
      expect(focusSpy).toHaveBeenCalledTimes(1)
      expect(focusSpy.mock.calls[0][0]).toHaveProperty('tagName', 'INPUT')

      await user.keyboard('{Tab}')
      expect(blurSpy).toHaveBeenCalledTimes(1)
      expect(blurSpy.mock.calls[0][0]).toHaveProperty('tagName', 'INPUT')
    })
  })

  describe.skipIf(isJSDOM)('positioning styles', () => {
    describe('positions the thumb when dragged', () => {
      it('single thumb', async () => {
        render(SizedSlider, { value: 50, width: 1000 })

        const control = screen.getByTestId('control')
        const thumbStyles = getComputedStyle(screen.getByTestId('thumb'))

        mockControlRect(control, 1000)

        fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 20, clientY: 0 }])
        fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 199, clientY: 0 }])
        fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 199, clientY: 0 }])
        fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 199, clientY: 0 }])

        await waitFor(() => expect(thumbStyles.getPropertyValue('left')).toBe('200px'))

        fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 0, clientY: 0 }])
        expect(thumbStyles.getPropertyValue('left')).toBe('200px')
      })

      it('multiple thumbs', async () => {
        render(SizedSlider, { value: [20, 40], width: 1000 })

        const control = screen.getByTestId('control')
        const [thumb1, thumb2] = screen.getAllByTestId('thumb')
        const thumb1Styles = getComputedStyle(thumb1)
        const thumb2Styles = getComputedStyle(thumb2)

        mockControlRect(control, 1000)

        fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 400, clientY: 0 }])
        fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 699, clientY: 0 }])
        fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 699, clientY: 0 }])
        fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 699, clientY: 0 }])

        await waitFor(() => expect(thumb2Styles.getPropertyValue('left')).toBe('700px'))

        fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 0, clientY: 0 }])
        expect(thumb1Styles.getPropertyValue('left')).toBe('200px')
        expect(thumb2Styles.getPropertyValue('left')).toBe('700px')
      })
    })

    describe('positions the thumb when the controlled value changes externally', () => {
      it('single thumb', async () => {
        render(SizedSlider, { value: 20, width: 100, nextValue: 55 })

        const thumbStyles = getComputedStyle(screen.getByTestId('thumb'))
        expect(thumbStyles.getPropertyValue('left')).toBe('20px')

        await fireEvent.click(screen.getByRole('button'))
        expect(thumbStyles.getPropertyValue('left')).toBe('55px')
      })

      it('multiple thumbs', async () => {
        render(SizedSlider, { value: [20, 50], width: 100, nextValue: [33, 72] })

        const [thumb1, thumb2] = screen.getAllByTestId('thumb')
        const thumb1Styles = getComputedStyle(thumb1)
        const thumb2Styles = getComputedStyle(thumb2)

        expect(thumb1Styles.getPropertyValue('left')).toBe('20px')
        expect(thumb2Styles.getPropertyValue('left')).toBe('50px')

        await fireEvent.click(screen.getByRole('button'))
        expect(thumb1Styles.getPropertyValue('left')).toBe('33px')
        expect(thumb2Styles.getPropertyValue('left')).toBe('72px')
      })
    })
  })

  describe.skipIf(isJSDOM)('prop: thumbAlignment', () => {
    it('recomputes inset positions when the slider becomes visible', async () => {
      const { rerender } = render(ThumbAlignment, {
        value: 30,
        controlSize: 100,
        thumbSize: 10,
        hidden: true
      })

      const thumb = screen.getByTestId('thumb-0')
      await waitFor(() => {
        expect(thumb.style.visibility).toBe('hidden')
        expect(thumb.style.getPropertyValue('--position')).toBe('0%')
      })

      await rerender({ value: 30, controlSize: 100, thumbSize: 10, hidden: false })

      await waitFor(() => {
        expect(thumb.style.visibility).toBe('')
        expect(thumb.style.getPropertyValue('--position')).toBe('32%')
      })
    })

    it('recomputes range inset positions when the slider becomes visible', async () => {
      const { rerender } = render(ThumbAlignment, {
        value: [30, 70],
        controlSize: 100,
        thumbSize: 10,
        hidden: true
      })

      const startThumb = screen.getByTestId('thumb-0')
      const endThumb = screen.getByTestId('thumb-1')
      await waitFor(() => {
        expect(startThumb.style.visibility).toBe('hidden')
        expect(startThumb.style.getPropertyValue('--position')).toBe('0%')
        expect(endThumb.style.visibility).toBe('hidden')
        expect(endThumb.style.getPropertyValue('--position')).toBe('0%')
      })

      await rerender({ value: [30, 70], controlSize: 100, thumbSize: 10, hidden: false })

      await waitFor(() => {
        expect(startThumb.style.visibility).toBe('')
        expect(startThumb.style.getPropertyValue('--position')).toBe('32%')
        expect(endThumb.style.visibility).toBe('')
        expect(endThumb.style.getPropertyValue('--position')).toBe('68%')
      })
    })
  })

  it('preserves the grab offset when dragging a vertical thumb', async () => {
    const onValueChange = vi.fn()
    render(BasicSlider, { value: 50, orientation: 'vertical', onValueChange })

    const control = screen.getByTestId('control')
    const thumb = screen.getByTestId('thumb')
    vi.spyOn(control, 'getBoundingClientRect').mockImplementation(
      () =>
        ({ width: 10, height: 100, top: 0, left: 0, right: 10, bottom: 100, x: 0, y: 0 }) as DOMRect
    )
    vi.spyOn(thumb, 'getBoundingClientRect').mockImplementation(
      () =>
        ({ width: 10, height: 20, top: 40, left: 0, right: 10, bottom: 60, x: 0, y: 40 }) as DOMRect
    )

    fireEvent.pointerDown(thumb, { button: 0, buttons: 1, clientX: 5, clientY: 60 })
    fireEvent.pointerMove(document.body, { buttons: 1, clientX: 5, clientY: 80 })

    await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(30))
  })

  it.skipIf(isJSDOM)(
    'commits field validation when focus moves from a thumb to an arbitrary Control child',
    async () => {
      const validate = vi.fn(() => null)
      render(RangeThumbsOnBlur, { validate, showHelp: true })

      const [thumb0, thumb1] = screen.getAllByRole('slider')

      await userEvent.tab()
      expect(thumb0).toHaveFocus()
      validate.mockClear()

      await userEvent.tab()
      expect(thumb1).toHaveFocus()
      expect(validate).not.toHaveBeenCalled()

      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'Help' })).toHaveFocus()
      await waitFor(() => expect(validate).toHaveBeenCalledTimes(1))
      expect(screen.getByTestId('field')).toHaveAttribute('data-touched')
      expect(screen.getByTestId('field')).not.toHaveAttribute('data-focused')

      await userEvent.tab()
      expect(screen.getByRole('button', { name: 'after' })).toHaveFocus()
      expect(validate).toHaveBeenCalledTimes(1)
    }
  )

  describe('out of bounds values', () => {
    it('keeps the thumb inside the control when the value exceeds max', () => {
      render(BasicSlider, { value: 119.9 })
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '100')
      expect(screen.getByTestId('thumb').style.getPropertyValue('inset-inline-start')).toBe('100%')
    })

    it('keeps the thumb inside the control when the value is below min', () => {
      render(BasicSlider, { value: -7.31 })
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '0')
      expect(screen.getByTestId('thumb').style.getPropertyValue('inset-inline-start')).toBe('0%')
    })

    it('clamps the thumb when the controlled value moves out of bounds', async () => {
      const { rerender } = render(BasicSlider, { value: 50 })
      const thumb = screen.getByTestId('thumb')
      const input = screen.getByRole('slider')
      expect(thumb.style.getPropertyValue('inset-inline-start')).toBe('50%')

      await rerender({ value: 119.9 })
      expect(input).toHaveAttribute('aria-valuenow', '100')
      expect(thumb.style.getPropertyValue('inset-inline-start')).toBe('100%')

      await rerender({ value: -7.31 })
      expect(input).toHaveAttribute('aria-valuenow', '0')
      expect(thumb.style.getPropertyValue('inset-inline-start')).toBe('0%')
    })

    it('keeps a value outside the default 0-100 range on the input', () => {
      render(BasicSlider, { value: 250, min: 200, max: 300 })
      const input = screen.getByRole('slider') as HTMLInputElement
      expect(input.value).toBe('250')
      expect(input).toHaveAttribute('aria-valuenow', '250')
    })
  })

  it('does not commit a value when more thumbs are rendered than values', async () => {
    const onValueChange = vi.fn()
    const onValueCommitted = vi.fn()
    render(ExtraThumbSlider, { onValueChange, onValueCommitted })

    const extraThumb = screen.getAllByRole('slider')[2]
    extraThumb.focus()
    await fireEvent.keyDown(extraThumb, { key: 'ArrowRight' })

    expect(onValueChange).not.toHaveBeenCalled()
    expect(onValueCommitted).not.toHaveBeenCalled()
  })

  it('does not commit field validation when moving focus between range thumbs', async () => {
    const validate = vi.fn(() => null)
    render(RangeThumbsOnBlur, { validate })

    const [thumb0, thumb1] = screen.getAllByRole('slider')

    await userEvent.tab()
    expect(thumb0).toHaveFocus()

    validate.mockClear()

    await userEvent.tab()
    expect(thumb1).toHaveFocus()
    expect(validate).not.toHaveBeenCalled()

    await userEvent.tab()
    expect(thumb1).not.toHaveFocus()
    await waitFor(() => expect(validate).toHaveBeenCalledTimes(1))
  })
})
