import { watch, watchPre } from '$lib/internal/watch.svelte'
import type { EventHandler } from 'svelte/elements'

export type FormValidationMode = 'onSubmit' | 'onBlur' | 'onChange'
export type FormErrors = Record<string, string | string[]>

export type FormFieldEntry = {
  name: string | undefined
  validate: () => void
  valid: boolean | null
  control: () => HTMLElement | null
  value: () => unknown
}

export function collectFormValues(fields: Map<string, FormFieldEntry>): Record<string, unknown> {
  const values: Record<string, unknown> = {}
  for (const field of fields.values()) {
    if (field.name) values[field.name] = field.value()
  }
  return values
}

export type FieldForm = {
  fields: Map<string, FormFieldEntry>
  validationMode: FormValidationMode
  errors: FormErrors
  clearErrors: (name: string | undefined) => void
  submitAttempted: boolean
  element: HTMLElement | null
}

type FormRootOptions = {
  validationMode: FormValidationMode
  externalErrors: FormErrors | undefined
  element: HTMLElement | null
  onsubmit?: EventHandler<SubmitEvent, HTMLFormElement> | null
  onFormSubmit?: (values: Record<string, unknown>) => void
}

function comesBeforeInSameTree(element: Node, reference: Node): boolean {
  const position = element.compareDocumentPosition(reference)
  return (
    (position & Node.DOCUMENT_POSITION_DISCONNECTED) === 0 &&
    (position & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  )
}

export class FormRoot {
  #options: () => FormRootOptions
  fields = new Map<string, FormFieldEntry>()

  submitAttempted = false
  #submittedSuccessfully = false

  errors: FormErrors = $state.raw({})

  validationMode = $derived.by(() => this.#options().validationMode)

  element = $derived.by(() => this.#options().element)

  validate = (fieldName?: string) => {
    for (const field of this.fields.values()) {
      if (fieldName && field.name !== fieldName) continue
      field.validate()
      if (fieldName) return
    }
  }

  constructor(options: () => FormRootOptions) {
    this.#options = options
    this.errors = options().externalErrors ?? {}

    watchPre(
      () => options().externalErrors,
      (next) => {
        this.errors = next ?? {}
      }
    )

    watch(
      () => this.errors,
      () => {
        if (!this.#submittedSuccessfully) return
        this.#submittedSuccessfully = false

        this.#focusFirstInvalid()
      }
    )
  }

  #focusFirstInvalid(): boolean {
    let hasInvalid = false
    let firstControl: HTMLElement | null = null

    for (const field of this.fields.values()) {
      if (field.valid !== false) continue

      hasInvalid = true
      const control = field.control()
      if (control && (!firstControl || comesBeforeInSameTree(control, firstControl))) {
        firstControl = control
      }
    }

    if (firstControl) {
      firstControl.focus()
      if (firstControl instanceof HTMLInputElement) firstControl.select()
    }

    return hasInvalid
  }

  clearErrors = (name: string | undefined) => {
    if (!name) return
    if (Object.hasOwn(this.errors, name)) {
      const next = { ...this.errors }
      delete next[name]
      this.errors = next
    }
  }

  onsubmit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
    this.submitAttempted = true

    for (const field of this.fields.values()) {
      field.validate()
    }

    const hasInvalidField = this.#focusFirstInvalid()
    if (hasInvalidField) {
      event.preventDefault()
      return
    }

    this.#submittedSuccessfully = true
    this.#options().onsubmit?.(event)

    const onFormSubmit = this.#options().onFormSubmit
    if (onFormSubmit) {
      event.preventDefault()
      onFormSubmit(collectFormValues(this.fields))
    }
  }
}
