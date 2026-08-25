import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'
import { isJSDOM } from '../test-utils'
import BasicSlider from './fixtures/basic-slider.svelte'
import Directional from './fixtures/directional.svelte'
import DisabledRange from './fixtures/disabled-range.svelte'
import DisabledSingle from './fixtures/disabled-single.svelte'
import EventTargetSlider from './fixtures/event-target-slider.svelte'
import ExternalFormSlider from './fixtures/external-form-slider.svelte'
import FormSubmission from './fixtures/form-submission.svelte'
import FormValuesSlider from './fixtures/form-values-slider.svelte'
import MultiThumbSlider from './fixtures/multi-thumb-slider.svelte'
import NoControlSlider from './fixtures/no-control-slider.svelte'
import RangeSlider from './fixtures/range-slider.svelte'
import SliderDescribedBy from './fixtures/slider-described-by.svelte'
import SliderFieldControlled from './fixtures/slider-field-controlled.svelte'
import SliderFieldForm from './fixtures/slider-field-form.svelte'
import SliderField from './fixtures/slider-field.svelte'
import SliderForm from './fixtures/slider-form.svelte'
import SliderInField from './fixtures/slider-in-field.svelte'
import ThumbAlignment from './fixtures/thumb-alignment.svelte'
import ThumbFull from './fixtures/thumb-full.svelte'

function mockHorizontalSliderLayout(
  control: HTMLElement,
  thumbs: HTMLElement[],
  width: number,
  thumbPositions: number[]
) {
  vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, width, 10))

  thumbs.forEach((thumb, index) => {
    const left = thumbPositions[index]
    vi.spyOn(thumb, 'getBoundingClientRect').mockImplementation(() => new DOMRect(left, 0, 20, 20))
  })
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

function getSliderValues() {
  return screen.getAllByRole('slider').map((input) => Number(input.getAttribute('aria-valuenow')))
}

function mockControlRect(control: HTMLElement, width = 100) {
  vi.spyOn(control, 'getBoundingClientRect').mockImplementation(() => new DOMRect(0, 0, width, 10))
}

