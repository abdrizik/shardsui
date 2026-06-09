import type { FieldsetState } from '$lib/components/fieldset/context'
import {
  collectFormValues,
  type FieldForm,
  type FormFieldEntry,
  type FormValidationMode
} from '$lib/components/form/form.svelte'
import { dataAttrs } from '$lib/internal/data-attrs'
import { Timeout } from '$lib/internal/timeout'
import { watchPre } from '$lib/internal/watch.svelte'
import { untrack } from 'svelte'

type ValidityFlags = {
  badInput: boolean
  customError: boolean
  patternMismatch: boolean
  rangeOverflow: boolean
  rangeUnderflow: boolean
  stepMismatch: boolean
  tooLong: boolean
  tooShort: boolean
  typeMismatch: boolean
  valueMissing: boolean
  valid: boolean | null
}

export type FieldValidityData = {
  state: ValidityFlags
  error: string
  errors: string[]
  value: unknown
  initialValue: unknown
}

type FieldValidatorResult = string | string[] | null

export type FieldValidator = (
  value: unknown,
  formValues: Record<string, unknown>
) => FieldValidatorResult | Promise<FieldValidatorResult>

type RegisteredInput = {
  control: () => HTMLElement | null
  value: string | undefined
}

type ControlEntry = {
  id: string
  element: () => HTMLElement | null
  value: () => unknown
  formValue?: () => unknown
  validationElement?: () => HTMLElement | null
  name?: () => string | undefined
}

const DEFAULT_VALIDITY_STATE: ValidityFlags = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: null,
  valueMissing: false
}

const DEFAULT_VALIDITY_DATA: FieldValidityData = {
  state: DEFAULT_VALIDITY_STATE,
  error: '',
  errors: [],
  value: null,
  initialValue: null
}

const VALIDITY_KEYS = Object.keys(DEFAULT_VALIDITY_STATE) as Array<keyof ValidityState>

function hasErrorBesides(
  validity: ValidityFlags | ValidityState,
  ...ignoredKeys: Array<keyof ValidityState>
): boolean {
  return VALIDITY_KEYS.some((key) => key !== 'valid' && !ignoredKeys.includes(key) && validity[key])
}

export function getFieldState(field: FieldRoot | undefined): FieldState {
  return {
    touched: field?.touched ?? false,
    dirty: field?.dirty ?? false,
    filled: field?.filled ?? false,
    focused: field?.focused ?? false,
    valid: field?.valid ?? null
  }
}

export type FieldState = {
  touched: boolean
  dirty: boolean
  filled: boolean
  focused: boolean
  valid: boolean | null
}

export function getFieldStateAttrs(field: FieldRoot | undefined) {
  return {
    touched: field?.touched,
    dirty: field?.dirty,
    filled: field?.filled,
    focused: field?.focused,
    valid: field?.valid === true,
    invalid: field?.valid === false
  }
}

export function getFieldAriaInvalid(
  field: FieldRoot | undefined,
  disabled: boolean
): true | undefined {
  return field?.valid === false && !disabled ? true : undefined
}

function isFormInputElement(element: HTMLElement): element is HTMLInputElement {
  return 'validity' in element
}

export function isSubmittableInput(
  input: HTMLInputElement,
  formElement: HTMLElement | null
): boolean {
  if (input.matches(':disabled')) return false
  if (!formElement || input.form === formElement) return true
  return input.form === null && !input.hasAttribute('form')
}

function toFormField(field: FieldRoot, control: ControlEntry): FormFieldEntry {
  return {
    get name() {
      return field.name
    },
    get valid() {
      return field.valid
    },
    validate: () => field.validateControl(control),
    control: () => control.element(),
    value: () => (control.formValue ? control.formValue() : control.value())
  }
}

type FieldRootOptions = {
  name: string | undefined
  validate: FieldValidator
  validationMode: FormValidationMode | undefined
  validationDebounceTime: number
  disabled: boolean
  invalid: boolean | undefined
  dirty: boolean | undefined
  touched: boolean | undefined
  fieldset: FieldsetState | undefined
  form: FieldForm | undefined
}

export class FieldRoot {
  #options: () => FieldRootOptions
  #debounceTimeout = new Timeout()

