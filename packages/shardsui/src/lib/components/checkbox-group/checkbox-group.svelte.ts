import { FieldContext } from '$lib/components/field/context'
import { isSubmittableInput } from '$lib/components/field/field.svelte'
import { FormContext } from '$lib/components/form/context'
import { watch } from '$lib/internal/watch.svelte'

type CheckboxGroupRootOptions = {
  uid: string
  value: string[]
  setValue: (value: string[]) => void
  disabled: boolean
  onValueChange?: (value: string[]) => void
}

export class CheckboxGroupRoot {
  #options: () => CheckboxGroupRootOptions
  #field = FieldContext.getOr()
  #formRoot = FormContext.getOr()
  value = $derived.by(() => this.#options().value)
  disabled = $derived.by(() => this.#field?.disabled || this.#options().disabled)

  constructor(options: () => CheckboxGroupRootOptions) {
    this.#options = options

    $effect(() => {
      const field = this.#field
      if (!field?.name || this.disabled) return
      return field.registerControl({
        id: `${this.#options().uid}-control`,
        element: () => field.getRepresentativeControl(),
        value: () => this.value,
        formValue: () => this.#formValue()
      })
    })

    watch(
      () => this.#options().value,
      (next) => {
        const field = this.#field
        if (field?.name) this.#formRoot?.clearErrors(field.name)
        if (!field) return

        const initial = field.validityData.initialValue
        const previous: string[] = Array.isArray(initial) ? initial : []
        const isDirty =
          next.length !== previous.length || next.some((value, i) => value !== previous[i])

        field.setDirty(isDirty)
        field.filled = next.length > 0
        field.commitValue(next)
      }
    )
  }

  #setValue(next: string[]) {
    this.#options().onValueChange?.(next)
    this.#options().setValue(next)
  }

  #formValue(): string[] {
    const field = this.#field
    const formElement = field?.formElement
    if (!field || !formElement) return this.value

    const submittedValues = new Set<string>()
    for (const [input, registration] of field.registeredInputs) {
      if (registration.value === undefined || !input.checked) continue
      if (isSubmittableInput(input, formElement)) submittedValues.add(registration.value)
    }

    return this.value.filter((value) => submittedValues.has(value))
  }

  toggleChild = (childValue: string, checked: boolean) => {
    const next = checked
      ? [...this.value, childValue]
      : this.value.filter((value) => value !== childValue)

    this.#setValue(next)
  }
}
