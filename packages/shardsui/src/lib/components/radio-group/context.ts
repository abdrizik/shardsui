import type { FieldState } from '$lib/components/field/field.svelte'
import { Context } from '$lib/internal/context'
import type { RadioGroupRoot } from './radio-group.svelte'

export type RadioGroupState = FieldState & {
  disabled: boolean
  readOnly: boolean
  required: boolean
}

export const RadioGroupContext = new Context<RadioGroupRoot<any>>('RadioGroup')
