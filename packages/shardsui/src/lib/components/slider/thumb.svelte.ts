import { FieldContext } from '$lib/components/field/context'
import { clamp } from '$lib/internal/clamp'
import { COMPOSITE_KEYS } from '$lib/internal/composite'
import { DirectionContext } from '$lib/internal/direction-context'
import { contains } from '$lib/internal/dom'
import { matchesFocusVisible } from '$lib/internal/floating/element'
import { LabelableContext } from '$lib/internal/labelable-context'
import { valueToPercent } from '$lib/internal/value-to-percent'
import type { Attachment } from 'svelte/attachments'
import type { FocusEventHandler } from 'svelte/elements'
import { getDecimalPrecision, getSliderValue, roundValueToStep } from './math'
import type { SliderRoot } from './slider.svelte'

const SLIDER_KEYS = new Set([...COMPOSITE_KEYS, 'PageUp', 'PageDown'])

type SliderThumbOptions = {
  ref: HTMLElement | null
  input: HTMLInputElement | null
  index: number | undefined
  disabled: boolean
  generatedInputId: string
  onfocus: FocusEventHandler<HTMLInputElement> | null | undefined
  onblur: FocusEventHandler<HTMLInputElement> | null | undefined
}

export class SliderThumb {
  #slider: SliderRoot
  #field = FieldContext.getOr()
  #labelable = LabelableContext.get()
  #direction = DirectionContext.get()
  #options: () => SliderThumbOptions

  #isRestoringFocusVisible = false

  insetPosition = $state<number | undefined>(undefined)

  #ref = $derived.by(() => this.#options().ref)

  index = $derived.by(() => {
    if (!this.#slider.range) return 0
    const { index: explicitIndex, ref } = this.#options()
    if (explicitIndex !== undefined) return explicitIndex
    if (!ref) return -1
    return this.#slider.thumbElements.indexOf(ref)
  })

  resolved = $derived.by(() => this.index >= 0 && this.index < this.#slider.values.length)

  value = $derived.by(() => this.#slider.values[this.index] ?? NaN)

  valuePercent = $derived.by(() => valueToPercent(this.value, this.#slider.min, this.#slider.max))

  disabled = $derived.by(() => this.#options().disabled || this.#slider.disabled)

  vertical = $derived.by(() => this.#slider.orientation === 'vertical')

  inputId = $derived.by(() => {
    const generated = this.#options().generatedInputId
    return this.#slider.range ? generated : (this.#labelable.controlId ?? generated)
  })

  #indicatorSlot = $derived.by<0 | 1 | undefined>(() => {
    if (this.index === 0) return 0
    if (this.index === this.#slider.values.length - 1) return 1
    return undefined
  })

  constructor(slider: SliderRoot, options: () => SliderThumbOptions) {
    this.#slider = slider
    this.#options = options

    $effect(() => {
      if (!slider.inset) return
      this.#measureInsetPosition()
    })
  }

  registerThumb: Attachment<HTMLElement> = (node) =>
    this.#slider.registerThumb(node, { inputId: this.inputId, input: () => this.#options().input })

  observeInsetPosition: Attachment<HTMLElement> = (thumb) => {
    const slider = this.#slider
    const control = slider.controlElement
    if (!slider.inset || !control) return

    const observer = new ResizeObserver(() => this.#measureInsetPosition())
    observer.observe(control)
    observer.observe(thumb)

    return () => observer.disconnect()
  }

  #measureInsetPosition(): void {
    const slider = this.#slider
    const slot = this.#indicatorSlot
    const control = slider.controlElement
    const ref = this.#ref
    if (!control || !ref) return

    const side = this.vertical ? 'height' : 'width'
    const controlSize = control.getBoundingClientRect()[side]
    const thumbSize = ref.getBoundingClientRect()[side]
    const offsetFromControlEdge =
      thumbSize / 2 + ((controlSize - thumbSize) * this.valuePercent) / 100
    const percent = (offsetFromControlEdge / controlSize) * 100
    const position = Number.isFinite(percent) ? percent : undefined

    this.insetPosition = position
    if (slot !== undefined) slider.setIndicatorPosition(slot, position)
  }

  #steppedValue(currentValue: number, increment: number, sign: 1 | -1): number {
    const slider = this.#slider
    const value = currentValue + increment * sign
    const roundedValue = Number(
      value.toFixed(
        Math.max(
          getDecimalPrecision(currentValue),
          getDecimalPrecision(increment),
          getDecimalPrecision(slider.min)
        )
      )
    )
    return clamp(roundedValue, slider.min, slider.max)
  }

  onkeydown = (event: KeyboardEvent): void => {
    if (event.defaultPrevented) {
      return
    }

    if (!SLIDER_KEYS.has(event.key)) return

    if (COMPOSITE_KEYS.has(event.key)) {
      event.stopPropagation()
    }

    const slider = this.#slider
    const index = this.index
    const range = this.#slider.range
    const rtl = this.#direction.direction === 'rtl'

    let newValue: number | null = null
    let sign: 1 | -1 | 0 = 0
    let increment = event.shiftKey ? slider.largeStep : slider.step
    const roundedValue = roundValueToStep(this.value, slider.step, slider.min)

    switch (event.key) {
      case 'ArrowUp':
        sign = 1
        break
      case 'ArrowRight':
        sign = rtl ? -1 : 1
        break
      case 'ArrowDown':
        sign = -1
        break
      case 'ArrowLeft':
        sign = rtl ? 1 : -1
        break
      case 'PageUp':
        increment = slider.largeStep
        sign = 1
        break
      case 'PageDown':
        increment = slider.largeStep
        sign = -1
        break
      case 'End':
        newValue =
          range && Number.isFinite(slider.values[index + 1])
            ? slider.values[index + 1] - slider.step * slider.minStepsBetweenValues
            : slider.max
        break
      case 'Home':
        newValue =
          range && Number.isFinite(slider.values[index - 1])
            ? slider.values[index - 1] + slider.step * slider.minStepsBetweenValues
            : slider.min
        break
    }

    if (sign !== 0) {
      newValue = this.#steppedValue(roundedValue, increment, sign)
    }

    if (newValue !== null) {
      const input = this.#options().input
      if (input && !matchesFocusVisible(input)) {
        this.#isRestoringFocusVisible = true
        input.blur()
        input.focus({ preventScroll: true, focusVisible: true })
      }

      slider.setValueFromInput(newValue, index)
      event.preventDefault()
    }
  }

  oninput = (): void => {
    const input = this.#options().input
    if (input) this.#slider.setValueFromInput(input.valueAsNumber, this.index)
  }

  onfocus: FocusEventHandler<HTMLInputElement> = (event) => {
    const wasRestoringFocusVisible = this.#isRestoringFocusVisible
    this.#isRestoringFocusVisible = false

    this.#slider.setActive(this.index)
    if (this.#field) this.#field.focused = true

    if (wasRestoringFocusVisible) return
    this.#options().onfocus?.(event)
  }

  onblur: FocusEventHandler<HTMLInputElement> = (event) => {
    if (this.#isRestoringFocusVisible) return

    const slider = this.#slider
    slider.setActive(-1)

    const movingToAnotherThumb = slider.thumbElements.some((thumb) =>
      contains(thumb, event.relatedTarget)
    )

    if (!movingToAnotherThumb) {
      this.#field?.commitOnBlur(
        getSliderValue(this.value, this.index, slider.min, slider.max, slider.range, slider.values)
      )
    }

    this.#options().onblur?.(event)
  }
}
