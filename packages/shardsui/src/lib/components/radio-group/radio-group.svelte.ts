import { FieldContext } from '$lib/components/field/context'
import { isSubmittableInput } from '$lib/components/field/field.svelte'
import { FormContext } from '$lib/components/form/context'
import type { ModifierKey } from '$lib/internal/composite'
import { contains } from '$lib/internal/dom'
import { Composite } from '$lib/internal/floating/composite.svelte'
import { watch } from '$lib/internal/watch.svelte'

const MODIFIER_KEYS: ModifierKey[] = ['Shift']

type RadioGroupRootOptions<Value = unknown> = {
  uid: string
  value: Value | undefined
  setValue: (value: Value) => void
  disabled: boolean
  readOnly: boolean
  required: boolean
  name: string | undefined
  form: string | undefined
  onValueChange?: (value: Value) => void
  ref: HTMLElement | null
}

export class RadioGroupRoot<Value = unknown> {
  #options: () => RadioGroupRootOptions<Value>
  #controlId: string

  #field = FieldContext.getOr()
  #formRoot = FormContext.getOr()

  composite: Composite

  touched = false

  value = $derived.by(() => this.#options().value)
  readOnly = $derived.by(() => this.#options().readOnly)
  required = $derived.by(() => this.#options().required)
  form = $derived.by(() => this.#options().form)
  disabled = $derived.by(() => this.#field?.disabled || this.#options().disabled)
  name = $derived.by(() => this.#field?.name ?? this.#options().name)

  constructor(options: () => RadioGroupRootOptions<Value>) {
    this.#options = options
    this.#controlId = `${this.#options().uid}-control`

    this.composite = new Composite(() => ({
      orientation: 'both',
      loopFocus: true,
      modifierKeys: MODIFIER_KEYS,
      ref: this.#options().ref
    }))

    $effect(() => {
      if (this.disabled) return
      const field = this.#field
      return field?.registerControl({
        id: this.#controlId,
        element: () => field.getRepresentativeControl(),
        value: () => this.value ?? null,
        formValue: () => this.#formValue(),
        name: () => this.#options().name
      })
    })

    watch(
      () => this.#options().value,
      (next) => {
        this.#formRoot?.clearErrors(this.name)
        const field = this.#field
        if (!field) return
        field.setDirty(next !== field.validityData.initialValue)
        field.filled = next != null
        field.commitValue(next)
      }
    )
  }

  #formValue() {
    const field = this.#field
    const formElement = field?.formElement
    if (!field || !formElement) return this.value ?? null

    for (const input of field.registeredInputs.keys()) {
      if (input.checked && isSubmittableInput(input, formElement)) return this.value ?? null
    }
    return null
  }

  setCheckedValue = (next: Value) => {
    this.#options().onValueChange?.(next)
    this.#options().setValue(next)
  }

  onkeydowncapture = (event: KeyboardEvent) => {
    if (!event.key.startsWith('Arrow')) return
    this.touched = true
    const field = this.#field
    if (field) field.focused = true
  }

  onfocusin = () => {
    const field = this.#field
    if (field) field.focused = true
  }

  onfocusout = (event: FocusEvent) => {
    const field = this.#field
    const ref = this.#options().ref
    if (!field || !ref) return

    const next = event.relatedTarget
    if (contains(ref, next)) return

    field.commitOnBlur(this.value)
  }
}
