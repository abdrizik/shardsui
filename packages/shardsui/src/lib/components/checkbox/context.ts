import type { FieldState } from '$lib/components/field/field.svelte'
import { Context } from '$lib/internal/context'

export type CheckboxState = FieldState & {
  checked: boolean
  disabled: boolean
  readOnly: boolean
  required: boolean
  indeterminate: boolean
}

export type CheckboxContext = {
  state: CheckboxState
  stateAttrs: Record<string, string | undefined>
}

export const CheckboxContext = new Context<CheckboxContext>('Checkbox.Root')
