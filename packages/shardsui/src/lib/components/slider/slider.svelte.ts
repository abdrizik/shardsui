import { FieldContext } from '$lib/components/field/context'
import {
  getFieldAriaInvalid,
  getFieldState,
  getFieldStateAttrs,
  type FieldState
} from '$lib/components/field/field.svelte'
import { FormContext } from '$lib/components/form/context'
import { clamp } from '$lib/internal/clamp'
import { dataAttrs } from '$lib/internal/data-attrs'
import { sortByDocumentPosition } from '$lib/internal/document-position'
import { contains } from '$lib/internal/dom'
import { LabelableContext } from '$lib/internal/labelable-context'
import { mergeDescribedBy } from '$lib/internal/labelable.svelte'
import type { Orientation } from '$lib/internal/types'
import { watch } from '$lib/internal/watch.svelte'
import { isHTMLElement } from '@floating-ui/utils/dom'
import { untrack } from 'svelte'
import { SvelteMap } from 'svelte/reactivity'
import { asc, getSliderValue, validateMinimumDistance } from './math'

type Value = number | readonly number[]

export type SliderState = FieldState & {
  activeThumbIndex: number
  disabled: boolean
  dragging: boolean
  orientation: Orientation
  max: number
  min: number
  minStepsBetweenValues: number
  step: number
  values: number[]
}

type SliderRootOptions = {
  uid: string
  id: string | null | undefined
  value: Value
  setValue: (value: Value) => void
  min: number
  max: number
  step: number
  largeStep: number
  orientation: Orientation
  disabled: boolean
  minStepsBetweenValues: number
  thumbCollisionBehavior: 'push' | 'swap' | 'none'
  thumbAlignment: 'center' | 'edge'
  name: string | undefined
  form: string | undefined
  format: Intl.NumberFormatOptions | undefined
  locale: Intl.LocalesArgument
  ariaLabelledBy: string | undefined
  ariaDescribedBy: string | undefined
  onValueChange?: (value: Value) => void
  onValueCommitted?: (value: Value) => void
  ref: HTMLElement | null
}

type ThumbRegistration = {
  inputId: string
  input: () => HTMLInputElement | null
}

export class SliderRoot {
  #options: () => SliderRootOptions

  #thumbs = new SvelteMap<HTMLElement, ThumbRegistration>()

  #field = FieldContext.getOr()
  #labelable = LabelableContext.get()
  #formRoot = FormContext.getOr()

  dragging = $state(false)

  indicatorStart = $state<number | undefined>(undefined)
  indicatorEnd = $state<number | undefined>(undefined)

  activeThumbIndex = $state(-1)
  lastUsedThumbIndex = $state(-1)
  controlElement = $state<HTMLElement | null>(null)
  labelId = $state<string | undefined>(undefined)

  #ref = $derived.by(() => this.#options().ref)