  registeredInputs = new Map<HTMLInputElement, RegisteredInput>()

  #ownForm: FieldForm = {
    fields: new Map(),
    validationMode: 'onSubmit',
    errors: {},
    clearErrors: () => {},
    submitAttempted: false,
    element: null
  }

  #markedDirty = false
  #initialValueCaptured = false
  #validationCommitId = 0

  filled = $state(false)
  focused = $state(false)
  #touchedState = $state(false)
  #dirtyState = $state(false)
  #activeControl = $state.raw<ControlEntry | null>(null)
  validityData = $state.raw<FieldValidityData>(DEFAULT_VALIDITY_DATA)

  #form = $derived.by(() => this.#options().form ?? this.#ownForm)

  formElement = $derived(this.#form.element)

  name = $derived.by(() => this.#options().name ?? this.#activeControl?.name?.())

  validationMode = $derived.by(() => this.#options().validationMode ?? this.#form.validationMode)

  disabled = $derived.by(() => this.#options().fieldset?.disabled || this.#options().disabled)

  dirty = $derived.by(() => this.#options().dirty ?? this.#dirtyState)
  touched = $derived.by(() => this.#options().touched ?? this.#touchedState)

  formError = $derived(
    this.name && Object.hasOwn(this.#form.errors, this.name) ? this.#form.errors[this.name] : null
  )

  hasFormError = $derived(
    !!(Array.isArray(this.formError) ? this.formError.length : this.formError)
  )

  #invalid = $derived.by(() => this.#options().invalid === true || this.hasFormError)

  valid = $derived(!this.#invalid && (this.disabled ? null : this.validityData.state.valid))

  combinedValidityData = $derived<FieldValidityData>({
    ...this.validityData,
    state: {
      ...this.validityData.state,
      valid: !this.#invalid && this.validityData.state.valid
    }
  })

  stateAttrs = $derived(dataAttrs({ disabled: this.disabled, ...getFieldStateAttrs(this) }))

  constructor(options: () => FieldRootOptions) {
    this.#options = options
    this.#markedDirty = options().dirty ?? false

    watchPre(
      () => this.#options().dirty,
      (next) => {
        if (next !== undefined) this.#markedDirty = next
      }
    )

    $effect(this.#debounceTimeout.disposeEffect)

    $effect(() => {
      const form = this.#form
      const control = this.#activeControl
      if (!control?.id || this.disabled) return

      const id = control.id
      const entry = toFormField(this, control)
      form.fields.set(id, entry)
      return () => {
        if (form.fields.get(id) === entry) form.fields.delete(id)
      }
    })
  }

  validateControl = (control: ControlEntry | null) => {
    this.#markedDirty = true
    this.commit(control ? control.value() : this.validityData.value)
  }

  setTouched = (next: boolean) => {
    if (this.#options().touched !== undefined) return
    this.#touchedState = next
  }

  commitOnBlur = (value: unknown) => {
    this.setTouched(true)
    this.focused = false
    if (this.validationMode === 'onBlur') this.commit(value)
  }

  setDirty = (next: boolean) => {
    if (this.#options().dirty !== undefined) return
    if (next) this.#markedDirty = true
    this.#dirtyState = next
  }

  registerControl = (entry: ControlEntry): (() => void) => {
    this.#activeControl = entry
    untrack(() => {
      if (this.#initialValueCaptured) return
      this.#initialValueCaptured = true
      const initialValue = entry.value()
      if (this.validityData.initialValue !== initialValue) {
        this.validityData = { ...this.validityData, initialValue }
      }
    })
    return () => {
      if (this.#activeControl?.id === entry.id) this.#activeControl = null
    }
  }

  registerInput = (input: HTMLInputElement, registration: RegisteredInput): (() => void) => {
    this.registeredInputs.set(input, registration)
    return () => {
      this.registeredInputs.delete(input)
    }
  }

  getRepresentativeControl = (): HTMLElement | null => {
    const input = this.#findRepresentativeInput()
    return (input && this.registeredInputs.get(input)?.control()) ?? null
  }

  #findRepresentativeInput(): HTMLInputElement | null {
    let fallback: HTMLInputElement | null = null
    for (const input of this.registeredInputs.keys()) {
      if (!isSubmittableInput(input, this.formElement)) continue
      if (!input.validity.valid) return input
      fallback ??= input
    }
    return fallback
  }

  #shouldValidateOnChange() {
    return (
      this.validationMode === 'onChange' ||
      (this.validationMode === 'onSubmit' && this.#form.submitAttempted)
    )
  }

  #getValidityState(element: HTMLInputElement): ValidityFlags {
    const computed = {} as ValidityFlags
    for (const key of VALIDITY_KEYS) computed[key] = element.validity[key]

    if (computed.valueMissing && !hasErrorBesides(computed, 'valueMissing') && !this.#markedDirty) {
      computed.valid = true
      computed.valueMissing = false
    }
    return computed
  }

  #clearCustomValidity(element: HTMLInputElement | null) {
    for (const input of this.registeredInputs.keys()) input.setCustomValidity('')
    element?.setCustomValidity('')
  }

  #resolveValidationInput(): HTMLInputElement | null {
    const control =
      this.registeredInputs.size > 0
        ? this.#findRepresentativeInput()
        : (this.#activeControl?.validationElement?.() ?? this.#activeControl?.element() ?? null)
    return control && isFormInputElement(control) ? control : null
  }

  #writeValidityData(next: Omit<FieldValidityData, 'initialValue'>) {
    this.validityData = { ...next, initialValue: this.validityData.initialValue }
  }

  #settleRevalidation(input: HTMLInputElement | null, value: unknown): boolean {
    if (this.valid !== false || !input) return true

    if (input.validity.valueMissing) {
      return hasErrorBesides(input.validity, 'valueMissing', 'customError')
    }

    this.#clearCustomValidity(input)
    this.#writeValidityData({
      value,
      state: { ...DEFAULT_VALIDITY_STATE, valid: true },
      error: '',
      errors: []
    })
    return true
  }

  commit = async (value: unknown, revalidate = false): Promise<void> => {
    const input = this.#resolveValidationInput()

    const commitId = ++this.#validationCommitId

    if (revalidate && this.#settleRevalidation(input, value)) return

    this.#debounceTimeout.clear()

    const nextState = input
      ? this.#getValidityState(input)
      : { ...DEFAULT_VALIDITY_STATE, valid: true }

    let result: string | string[] | null = null
    let validationErrors: string[] = []
    let defaultValidationMessage: string | undefined
    const validateOnChange = this.#shouldValidateOnChange()

    if (input?.validationMessage && !validateOnChange) {
      defaultValidationMessage = input.validationMessage
      validationErrors = [input.validationMessage]
    } else {
      const validateResult = this.#options().validate(value, collectFormValues(this.#form.fields))
      result =
        validateResult !== null && typeof validateResult === 'object' && 'then' in validateResult
          ? await validateResult
          : validateResult

      if (commitId !== this.#validationCommitId) return

      if (result !== null) {
        nextState.valid = false
        nextState.customError = true
        if (Array.isArray(result)) {
          validationErrors = result
          input?.setCustomValidity(result.join('\n'))
        } else if (result) {
          validationErrors = [result]
          input?.setCustomValidity(result)
        }
      } else if (validateOnChange) {
        this.#clearCustomValidity(input)
        nextState.customError = false
        if (input?.validationMessage) {
          defaultValidationMessage = input.validationMessage
          validationErrors = [input.validationMessage]
        } else if ((!input || input.validity.valid) && !nextState.valid) {
          nextState.valid = true
        }
      }
    }

    this.#writeValidityData({
      value,
      state: nextState,
      error: defaultValidationMessage ?? (Array.isArray(result) ? result[0] : (result ?? '')),
      errors: validationErrors
    })
  }

  commitValue = (value: unknown) => {
    this.#debounceTimeout.clear()

    const validateOnChange = this.#shouldValidateOnChange()
    if (validateOnChange && value !== '' && this.#options().validationDebounceTime) {
      this.#validationCommitId += 1
      this.#debounceTimeout.start(this.#options().validationDebounceTime, () => this.commit(value))
      return
    }

    this.commit(value, !validateOnChange)
  }
}