describe('<Slider.Root />', () => {
  it.skipIf(isJSDOM)('does not break when the initial value is out of range', () => {
    render(RangeSlider, { value: [19, 41], min: 20, max: 40 })

    const control = screen.getByTestId('control')
    mockControlRect(control)

    fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 100, clientY: 0 }])
    fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 20, clientY: 0 }])
  })

  it('clamps range values that fall outside the min and max bounds', () => {
    render(RangeSlider, { value: [19, 41], min: 20, max: 40 })

    const thumbs = screen.getAllByRole('slider')
    expect(thumbs.map((thumb) => thumb.getAttribute('aria-valuenow'))).toEqual(['20', '40'])
  })

  describe('ARIA attributes', () => {
    it('thumb has role="slider" via input[type=range]', () => {
      render(BasicSlider, {})
      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
      expect(slider.tagName).toBe('INPUT')
      expect(slider).toHaveAttribute('type', 'range')
    })

    it('aria-valuenow reflects value (scalar)', () => {
      render(BasicSlider, { value: 42 })
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '42')
    })

    it('updates aria-valuenow on input and keydown', async () => {
      render(BasicSlider, { value: 50 })
      const slider = screen.getByRole('slider')
      slider.focus()

      await fireEvent.input(slider, { target: { value: '51' } })
      expect(slider).toHaveAttribute('aria-valuenow', '51')

      await fireEvent.keyDown(slider, { key: 'ArrowRight' })
      expect(slider).toHaveAttribute('aria-valuenow', '52')
    })

    it('aria-orientation defaults to horizontal', () => {
      render(BasicSlider, {})
      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'horizontal')
    })

    it('aria-orientation reflects vertical orientation', () => {
      render(BasicSlider, { orientation: 'vertical' })
      expect(screen.getByRole('slider')).toHaveAttribute('aria-orientation', 'vertical')
    })

    it('min attribute is set on input', () => {
      render(BasicSlider, { min: 150, max: 200, value: 150 })
      expect(screen.getByRole('slider')).toHaveAttribute('min', '150')
    })

    it('max attribute is set on input', () => {
      render(BasicSlider, { max: 750, step: 100, value: 150 })
      expect(screen.getByRole('slider')).toHaveAttribute('max', '750')
    })

    it('sets default aria-valuetext on range slider thumbs', () => {
      render(RangeSlider, { value: [44, 50] })
      const sliders = screen.getAllByRole('slider')
      expect(sliders[0]).toHaveAttribute('aria-valuetext', '44 start range')
      expect(sliders[1]).toHaveAttribute('aria-valuetext', '50 end range')
    })

    it('forwards root aria-labelledby to the group and the slider input', () => {
      render(ThumbFull, { value: 30, ariaLabelledby: 'labelId' })
      const input = screen.getByRole('slider')
      expect(screen.getByRole('group')).toHaveAttribute('aria-labelledby', 'labelId')
      expect(input).toHaveAttribute('aria-labelledby', 'labelId')
      expect(input).toHaveAttribute('step', '1')
    })
  })

  describe('controlled value', () => {
    it('fires onValueChange when input changes via fireEvent.input', async () => {
      const handleValueChange = vi.fn()
      render(BasicSlider, { value: 50, onValueChange: handleValueChange })
      const slider = screen.getByRole('slider')
      await fireEvent.input(slider, { target: { value: '51' } })
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '51')
    })

    it('clamps fireEvent.input change below min', async () => {
      const handleValueChange = vi.fn()
      render(BasicSlider, {
        value: 50,
        min: 40,
        max: 60,
        onValueChange: handleValueChange
      })
      const slider = screen.getByRole('slider')
      await fireEvent.input(slider, { target: { value: '30' } })
      expect(slider).toHaveAttribute('aria-valuenow', '40')
      expect(handleValueChange).toHaveBeenCalledTimes(1)

      await fireEvent.input(slider, { target: { value: '30' } })
      expect(handleValueChange).toHaveBeenCalledTimes(1)
    })

    it('clamps fireEvent.input change above max', async () => {
      const handleValueChange = vi.fn()
      render(BasicSlider, {
        value: 50,
        min: 40,
        max: 60,
        onValueChange: handleValueChange
      })
      const slider = screen.getByRole('slider')
      await fireEvent.input(slider, { target: { value: '70' } })
      expect(slider).toHaveAttribute('aria-valuenow', '60')
      expect(handleValueChange).toHaveBeenCalledTimes(1)

      await fireEvent.input(slider, { target: { value: '70' } })
      expect(handleValueChange).toHaveBeenCalledTimes(1)
    })

    it.each([
      [51.1, '51.1'],
      [0.00000005, '5e-8'],
      [1e-7, '1e-7']
    ])('supports the non-integer value %p', (value, valuenow) => {
      render(BasicSlider, { value, min: -100, max: 100, step: 0.00000001 })
      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuenow', valuenow)
      expect(slider).toHaveAttribute('step', '1e-8')
    })
  })

  describe('step prop', () => {
    it('uses min as the step origin', () => {
      render(BasicSlider, { value: 150, step: 100, max: 750, min: 150 })
      const slider = screen.getByRole('slider')
      slider.focus()
      expect(slider).toHaveAttribute('aria-valuenow', '150')
    })

    it.skipIf(isJSDOM)(
      'does not fail to round the value to step precision when step is very small',
      async () => {
        render(BasicSlider, { value: 0.00000002, min: 0, max: 0.0000001, step: 0.00000001 })

        const slider = screen.getByRole('slider')
        slider.focus()

        const control = screen.getByTestId('control')
        mockControlRect(control)

        expect(slider).toHaveAttribute('aria-valuenow', '2e-8')

        fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 20, clientY: 0 }])
        fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 80, clientY: 0 }])
        await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '8e-8'))
      }
    )

    it.skipIf(isJSDOM)(
      'does not fail to round the value to step precision when step is very small and negative',
      async () => {
        render(BasicSlider, { value: -0.00000002, min: -0.0000001, max: 0, step: 0.00000001 })

        const slider = screen.getByRole('slider')
        slider.focus()

        const control = screen.getByTestId('control')
        mockControlRect(control)

        expect(slider).toHaveAttribute('aria-valuenow', '-2e-8')

        fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 80, clientY: 0 }])
        fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 20, clientY: 0 }])
        await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '-8e-8'))
      }
    )
  })

  describe('min / max clamping', () => {
    it('ArrowRight does not exceed max via multiple presses', async () => {
      const user = userEvent.setup()
      render(BasicSlider, { value: 100, step: 100, max: 200 })
      const slider = screen.getByRole('slider')
      slider.focus()
      await user.keyboard('{ArrowRight}')
      expect(slider).toHaveAttribute('aria-valuenow', '200')
      await user.keyboard('{ArrowRight}')
      expect(slider).toHaveAttribute('aria-valuenow', '200')
    })

    it('ArrowLeft does not go below min via multiple presses', async () => {
      const user = userEvent.setup()
      render(BasicSlider, { value: 1, step: 1, min: 0 })
      const slider = screen.getByRole('slider')
      slider.focus()
      await user.keyboard('{ArrowLeft}')
      expect(slider).toHaveAttribute('aria-valuenow', '0')
      await user.keyboard('{ArrowLeft}')
      expect(slider).toHaveAttribute('aria-valuenow', '0')
    })
  })

  describe('onValueChange callback', () => {
    it('fires with new scalar value when thumb moves right via keyboard', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(BasicSlider, { value: 50, onValueChange: handleChange })
      const slider = screen.getByRole('slider')
      slider.focus()
      await user.keyboard('{ArrowRight}')
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0]).toEqual(51)
    })

    it('fires with new scalar value when thumb moves left via keyboard', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(BasicSlider, { value: 50, onValueChange: handleChange })
      const slider = screen.getByRole('slider')
      slider.focus()
      await user.keyboard('{ArrowLeft}')
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0]).toEqual(49)
    })

    it('fires on Home key with min value', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      render(BasicSlider, { value: 50, min: 0, onValueChange: handleChange })
      const slider = screen.getByRole('slider')
      slider.focus()
      await user.keyboard('{Home}')
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange.mock.calls[0][0]).toEqual(0)
    })

    it('fires with new value for input events', () => {
      const handleValueChange = vi.fn()
      render(BasicSlider, { value: 30, onValueChange: handleValueChange })
      const slider = screen.getByRole('slider')
      fireEvent.input(slider, { target: { value: '35' } })
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toEqual(35)
    })

    it('is not called when clicking on the thumb', () => {
      const handleValueChange = vi.fn()
      render(BasicSlider, { value: 50, onValueChange: handleValueChange })

      const control = screen.getByTestId('control')
      const thumb = screen.getByTestId('thumb')

      mockControlRect(control)

      fireEvent.pointerDown(thumb, { buttons: 1, clientX: 51 })

      expect(handleValueChange.mock.calls.length).toBe(0)
    })

    it('does not react to right clicks', () => {
      const handleValueChange = vi.fn()
      render(BasicSlider, { value: 50, onValueChange: handleValueChange })

      const control = screen.getByTestId('control')

      mockControlRect(control)

      fireEvent.pointerDown(control, { button: 2, clientX: 41 })

      expect(handleValueChange.mock.calls.length).toBe(0)
    })
  })

  describe('orientation', () => {
    it('data-orientation is "horizontal" by default', () => {
      render(BasicSlider, {})
      expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal')
      expect(screen.getByTestId('control')).toHaveAttribute('data-orientation', 'horizontal')
      expect(screen.getByTestId('value')).toHaveAttribute('data-orientation', 'horizontal')
    })
  })

  describe('format / locale', () => {
    it('format option sets aria-valuetext on single slider', () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      const formatted = new Intl.NumberFormat(undefined, format).format(50)
      render(BasicSlider, { value: 50, format })
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', formatted)
    })

    it('format option sets display value in Slider.Value', () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      const formatted = new Intl.NumberFormat(undefined, format).format(50)
      render(BasicSlider, { value: 50, format })
      expect(screen.getByTestId('value')).toHaveTextContent(formatted)
    })

    it('recomputes the thumb aria text when the format option changes', async () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      const { rerender } = render(BasicSlider, { value: 50 })

      const slider = screen.getByRole('slider')
      expect(slider).not.toHaveAttribute('aria-valuetext')

      await rerender({ value: 50, format })

      expect(slider).toHaveAttribute(
        'aria-valuetext',
        new Intl.NumberFormat(undefined, format).format(50)
      )
    })

    it('format option on range slider includes start/end range suffix in valuetext', () => {
      const format: Intl.NumberFormatOptions = { style: 'currency', currency: 'USD' }
      const f50 = new Intl.NumberFormat(undefined, format).format(50)
      const f75 = new Intl.NumberFormat(undefined, format).format(75)
      render(RangeSlider, { value: [50, 75], format })
      expect(screen.getByTestId('value')).toHaveTextContent(`${f50} – ${f75}`)
      const sliders = screen.getAllByRole('slider')
      expect(sliders[0]).toHaveAttribute('aria-valuetext', `${f50} start range`)
      expect(sliders[1]).toHaveAttribute('aria-valuetext', `${f75} end range`)
    })

    it('locale option formats number using the given locale', () => {
      const format: Intl.NumberFormatOptions = {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
      const expected = new Intl.NumberFormat('de-DE', format).format(70.51)
      render(BasicSlider, { value: 70.51, format, step: 0.01, locale: 'de-DE' })
      expect(screen.getByTestId('value')).toHaveTextContent(expected)
    })

    it('locale option formats a range value', () => {
      const format: Intl.NumberFormatOptions = {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
      const formatter = new Intl.NumberFormat('de-DE', format)
      const expected = `${formatter.format(24.8)} – ${formatter.format(70.51)}`
      render(RangeSlider, { value: [24.8, 70.51], format, step: 0.01, locale: 'de-DE' })
      expect(screen.getByTestId('value')).toHaveTextContent(expected)
    })
  })

  describe('Field integration', () => {
    it('Field.Label links to the slider input via aria-labelledby', () => {
      render(SliderInField, { value: 50 })
      expect(screen.getByRole('slider')).toHaveAttribute(
        'aria-labelledby',
        screen.getByTestId('label').id
      )
    })

    it('receives disabled prop from Field.Root', () => {
      render(SliderInField, { value: 50, disabled: true })
      expect(screen.getByRole('slider')).toBeDisabled()
      expect(screen.getByTestId('slider')).toHaveAttribute('data-disabled', '')
    })

    it('receives name prop from Field.Root', () => {
      render(SliderInField, { value: 50, name: 'volume' })
      expect(screen.getByRole('slider')).toHaveAttribute('name', 'volume')
    })

    it('[data-touched]', async () => {
      render(SliderInField, { value: 50 })
      const root = screen.getByTestId('slider')
      const input = screen.getByRole('slider')

      await fireEvent.focus(input)
      await fireEvent.blur(input)

      expect(root).toHaveAttribute('data-touched', '')
    })

    it('[data-dirty]', async () => {
      render(SliderInField, { value: 50 })
      const root = screen.getByTestId('slider')
      const input = screen.getByRole('slider')

      expect(root).not.toHaveAttribute('data-dirty')

      await fireEvent.input(input, { target: { value: '55' } })

      expect(root).toHaveAttribute('data-dirty', '')
    })

    it('[data-focused]', async () => {
      render(SliderInField, { value: 50 })
      const root = screen.getByTestId('slider')
      const input = screen.getByRole('slider')

      expect(root).not.toHaveAttribute('data-focused')

      await fireEvent.focus(input)

      expect(root).toHaveAttribute('data-focused', '')

      await fireEvent.blur(input)

      expect(root).not.toHaveAttribute('data-focused')
    })
  })

  describe('track press focus', () => {
    it('focuses the slider when pressing the control', async () => {
      render(BasicSlider, { value: 20 })

      const control = screen.getByTestId('control')
      mockControlRect(control)
      const input = screen.getByRole('slider')

      fireEvent.pointerDown(control, {
        buttons: 1,
        button: 0,
        clientX: 40,
        clientY: 0,
        pointerId: 1
      })

      await waitFor(() => expect(input).toHaveFocus())
    })

    it.skipIf(isJSDOM)(
      'does not emit extra blur and focus events when restoring focus-visible',
      async () => {
        const focusSpy = vi.fn()
        const blurSpy = vi.fn()
        render(ThumbFull, { value: 40, thumbOnfocus: focusSpy, thumbOnblur: blurSpy })

        const control = screen.getByTestId('control')
        mockControlRect(control)
        const input = screen.getByRole('slider')

        fireEvent.pointerDown(control, {
          buttons: 1,
          button: 0,
          clientX: 40,
          clientY: 0,
          pointerId: 1
        })

        await waitFor(() => expect(input).toHaveFocus())
        expect(focusSpy).toHaveBeenCalledTimes(1)
        expect(blurSpy).not.toHaveBeenCalled()

        fireEvent.keyDown(input, { key: 'ArrowRight' })

        expect(focusSpy).toHaveBeenCalledTimes(1)
        expect(blurSpy).not.toHaveBeenCalled()
      }
    )

    it.skipIf(isJSDOM)(
      'shows :focus-visible after keyboard interaction following a pointer press',
      async () => {
        render(BasicSlider, { value: 40 })

        const control = screen.getByTestId('control')
        mockControlRect(control)
        const input = screen.getByRole('slider')

        fireEvent.pointerDown(control, {
          buttons: 1,
          button: 0,
          clientX: 40,
          clientY: 0,
          pointerId: 1
        })

        await waitFor(() => expect(input).toHaveFocus())
        expect(input.matches(':focus-visible')).toBe(false)

        fireEvent.keyDown(input, { key: 'ArrowRight' })

        await waitFor(() => expect(input.matches(':focus-visible')).toBe(true))
      }
    )
  })

  describe.skipIf(isJSDOM)('touch interactions', () => {
    it('sets the value on touchstart and follows touchmove', async () => {
      render(BasicSlider, { value: 20 })

      const control = screen.getByTestId('control')
      mockControlRect(control, 1000)

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 200, clientY: 0 }])
      await waitFor(() => expect(getSliderValues()).toEqual([20]))

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 700, clientY: 0 }])
      await waitFor(() => expect(getSliderValues()).toEqual([70]))

      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 700, clientY: 0 }])
      await waitFor(() => expect(getSliderValues()).toEqual([70]))
    })

    it('ignores moves belonging to another finger', async () => {
      const onValueChange = vi.fn()
      const onValueCommitted = vi.fn()
      render(BasicSlider, { value: 0, onValueChange, onValueCommitted })

      const control = screen.getByTestId('control')
      mockControlRect(control, 1000)

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 0, clientY: 0 }])
      expect(onValueChange).toHaveBeenCalledTimes(0)
      expect(onValueCommitted).toHaveBeenCalledTimes(0)

      fireTouch(document.body, 'touchstart', [{ identifier: 2, clientX: 400, clientY: 0 }])
      expect(onValueChange).toHaveBeenCalledTimes(0)
      expect(onValueCommitted).toHaveBeenCalledTimes(0)

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 10, clientY: 0 }])
      await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1))
      expect(getSliderValues()).toEqual([1])
      expect(onValueCommitted).toHaveBeenCalledTimes(0)

      fireTouch(document.body, 'touchmove', [{ identifier: 2, clientX: 410, clientY: 0 }])
      expect(onValueChange).toHaveBeenCalledTimes(1)
      expect(getSliderValues()).toEqual([1])
      expect(onValueCommitted).toHaveBeenCalledTimes(0)

      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 20, clientY: 0 }])
      await waitFor(() => expect(onValueCommitted).toHaveBeenCalledTimes(1))
      expect(onValueChange).toHaveBeenCalledTimes(1)
    })

    it('deduplicates unchanged values across consecutive touch sessions', async () => {
      const onValueChange = vi.fn()
      render(RangeSlider, { value: [20, 30], onValueChange })

      const control = screen.getByTestId('control')
      const thumbs = screen
        .getAllByRole('slider')
        .map((input) => input.parentElement as HTMLElement)
      mockHorizontalSliderLayout(control, thumbs, 100, [10, 20])

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 20, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 21, clientY: 0 }])
      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 21, clientY: 0 }])

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 21, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 22, clientY: 0 }])
      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 22, clientY: 0 }])

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 22, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 22.1, clientY: 0 }])
      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 22.1, clientY: 0 }])

      await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(2))
      expect(onValueChange.mock.calls[0][0]).toEqual([21, 30])
      expect(onValueChange.mock.calls[1][0]).toEqual([22, 30])
    })

    it('marks dragging only once the move threshold is passed', async () => {
      render(BasicSlider, { value: 20 })

      const control = screen.getByTestId('control')
      mockControlRect(control, 1000)

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 200, clientY: 0 }])
      expect(control).not.toHaveAttribute('data-dragging')

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 300, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 400, clientY: 0 }])
      await waitFor(() => expect(getSliderValues()).toEqual([40]))
      expect(control).not.toHaveAttribute('data-dragging')

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 500, clientY: 0 }])
      await waitFor(() => expect(control).toHaveAttribute('data-dragging', ''))

      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 500, clientY: 0 }])
      await waitFor(() => expect(control).not.toHaveAttribute('data-dragging'))
    })

    it('commits the value on touchend', async () => {
      const onValueCommitted = vi.fn()
      render(BasicSlider, { value: 20, onValueCommitted })

      const control = screen.getByTestId('control')
      mockControlRect(control, 1000)

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 200, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 700, clientY: 0 }])
      expect(onValueCommitted).not.toHaveBeenCalled()

      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 700, clientY: 0 }])
      await waitFor(() => expect(onValueCommitted).toHaveBeenCalledTimes(1))
      expect(onValueCommitted).toHaveBeenCalledWith(70)
    })

    it('does not respond to touches while disabled', async () => {
      render(BasicSlider, { value: 20, disabled: true })

      const control = screen.getByTestId('control')
      mockControlRect(control, 1000)

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 700, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 700, clientY: 0 }])

      await waitFor(() => expect(getSliderValues()).toEqual([20]))
    })

    it('prevents thumbs from passing each other when set to "none"', async () => {
      render(RangeSlider, { value: [20, 40], thumbCollisionBehavior: 'none' })

      const control = screen.getByTestId('control')
      const thumbs = screen
        .getAllByRole('slider')
        .map((input) => input.parentElement as HTMLElement)
      mockHorizontalSliderLayout(control, thumbs, 1000, [190, 390])

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 200, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 600, clientY: 0 }])
      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 600, clientY: 0 }])

      await waitFor(() => expect(getSliderValues()).toEqual([40, 40]))
    })

    it('pushes adjacent thumbs forward when set to "push"', async () => {
      render(RangeSlider, { value: [20, 40], thumbCollisionBehavior: 'push' })

      const control = screen.getByTestId('control')
      const thumbs = screen
        .getAllByRole('slider')
        .map((input) => input.parentElement as HTMLElement)
      mockHorizontalSliderLayout(control, thumbs, 1000, [190, 390])

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 200, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 650, clientY: 0 }])
      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 650, clientY: 0 }])

      await waitFor(() => expect(getSliderValues()).toEqual([65, 65]))
    })

    it('allows thumbs to swap when set to "swap"', async () => {
      render(RangeSlider, { value: [20, 40], thumbCollisionBehavior: 'swap' })

      const control = screen.getByTestId('control')
      const thumbs = screen
        .getAllByRole('slider')
        .map((input) => input.parentElement as HTMLElement)
      mockHorizontalSliderLayout(control, thumbs, 1000, [190, 390])

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 200, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 700, clientY: 0 }])
      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 700, clientY: 0 }])

      await waitFor(() => expect(getSliderValues()).toEqual([40, 70]))
    })

    it('maintains minimum steps between values when swapping', async () => {
      render(MultiThumbSlider, {
        value: [20, 40, 60],
        minStepsBetweenValues: 10,
        thumbCollisionBehavior: 'swap'
      })

      const control = screen.getByTestId('control')
      const thumbs = screen
        .getAllByRole('slider')
        .map((input) => input.parentElement as HTMLElement)
      mockHorizontalSliderLayout(control, thumbs, 1000, [190, 390, 590])

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 200, clientY: 0 }])
      fireTouch(control, 'touchmove', [{ identifier: 1, clientX: 500, clientY: 0 }])
      fireTouch(control, 'touchmove', [{ identifier: 1, clientX: 550, clientY: 0 }])
      fireTouch(control, 'touchmove', [{ identifier: 1, clientX: 800, clientY: 0 }])
      fireTouch(control, 'touchend', [{ identifier: 1, clientX: 800, clientY: 0 }])

      await waitFor(() => expect(getSliderValues()).toEqual([30, 50, 80]))
    })
  })

  describe('prop: disabled', () => {
    it('renders data-disabled on all subcomponents', () => {
      render(ThumbFull, { value: 30, disabled: true })
      const parts = ['root', 'value', 'control', 'track', 'indicator', 'thumb']
      for (const part of parts) {
        expect(screen.getByTestId(part)).toHaveAttribute('data-disabled', '')
      }
    })

    it.skipIf(!isJSDOM)('explicitly blurs the focused thumb when disabled', async () => {
      const { rerender } = render(BasicSlider, { value: 30 })
      const input = screen.getByRole('slider')

      input.focus()
      expect(input).toHaveFocus()

      const blurSpy = vi.spyOn(input, 'blur')
      await rerender({ value: 30, disabled: true })

      expect(blurSpy).toHaveBeenCalled()
    })

    it('does not drag a thumb disabled via the `disabled` prop', () => {
      const handleValueChange = vi.fn()
      render(DisabledRange, { value: [20, 80], onValueChange: handleValueChange })

      const control = screen.getByTestId('control')
      mockControlRect(control)

      const disabledInput = within(screen.getByTestId('thumb-1')).getByRole('slider')
      expect(disabledInput).toBeDisabled()

      fireEvent.pointerDown(screen.getByTestId('thumb-1'), { buttons: 1, clientX: 80 })
      fireEvent.pointerMove(document.body, { buttons: 1, clientX: 40 })
      fireEvent.pointerUp(document.body, { buttons: 1, clientX: 40 })

      expect(handleValueChange).not.toHaveBeenCalled()
      expect(disabledInput).toHaveAttribute('aria-valuenow', '80')
    })

    it('does not change a single disabled thumb when pressing the track', () => {
      const handleValueChange = vi.fn()
      render(DisabledSingle, { value: 20, onValueChange: handleValueChange })

      const control = screen.getByTestId('control')
      mockControlRect(control)

      const input = screen.getByRole('slider')
      expect(input).toBeDisabled()

      fireEvent.pointerDown(control, { buttons: 1, clientX: 80 })
      fireEvent.pointerUp(control, { buttons: 1, clientX: 80 })

      expect(handleValueChange).not.toHaveBeenCalled()
      expect(input).toHaveAttribute('aria-valuenow', '20')
    })
  })

  describe('prop: minStepsBetweenValues', () => {
    it('enforces the minimum on the second thumb and when decrementing', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      render(RangeSlider, {
        value: [44, 50],
        step: 2,
        minStepsBetweenValues: 2,
        onValueChange: handleValueChange
      })

      const sliders = screen.getAllByRole('slider')
      sliders[0].focus()
      await user.keyboard('{ArrowUp}')
      expect(handleValueChange).toHaveBeenCalledTimes(1)
      expect(handleValueChange.mock.calls[0][0]).toEqual([46, 50])
      await user.keyboard('{ArrowUp}')
      expect(handleValueChange).toHaveBeenCalledTimes(1)

      sliders[1].focus()
      await user.keyboard('{ArrowUp}')
      expect(handleValueChange).toHaveBeenCalledTimes(2)
      expect(handleValueChange.mock.calls[1][0]).toEqual([46, 52])
      await user.keyboard('{ArrowDown}')
      await user.keyboard('{ArrowDown}')
      expect(handleValueChange).toHaveBeenCalledTimes(3)
      expect(handleValueChange.mock.calls[2][0]).toEqual([46, 50])
    })
  })

  describe('prop: onValueCommitted', () => {
    it('single value', () => {
      const handleValueCommitted = vi.fn()
      render(BasicSlider, { value: 0, onValueCommitted: handleValueCommitted })

      const control = screen.getByTestId('control')
      mockControlRect(control)
      const slider = screen.getByRole('slider')

      fireEvent.pointerDown(control, { buttons: 1, clientX: 10 })
      fireEvent.pointerUp(control, { buttons: 1, clientX: 10 })

      expect(handleValueCommitted).toHaveBeenCalledTimes(1)
      expect(handleValueCommitted.mock.calls[0][0]).toBe(10)

      slider.focus()
      fireEvent.input(slider, { target: { value: '23' } })
      expect(handleValueCommitted).toHaveBeenCalledTimes(2)
    })

    it.skipIf(isJSDOM)('array value', async () => {
      const handleValueCommitted = vi.fn()
      render(RangeSlider, { value: [10, 20], onValueCommitted: handleValueCommitted })

      const control = screen.getByTestId('control')
      mockControlRect(control)

      const [thumb1, thumb2] = screen.getAllByRole('slider')

      fireEvent.pointerDown(thumb2, { buttons: 1, clientX: 20 })
      fireEvent.pointerMove(thumb2, { buttons: 1, clientX: 30 })

      expect(handleValueCommitted).not.toHaveBeenCalled()

      fireEvent.pointerUp(thumb2, { buttons: 1, clientX: 30 })

      await waitFor(() => expect(handleValueCommitted).toHaveBeenCalledTimes(1))

      thumb1.focus()
      fireEvent.input(thumb1, { target: { value: '23' } })
      expect(handleValueCommitted).toHaveBeenCalledTimes(2)
    })

    it.skipIf(isJSDOM)('does not commit when thumb press leaves the value unchanged', () => {
      const handleValueChange = vi.fn()
      const handleValueCommitted = vi.fn()
      render(BasicSlider, {
        value: 50,
        onValueChange: handleValueChange,
        onValueCommitted: handleValueCommitted
      })

      const control = screen.getByTestId('control')
      const thumb = screen.getByTestId('thumb')

      mockControlRect(control)
      vi.spyOn(thumb, 'getBoundingClientRect').mockImplementation(() => new DOMRect(50, 0, 0, 0))

      fireEvent.pointerDown(thumb, { buttons: 1, clientX: 50 })
      fireEvent.pointerUp(document.body, { buttons: 1, clientX: 50 })

      expect(handleValueChange).not.toHaveBeenCalled()
      expect(handleValueCommitted).not.toHaveBeenCalled()
      expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '50')
    })

    it('does not commit when keyboard leaves a single value unchanged', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      const handleValueCommitted = vi.fn()
      render(BasicSlider, {
        value: 100,
        max: 100,
        onValueChange: handleValueChange,
        onValueCommitted: handleValueCommitted
      })

      const slider = screen.getByRole('slider')
      slider.focus()
      await user.keyboard('{ArrowRight}')

      expect(handleValueChange).not.toHaveBeenCalled()
      expect(handleValueCommitted).not.toHaveBeenCalled()
      expect(slider).toHaveAttribute('aria-valuenow', '100')
    })

    it('does not commit when keyboard leaves a range value unchanged', async () => {
      const user = userEvent.setup()
      const handleValueChange = vi.fn()
      const handleValueCommitted = vi.fn()
      render(RangeSlider, {
        value: [50, 50],
        onValueChange: handleValueChange,
        onValueCommitted: handleValueCommitted
      })

      const [slider1, slider2] = screen.getAllByRole('slider')
      slider1.focus()
      await user.keyboard('{ArrowRight}')

      expect(handleValueChange).not.toHaveBeenCalled()
      expect(handleValueCommitted).not.toHaveBeenCalled()
      expect(slider1).toHaveAttribute('aria-valuenow', '50')
      expect(slider2).toHaveAttribute('aria-valuenow', '50')
    })
  })

  describe('event target', () => {
    it.skipIf(isJSDOM)('does not override the event.target on touch events', () => {
      const handleValueChange = vi.fn()
      const handleNativeEvent = vi.fn()
      const handleEvent = vi.fn()

      render(EventTargetSlider, {
        value: 0,
        onValueChange: handleValueChange,
        ontouchstart: handleEvent
      })
      document.addEventListener('touchstart', handleNativeEvent)

      const control = screen.getByTestId('control')
      mockControlRect(control)

      try {
        fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 0, clientY: 0 }])

        expect(handleValueChange).not.toHaveBeenCalled()
        expect(handleNativeEvent).toHaveBeenCalledTimes(1)
        expect(handleNativeEvent.mock.calls[0][0]).toHaveProperty('target', control)
        expect(handleEvent).toHaveBeenCalledTimes(1)
        expect(handleEvent.mock.calls[0][0]).toHaveProperty('target', control)
      } finally {
        document.removeEventListener('touchstart', handleNativeEvent)
      }
    })

    it('does not override the event.target on mouse events', () => {
      const handleValueChange = vi.fn()
      const handleNativeEvent = vi.fn()
      const handleEvent = vi.fn()

      render(EventTargetSlider, {
        value: 0,
        onValueChange: handleValueChange,
        onmousedown: handleEvent
      })
      document.addEventListener('mousedown', handleNativeEvent)

      const control = screen.getByTestId('control')
      mockControlRect(control)

      try {
        fireEvent.mouseDown(control)

        expect(handleValueChange).not.toHaveBeenCalled()
        expect(handleNativeEvent).toHaveBeenCalledTimes(1)
        expect(handleNativeEvent.mock.calls[0][0]).toHaveProperty('target', control)
        expect(handleEvent).toHaveBeenCalledTimes(1)
        expect(handleEvent.mock.calls[0][0]).toHaveProperty('target', control)
      } finally {
        document.removeEventListener('mousedown', handleNativeEvent)
      }
    })
  })

  describe('pointer / focus behaviors', () => {
    it('focuses the slider when dragging', async () => {
      render(BasicSlider, { value: 30, step: 10 })
      const slider = screen.getByRole('slider')
      const thumb = screen.getByTestId('thumb')
      const control = screen.getByTestId('control')
      mockControlRect(control)

      fireEvent.pointerDown(thumb, { buttons: 1, clientX: 1 })

      await waitFor(() => {
        expect(slider).toHaveFocus()
      })
    })
  })

  describe('keyboard interactions', () => {
    const combos = [
      ['ltr', 'horizontal', ['ArrowLeft', 'ArrowDown'], ['ArrowRight', 'ArrowUp']],
      ['ltr', 'vertical', ['ArrowLeft', 'ArrowDown'], ['ArrowRight', 'ArrowUp']],
      ['rtl', 'horizontal', ['ArrowRight', 'ArrowDown'], ['ArrowLeft', 'ArrowUp']],
      ['rtl', 'vertical', ['ArrowRight', 'ArrowDown'], ['ArrowLeft', 'ArrowUp']]
    ] as const

    combos.forEach(([direction, orientation, decrementKeys, incrementKeys]) => {
      describe(direction, () => {
        describe(`orientation: ${orientation}`, () => {
          decrementKeys.forEach((key) => {
            it(`key: ${key} decrements the value`, async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard(`{${key}}`)
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(19)
              expect(input).toHaveAttribute('aria-valuenow', '19')
            })

            it(`key: ${key} decrements the value by largeStep when Shift is pressed`, async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                largeStep: 10,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard(`{Shift>}{${key}}{/Shift}`)
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(10)
              expect(input).toHaveAttribute('aria-valuenow', '10')
            })

            it(`key: ${key} stops at min when decrementing while Shift is pressed`, async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                largeStep: 10,
                min: 15,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard(`{Shift>}{${key}}{/Shift}`)
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(15)
              expect(input).toHaveAttribute('aria-valuenow', '15')
            })
          })

          incrementKeys.forEach((key) => {
            it(`key: ${key} increments the value`, async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard(`{${key}}`)
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(21)
              expect(input).toHaveAttribute('aria-valuenow', '21')
            })

            it(`key: ${key} rounds fractional values to the configured step`, async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 0.2,
                min: 0,
                max: 1,
                step: 0.1,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard(`{${key}}`)
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(0.3)
              expect(input).toHaveAttribute('aria-valuenow', '0.3')
            })

            it(`key: ${key} increments the value by largeStep when Shift is pressed`, async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                largeStep: 10,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard(`{Shift>}{${key}}{/Shift}`)
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(30)
              expect(input).toHaveAttribute('aria-valuenow', '30')
            })

            it(`key: ${key} stops at max when incrementing while Shift is pressed`, async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                largeStep: 10,
                max: 21,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard(`{Shift>}{${key}}{/Shift}`)
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(21)
              expect(input).toHaveAttribute('aria-valuenow', '21')
            })
          })

          describe('key: End', () => {
            it('sets value to max in a single value slider', async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                max: 77,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard('{End}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(77)
              expect(input).toHaveAttribute('aria-valuenow', '77')
            })

            it('sets value to the maximum possible value in a range slider', async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                value: [20, 50],
                max: 77,
                onValueChange: handleValueChange
              })

              const [input1, input2] = screen.getAllByRole('slider')

              await user.keyboard('{Tab}')
              expect(input1).toHaveFocus()

              await user.keyboard('{End}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual([50, 50])
              await user.keyboard('{End}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)

              await user.keyboard('{Tab}')
              expect(input2).toHaveFocus()

              await user.keyboard('{End}')
              expect(handleValueChange).toHaveBeenCalledTimes(2)
              expect(handleValueChange.mock.calls[1][0]).toEqual([50, 77])
            })
          })

          describe('key: Home', () => {
            it('sets value to min in a single value slider', async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                min: 17,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard('{Home}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(17)
              expect(input).toHaveAttribute('aria-valuenow', '17')
            })

            it('sets value to the minimum possible value in a range slider', async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                value: [20, 50],
                min: 7,
                onValueChange: handleValueChange
              })

              const [input1, input2] = screen.getAllByRole('slider')

              await user.keyboard('{Tab}')
              await user.keyboard('{Tab}')
              expect(input2).toHaveFocus()

              await user.keyboard('{Home}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual([20, 20])
              await user.keyboard('{Home}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)

              await user.keyboard('{Shift>}{Tab}{/Shift}')
              expect(input1).toHaveFocus()

              await user.keyboard('{Home}')
              expect(handleValueChange).toHaveBeenCalledTimes(2)
              expect(handleValueChange.mock.calls[1][0]).toEqual([7, 20])
            })
          })

          describe('key: PageUp', () => {
            it('increments the value by largeStep', async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                largeStep: 5,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard('{PageUp}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(25)
              expect(input).toHaveAttribute('aria-valuenow', '25')
            })

            it('preserves largeStep increments when step uses a different grid', async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                step: 2,
                largeStep: 5,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard('{PageUp}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(25)
              expect(input).toHaveAttribute('aria-valuenow', '25')
            })

            it('does not exceed max', async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                largeStep: 5,
                max: 21,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard('{PageUp}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(21)
              expect(input).toHaveAttribute('aria-valuenow', '21')
            })
          })

          describe('key: PageDown', () => {
            it('decrements the value by largeStep', async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                largeStep: 5,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard('{PageDown}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(15)
              expect(input).toHaveAttribute('aria-valuenow', '15')
            })

            it('does not go below min', async () => {
              const user = userEvent.setup()
              const handleValueChange = vi.fn()
              render(Directional, {
                direction,
                orientation,
                value: 20,
                largeStep: 5,
                min: 17,
                onValueChange: handleValueChange
              })

              const input = screen.getByRole('slider')

              await user.keyboard('{Tab}')
              expect(input).toHaveFocus()

              await user.keyboard('{PageDown}')
              expect(handleValueChange).toHaveBeenCalledTimes(1)
              expect(handleValueChange.mock.calls[0][0]).toEqual(17)
              expect(input).toHaveAttribute('aria-valuenow', '17')
            })
          })
        })
      })

      it('keypresses should correct invalid values', async () => {
        const user = userEvent.setup()
        render(BasicSlider, { value: 5.4698, min: 0, max: 10, step: 1 })

        const input = screen.getByRole('slider')

        expect(input).toHaveAttribute('aria-valuenow', '5.4698')
        await user.keyboard('{Tab}')
        expect(input).toHaveFocus()
        await user.keyboard('{ArrowRight}')
        expect(input).toHaveAttribute('aria-valuenow', '6')
      })
    })
  })

  describe('Form', () => {
    it('clears external errors on change', async () => {
      const user = userEvent.setup()
      render(SliderForm, { errors: { test: 'test' }, value: 50 })

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('error')).toHaveTextContent('test')

      await user.keyboard('{Tab}')
      expect(slider).toHaveFocus()

      await user.keyboard('{Shift>}{ArrowRight}{/Shift}')

      expect(slider).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByTestId('error')).toBe(null)
    })

    it.skipIf(isJSDOM)('includes the slider value on submit', async () => {
      const onSubmit = vi.fn()
      render(FormSubmission, { value: 25, onSubmit })

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      expect(onSubmit.mock.calls[0][0].get('slider')).toBe('25')
    })

    it.skipIf(isJSDOM)('includes the range slider value on submit', async () => {
      const onSubmit = vi.fn()
      render(FormSubmission, { value: [25, 50], onSubmit })

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
      expect(onSubmit.mock.calls[0][0].getAll('slider')).toEqual(['25', '50'])
    })

    it('submits clamped range slider values', async () => {
      const onFormSubmit = vi.fn()
      render(FormValuesSlider, { value: [19, 41], min: 20, max: 40, onFormSubmit })

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => expect(onFormSubmit).toHaveBeenCalledTimes(1))
      expect(onFormSubmit.mock.calls[0][0]).toEqual({ slider: [20, 40] })
    })

    it('submits a clamped single-thumb slider value', async () => {
      const onFormSubmit = vi.fn()
      render(FormValuesSlider, { value: 5, min: 20, max: 40, onFormSubmit })

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => expect(onFormSubmit).toHaveBeenCalledTimes(1))
      expect(onFormSubmit.mock.calls[0][0]).toEqual({ slider: 20 })
    })

    it.skipIf(isJSDOM)('submits to an external form when `form` is provided', async () => {
      const onNativeSubmit = vi.fn()
      render(ExternalFormSlider, { value: 25, onNativeSubmit })

      await fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

      await waitFor(() => expect(onNativeSubmit).toHaveBeenCalledTimes(1))
      expect(onNativeSubmit.mock.calls[0][0].get('slider')).toBe('25')
    })
  })

  describe('Field validate', () => {
    it('validationMode=onSubmit with data-invalid/data-valid', async () => {
      render(SliderFieldForm, {
        validate: (val: unknown) => (Number(val) > 90 ? 'error' : null),
        value: 99
      })

      const root = screen.getByTestId('root')
      const thumb = screen.getByTestId('thumb')
      const input = screen.getByRole('slider')
      expect(input).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByTestId('error')).toBe(null)

      fireEvent.input(input, { target: { value: '98' } })
      expect(input).not.toHaveAttribute('aria-invalid')
      expect(screen.queryByTestId('error')).toBe(null)

      fireEvent.click(screen.getByText('submit'))
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      expect(screen.queryByTestId('error')).not.toBe(null)
      expect(root).toHaveAttribute('data-invalid')
      expect(thumb).toHaveAttribute('data-invalid')

      fireEvent.input(input, { target: { value: '10' } })
      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-invalid')
      })
      expect(screen.queryByTestId('error')).toBe(null)
      expect(root).not.toHaveAttribute('data-invalid')
      expect(input).not.toHaveAttribute('data-invalid')
      expect(root).toHaveAttribute('data-valid')
      expect(thumb).toHaveAttribute('data-valid')

      fireEvent.input(input, { target: { value: '94' } })
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })

      fireEvent.input(input, { target: { value: '12' } })
      await waitFor(() => {
        expect(input).not.toHaveAttribute('aria-invalid')
      })
    })

    it('moves focus to the range input on invalid submit', async () => {
      render(SliderFieldForm, { validate: () => 'error', value: 50 })

      const input = screen.getByRole('slider')
      expect(input).not.toHaveFocus()

      fireEvent.click(screen.getByText('submit'))

      await waitFor(() => {
        expect(input).toHaveFocus()
      })
    })

    it('validationMode=onBlur', async () => {
      render(SliderField, {
        validationMode: 'onBlur',
        validate: (value: unknown) => (Number(value) > 1 ? 'error' : null),
        value: 0
      })

      const input = screen.getByRole('slider')
      expect(input).not.toHaveAttribute('aria-invalid')

      await fireEvent.input(input, { target: { value: '2' } })
      expect(input).not.toHaveAttribute('aria-invalid')
      fireEvent.blur(input)
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('validationMode=onChange', async () => {
      render(SliderField, {
        validationMode: 'onChange',
        validate: (value: unknown) => (Number(value) === 1 ? 'error' : null),
        value: 0
      })

      const input = screen.getByRole('slider')
      expect(input).not.toHaveAttribute('aria-invalid')

      fireEvent.input(input, { target: { value: '1' } })
      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('validates once when changed by the user (scalar)', async () => {
      const user = userEvent.setup()
      const validate = vi.fn()
      render(SliderField, { validationMode: 'onChange', validate, value: 0 })

      await user.keyboard('{Tab}')
      expect(screen.getByRole('slider')).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      await waitFor(() => {
        expect(validate).toHaveBeenCalledTimes(1)
      })
      expect(validate.mock.lastCall?.[0]).toBe(1)
    })

    it('validates once with an array value for range sliders', async () => {
      const user = userEvent.setup()
      const validate = vi.fn()
      render(SliderField, { validationMode: 'onChange', validate, range: true, value: [0, 5] })

      await user.keyboard('{Tab}')
      expect(screen.getAllByRole('slider')[0]).toHaveFocus()

      await user.keyboard('{ArrowRight}')
      await waitFor(() => {
        expect(validate).toHaveBeenCalledTimes(1)
      })
      expect(validate.mock.lastCall?.[0]).toEqual([1, 5])
    })

    it('revalidates when the controlled value changes externally', async () => {
      const validate = vi.fn((value: unknown) => (Number(value) === 5 ? 'error' : null))
      render(SliderFieldControlled, { validate })

      const slider = screen.getByRole('slider')
      const toggle = screen.getByText('Set externally')
      expect(slider).not.toHaveAttribute('aria-invalid')
      const initialCallCount = validate.mock.calls.length

      fireEvent.click(toggle)
      await waitFor(() => {
        expect(validate.mock.calls.length).toBe(initialCallCount + 1)
      })
      expect(validate.mock.lastCall?.[0]).toBe(5)
      await waitFor(() => {
        expect(slider).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('receives an array value on submit for range sliders', () => {
      const validate = vi.fn()
      render(SliderFieldForm, { validate, range: true, value: [5, 12] })

      fireEvent.click(screen.getByText('submit'))
      expect(validate).toHaveBeenCalledTimes(1)
      expect(validate.mock.calls[0][0]).toEqual([5, 12])
    })

    it('does not call validate on change when validationMode is omitted', () => {
      const validate = vi.fn()
      render(SliderFieldForm, { validate, value: 50 })

      expect(validate).not.toHaveBeenCalled()

      const control = screen.getByTestId('control')
      mockControlRect(control)
      fireEvent.pointerDown(control, { buttons: 1, clientX: 10 })
      fireEvent.pointerUp(control, { buttons: 1, clientX: 30 })

      expect(validate).not.toHaveBeenCalled()
    })
  })

  describe('Field.Description', () => {
    it('merges an external aria-describedby with the field description id', () => {
      render(SliderDescribedBy, {})
      expect(screen.getByTestId('slider')).toHaveAttribute(
        'aria-describedby',
        `external-description ${screen.getByTestId('description').id}`
      )
    })
  })

  describe.skipIf(isJSDOM)('prop: thumbAlignment', () => {
    const CONTROL_SIZE = 200
    const THUMB_SIZE = 16
    const TRAVEL = CONTROL_SIZE - THUMB_SIZE

    function indicatorRect() {
      return screen.getByTestId('indicator').getBoundingClientRect()
    }

    function controlRect() {
      return screen.getByTestId('control').getBoundingClientRect()
    }

    it('single thumb', async () => {
      render(ThumbAlignment, { thumbAlignment: 'edge', value: 100 })
      await waitFor(() => expect(indicatorRect().width).toBeCloseTo(THUMB_SIZE / 2 + TRAVEL, 0))
    })

    it('multiple thumbs', async () => {
      render(ThumbAlignment, { thumbAlignment: 'edge', value: [0, 100] })

      await waitFor(() => expect(indicatorRect().width).toBeCloseTo(TRAVEL, 0))
      expect(indicatorRect().left - controlRect().left).toBeCloseTo(THUMB_SIZE / 2, 0)
    })

    it('recomputes range indicator inset positions when the slider becomes visible', async () => {
      const { rerender } = render(ThumbAlignment, {
        thumbAlignment: 'edge',
        value: [30, 70],
        controlSize: 100,
        thumbSize: 10,
        hidden: true
      })

      const indicator = screen.getByTestId('indicator')
      await waitFor(() => {
        expect(indicator.style.visibility).toBe('hidden')
        expect(indicator.style.getPropertyValue('--start-position')).toBe('0%')
      })

      await rerender({
        thumbAlignment: 'edge',
        value: [30, 70],
        controlSize: 100,
        thumbSize: 10,
        hidden: false
      })

      await waitFor(() => {
        expect(indicator.style.getPropertyValue('--relative-size')).toBe('36%')
      })
      expect(indicator.style.getPropertyValue('--start-position')).toBe('32%')
      expect(indicator.style.visibility).toBe('')
    })
  })

  describe.skipIf(isJSDOM)('pointer drag sessions', () => {
    it('fires onValueChange when pressing the control', async () => {
      const onValueChange = vi.fn()
      render(BasicSlider, { value: 50, onValueChange })

      mockControlRect(screen.getByTestId('control'))

      fireEvent.pointerDown(screen.getByTestId('control'), {
        buttons: 1,
        clientX: 41,
        clientY: 0,
        pointerId: 1
      })

      await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1))
      expect(onValueChange).toHaveBeenLastCalledWith(41)
      fireEvent.pointerUp(document, { buttons: 0, clientX: 41, clientY: 0, pointerId: 1 })
    })

    it('fires onValueChange only when the value changes', async () => {
      const onValueChange = vi.fn()
      render(BasicSlider, { value: 20, onValueChange })

      const control = screen.getByTestId('control')
      mockControlRect(control)

      fireEvent.pointerDown(control, { buttons: 1, clientX: 21, clientY: 0, pointerId: 1 })
      fireEvent.pointerMove(document, { buttons: 1, clientX: 22, clientY: 0, pointerId: 1 })
      fireEvent.pointerMove(document, { buttons: 1, clientX: 22, clientY: 0, pointerId: 1 })

      await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(2))
      expect(onValueChange).toHaveBeenNthCalledWith(1, 21)
      expect(onValueChange).toHaveBeenNthCalledWith(2, 22)
      fireEvent.pointerUp(document, { buttons: 0, clientX: 22, clientY: 0, pointerId: 1 })
    })

    it('hedges against a dropped pointerup by ending the drag on a button-less move', async () => {
      const onValueChange = vi.fn()
      render(BasicSlider, { value: 0, onValueChange })

      const control = screen.getByTestId('control')
      mockControlRect(control)

      fireEvent.pointerDown(control, { buttons: 1, clientX: 1, clientY: 0, pointerId: 1 })
      await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1))

      fireEvent.pointerMove(document, { buttons: 1, clientX: 10, clientY: 0, pointerId: 1 })
      await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(2))
      expect(onValueChange).toHaveBeenLastCalledWith(10)

      fireEvent.pointerMove(document, { buttons: 0, clientX: 11, clientY: 0, pointerId: 1 })
      fireEvent.pointerMove(document, { buttons: 1, clientX: 30, clientY: 0, pointerId: 1 })

      expect(onValueChange).toHaveBeenCalledTimes(2)
    })

    it('commits the latest changed value when pointerup lands somewhere else', async () => {
      const onValueChange = vi.fn()
      const onValueCommitted = vi.fn()
      render(BasicSlider, { value: 0, onValueChange, onValueCommitted })

      const control = screen.getByTestId('control')
      mockControlRect(control)

      fireEvent.pointerDown(control, { buttons: 1, clientX: 10, clientY: 0, pointerId: 1 })
      fireEvent.pointerMove(document, { buttons: 1, clientX: 15, clientY: 0, pointerId: 1 })
      fireEvent.pointerUp(document, { buttons: 0, clientX: 20, clientY: 0, pointerId: 1 })

      await waitFor(() => expect(onValueCommitted).toHaveBeenCalledTimes(1))
      expect(onValueChange).toHaveBeenNthCalledWith(1, 10)
      expect(onValueChange).toHaveBeenNthCalledWith(2, 15)
      expect(onValueCommitted).toHaveBeenCalledWith(15)
    })

    it('drags the intended thumb when 3 thumbs are present', async () => {
      render(MultiThumbSlider, { value: [10, 40, 60] })

      const control = screen.getByTestId('control')
      const thumbs = screen
        .getAllByRole('slider')
        .map((input) => input.parentElement as HTMLElement)
      mockHorizontalSliderLayout(control, thumbs, 1000, [90, 390, 590])

      fireEvent.pointerDown(thumbs[2], { buttons: 1, clientX: 600, clientY: 0, pointerId: 1 })
      fireEvent.pointerMove(document, { buttons: 1, clientX: 800, clientY: 0, pointerId: 1 })
      fireEvent.pointerUp(document, { buttons: 0, clientX: 800, clientY: 0, pointerId: 1 })

      await waitFor(() => expect(getSliderValues()).toEqual([10, 40, 80]))
    })

    it.each(['thumb drag', 'track press'])(
      'keeps focus and the active index on the logical thumb after a swap from a %s',
      async (interaction) => {
        const onValueChange = vi.fn()
        const onValueCommitted = vi.fn()
        render(RangeSlider, {
          value: [20, 40],
          thumbCollisionBehavior: 'swap',
          onValueChange,
          onValueCommitted
        })

        const control = screen.getByTestId('control')
        const thumbs = screen.getAllByTestId('thumb')
        const inputs = screen.getAllByRole('slider')
        mockHorizontalSliderLayout(control, thumbs, 100, [10, 30])

        fireEvent.pointerDown(interaction === 'thumb drag' ? thumbs[0] : control, {
          buttons: 1,
          clientX: 20,
          clientY: 0,
          pointerId: 1
        })
        fireEvent.pointerMove(document, { buttons: 1, clientX: 70, clientY: 0, pointerId: 1 })

        expect(inputs[1]).toHaveFocus()
        expect(onValueChange).toHaveBeenLastCalledWith([40, 70])

        fireEvent.pointerUp(document, { buttons: 0, clientX: 70, clientY: 0, pointerId: 1 })

        await waitFor(() => expect(onValueCommitted).toHaveBeenCalledWith([40, 70]))
      }
    )

    const unsortedValues: [string, number[]][] = [
      ['range', [2, 1]],
      ['readonly range', Object.freeze([2, 1]) as number[]]
    ]

    unsortedValues.forEach(([label, value]) => {
      it(`sorts an unsorted ${label} value on track press`, async () => {
        const onValueChange = vi.fn()
        render(RangeSlider, { value, min: 0, max: 5, onValueChange })

        const control = screen.getByTestId('control')
        const thumbs = screen
          .getAllByRole('slider')
          .map((input) => input.parentElement as HTMLElement)
        mockHorizontalSliderLayout(control, thumbs, 100, [10, 30])

        fireEvent.pointerDown(control, { buttons: 1, clientX: 41, clientY: 0, pointerId: 1 })

        await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1))
        expect(onValueChange.mock.calls[0][0]).not.toBe(value)
        expect(onValueChange.mock.calls[0][0]).toEqual([1, 2])
        fireEvent.pointerUp(document, { buttons: 0, clientX: 41, clientY: 0, pointerId: 1 })
      })
    })
  })

  describe('disabled thumbs', () => {
    it.skipIf(isJSDOM)(
      'does not select a disabled thumb when pressing the track next to it',
      async () => {
        const onValueChange = vi.fn()
        render(DisabledRange, {
          value: [20, 80],
          thumbCollisionBehavior: 'none',
          onValueChange
        })

        const control = screen.getByTestId('control')
        const thumbs = [screen.getByTestId('thumb-0'), screen.getByTestId('thumb-1')]
        mockHorizontalSliderLayout(control, thumbs, 1000, [190, 790])

        fireEvent.pointerDown(control, { buttons: 1, clientX: 950, clientY: 0, pointerId: 1 })
        fireEvent.pointerUp(document, { buttons: 0, clientX: 950, clientY: 0, pointerId: 1 })

        await waitFor(() => expect(onValueChange).toHaveBeenCalledTimes(1))
        expect(within(thumbs[1]).getByRole('slider')).toHaveAttribute('aria-valuenow', '80')
      }
    )

    it.skipIf(isJSDOM)('does not drag a disabled thumb with touch events', async () => {
      const onValueChange = vi.fn()
      render(DisabledRange, { value: [20, 80], onValueChange })

      const control = screen.getByTestId('control')
      const thumbs = [screen.getByTestId('thumb-0'), screen.getByTestId('thumb-1')]
      mockHorizontalSliderLayout(control, thumbs, 100, [19, 79])

      fireTouch(thumbs[1], 'touchstart', [{ identifier: 1, clientX: 80, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 40, clientY: 0 }])
      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 40, clientY: 0 }])

      await waitFor(() => expect(getSliderValues()).toEqual([20, 80]))
      expect(onValueChange).not.toHaveBeenCalled()
    })

    // jsdom's `blur()` is a no-op on a disabled element (jsdom#3029), so the thumb keeps focus there.
    it.skipIf(isJSDOM)(
      'stops an in-flight drag and drops focus when the slider becomes disabled',
      async () => {
        const { rerender } = render(BasicSlider, { value: 50 })

        const control = screen.getByTestId('control')
        mockControlRect(control)
        const input = screen.getByRole('slider')

        fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 21, clientY: 0 }])

        await waitFor(() => expect(input).toHaveAttribute('aria-valuenow', '21'))
        expect(input).toHaveFocus()

        await rerender({ value: 21, disabled: true })

        await waitFor(() => expect(input).not.toHaveFocus())

        fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 30, clientY: 0 }])

        await waitFor(() => expect(input).toHaveAttribute('aria-valuenow', '21'))
      }
    )
  })

  describe.skipIf(isJSDOM)('touch geometry', () => {
    it('focuses the slider when touching the control', async () => {
      render(BasicSlider, { value: 30 })

      const control = screen.getByTestId('control')
      mockControlRect(control)

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 0, clientY: 0 }])

      await waitFor(() => expect(screen.getByRole('slider')).toHaveFocus())
      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 0, clientY: 0 }])
    })

    it('removes the document touchend listener after a touch interaction', () => {
      render(BasicSlider, { value: 0 })

      const control = screen.getByTestId('control')
      mockControlRect(control)

      const addedListeners: EventListenerOrEventListenerObject[] = []
      const removedListeners: EventListenerOrEventListenerObject[] = []
      const originalAdd = document.addEventListener.bind(document)
      const originalRemove = document.removeEventListener.bind(document)
      const addEventListenerSpy = vi
        .spyOn(document, 'addEventListener')
        .mockImplementation((type, listener, options) => {
          if (type === 'touchend' && listener != null) {
            addedListeners.push(listener)
          }
          return originalAdd(type, listener, options)
        })
      const removeEventListenerSpy = vi
        .spyOn(document, 'removeEventListener')
        .mockImplementation((type, listener, options) => {
          if (type === 'touchend' && listener != null) {
            removedListeners.push(listener)
          }
          return originalRemove(type, listener, options)
        })

      try {
        fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 5, clientY: 0 }])
        fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 10, clientY: 0 }])
        fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 20, clientY: 0 }])

        expect(addedListeners.length).toBeGreaterThan(0)
        expect(addedListeners.every((listener) => removedListeners.includes(listener))).toBe(true)
      } finally {
        addEventListenerSpy.mockRestore()
        removeEventListenerSpy.mockRestore()
      }
    })

    it('does not commit again on outside taps after a touch interaction', async () => {
      const onValueCommitted = vi.fn()
      render(BasicSlider, { value: 0, onValueCommitted })

      const control = screen.getByTestId('control')
      mockControlRect(control)

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 5, clientY: 0 }])
      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 10, clientY: 0 }])
      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 20, clientY: 0 }])

      await waitFor(() => expect(onValueCommitted).toHaveBeenCalledTimes(1))

      fireTouch(document.body, 'touchstart', [{ identifier: 2, clientX: 80, clientY: 50 }])
      fireTouch(document.body, 'touchend', [{ identifier: 2, clientX: 80, clientY: 50 }])

      expect(onValueCommitted).toHaveBeenCalledTimes(1)
    })

    it('reports the right position for a vertical slider', async () => {
      render(BasicSlider, { value: 20, orientation: 'vertical' })

      const control = screen.getByTestId('control')
      vi.spyOn(control, 'getBoundingClientRect').mockImplementation(
        () => new DOMRect(0, 0, 10, 100)
      )

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 0, clientY: 20 }])
      await waitFor(() => expect(getSliderValues()).toEqual([80]))

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 0, clientY: 22 }])
      await waitFor(() => expect(getSliderValues()).toEqual([78]))

      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 0, clientY: 22 }])
    })

    it('reaches the edge values when min, max and step do not start at 0', async () => {
      render(BasicSlider, { value: 90, min: 6, max: 108, step: 10 })

      const control = screen.getByTestId('control')
      mockControlRect(control)
      const input = screen.getByRole('slider')

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 20, clientY: 0 }])

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 100, clientY: 0 }])
      await waitFor(() => expect(input).toHaveAttribute('aria-valuenow', '106'))

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 200, clientY: 0 }])
      await waitFor(() => expect(input).toHaveAttribute('aria-valuenow', '106'))

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 50, clientY: 0 }])
      await waitFor(() => expect(input).toHaveAttribute('aria-valuenow', '56'))

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: -100, clientY: 0 }])
      await waitFor(() => expect(input).toHaveAttribute('aria-valuenow', '6'))

      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: -100, clientY: 0 }])
    })

    it('rounds dragged values to step precision', async () => {
      render(BasicSlider, { value: 0.2, min: 0, max: 1, step: 0.1 })

      const control = screen.getByTestId('control')
      mockControlRect(control)
      const input = screen.getByRole('slider')

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 20, clientY: 0 }])

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 80, clientY: 0 }])
      await waitFor(() => expect(input).toHaveAttribute('aria-valuenow', '0.8'))

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 40, clientY: 0 }])
      await waitFor(() => expect(input).toHaveAttribute('aria-valuenow', '0.4'))

      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 40, clientY: 0 }])
    })

    it('rtl: maps touch positions from the inline-end edge', async () => {
      const onValueChange = vi.fn()
      render(Directional, { direction: 'rtl', value: 30, onValueChange })

      const control = screen.getByTestId('control')
      mockControlRect(control)
      expect(screen.getByTestId('thumb').style.getPropertyValue('inset-inline-start')).toBe('30%')

      fireTouch(control, 'touchstart', [{ identifier: 1, clientX: 20, clientY: 0 }])
      await waitFor(() => expect(onValueChange).toHaveBeenCalledWith(80))

      fireTouch(document.body, 'touchmove', [{ identifier: 1, clientX: 22, clientY: 0 }])
      await waitFor(() => expect(onValueChange).toHaveBeenLastCalledWith(78))

      fireTouch(document.body, 'touchend', [{ identifier: 1, clientX: 22, clientY: 0 }])
    })
  })

  it('registers with the Field without a Slider.Control', async () => {
    const onFormSubmit = vi.fn()
    render(NoControlSlider, { onFormSubmit })

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(onFormSubmit).toHaveBeenCalledTimes(1))
    expect(onFormSubmit.mock.calls[0][0]).toEqual({ slider: 30 })
  })
})