  id = $derived.by(() => this.#options().id ?? this.#options().uid)
  disabled = $derived.by(() => this.#field?.disabled || this.#options().disabled)
  name = $derived.by(() => this.#field?.name ?? this.#options().name)
  form = $derived.by(() => this.#options().form)
  min = $derived.by(() => this.#options().min)
  max = $derived.by(() => this.#options().max)
  step = $derived.by(() => this.#options().step)
  largeStep = $derived.by(() => this.#options().largeStep)
  orientation = $derived.by(() => this.#options().orientation)
  minStepsBetweenValues = $derived.by(() => this.#options().minStepsBetweenValues)
  thumbCollisionBehavior = $derived.by(() => this.#options().thumbCollisionBehavior)
  inset = $derived.by(() => this.#options().thumbAlignment !== 'center')
  locale = $derived.by(() => this.#options().locale)
  format = $derived.by(() => this.#options().format)

  #arrayValue = $derived.by(() => Array.isArray(this.#options().value))

  values = $derived.by((): number[] => {
    const { value, min, max } = this.#options()
    if (!this.#arrayValue) {
      return [clamp(value as number, min, max)]
    }
    return (value as readonly number[]).map((entry) => clamp(entry, min, max)).toSorted(asc)
  })

  range = $derived(this.values.length > 1)

  #fieldValue = $derived.by((): Value => (this.#arrayValue ? this.values : this.values[0]))

  ariaLabelledBy = $derived.by(
    () => this.#options().ariaLabelledBy ?? this.#labelable.labelId ?? this.labelId
  )

  ariaDescribedBy = $derived.by(() =>
    mergeDescribedBy(this.#options().ariaDescribedBy, this.#labelable.messageIds)
  )

  ariaInvalid = $derived(getFieldAriaInvalid(this.#field, this.disabled))

  thumbElements = $derived(
    Array.from(this.#thumbs.keys())
      .filter((element) => element.isConnected)
      .sort(sortByDocumentPosition)
  )

  thumbInputIds = $derived(this.thumbElements.map((element) => this.#thumbs.get(element)!.inputId))

  state: SliderState = $derived({
    ...getFieldState(this.#field),
    activeThumbIndex: this.activeThumbIndex,
    disabled: this.disabled,
    dragging: this.dragging,
    orientation: this.orientation,
    max: this.max,
    min: this.min,
    minStepsBetweenValues: this.minStepsBetweenValues,
    step: this.step,
    values: this.values
  })

  stateAttrs = $derived(
    dataAttrs({
      dragging: this.dragging,
      orientation: this.orientation,
      disabled: this.disabled,
      ...getFieldStateAttrs(this.#field)
    })
  )

  constructor(options: () => SliderRootOptions) {
    this.#options = options

    $effect(() => {
      const field = this.#field
      if (!field || this.disabled) return
      return field.registerControl({
        id: this.id,
        element: () => this.getThumbInput(this.thumbElements.length - 1),
        value: () => this.#fieldValue,
        name: () => this.#options().name
      })
    })

    watch(
      () => this.#fieldValue,
      (current) => {
        this.#formRoot?.clearErrors(this.name)

        if (!this.#field) return

        this.#field.commitValue(current)

        const initial = this.#field.validityData.initialValue as Value | null | undefined
        this.#field.setDirty(!this.#areValuesEqual(current, initial))
      },
      { equals: this.#areValuesEqual }
    )

    $effect(() => {
      if (!this.disabled) return
      const activeEl = (this.#ref?.ownerDocument ?? document).activeElement
      if (isHTMLElement(activeEl) && contains(this.#ref, activeEl)) {
        activeEl.blur()
      }
      this.setActive(-1)
    })
  }

  #areValuesEqual = (a: Value, b: Value | null | undefined): boolean => {
    if (a === b) return true
    return (
      Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((value, index) => value === b[index])
    )
  }

  setActive = (index: number): void => {
    this.activeThumbIndex = index
    if (index !== -1) this.lastUsedThumbIndex = index
  }

  setValue = (newValue: Value): boolean => {
    if (typeof newValue === 'number' && Number.isNaN(newValue)) return false
    if (this.#areValuesEqual(newValue, this.#options().value)) return false
    this.#options().onValueChange?.(newValue)
    this.#options().setValue(newValue)
    return true
  }

  commitValue = (next: Value): void => {
    this.#options().onValueCommitted?.(next)
  }

  setValueFromInput = (valueInput: number, index: number): void => {
    const newValue = getSliderValue(
      valueInput,
      index,
      this.min,
      this.max,
      this.#arrayValue,
      this.values
    )
    if (validateMinimumDistance(newValue, this.step, this.minStepsBetweenValues)) {
      const applied = this.setValue(newValue)
      this.#field?.setTouched(true)
      if (applied) {
        this.commitValue(newValue)
      }
    }
  }

  registerThumb = (element: HTMLElement, registration: ThumbRegistration): (() => void) => {
    untrack(() => this.#thumbs.set(element, registration))
    return () => this.#thumbs.delete(element)
  }

  getThumbInput = (index: number): HTMLInputElement | null => {
    const element = this.thumbElements[index]
    return (element && this.#thumbs.get(element)?.input()) ?? null
  }

  setIndicatorPosition = (slot: 0 | 1, position: number | undefined): void => {
    if (slot === 0) this.indicatorStart = position
    else this.indicatorEnd = position
  }
}
