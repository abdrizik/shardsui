import type { FieldState } from '$lib/components/field/field.svelte'
import { Context } from '$lib/internal/context'
import type { CheckboxGroupRoot } from './checkbox-group.svelte'

export type CheckboxGroupState = FieldState & {
  disabled: boolean
}

export const CheckboxGroupContext = new Context<CheckboxGroupRoot>('CheckboxGroup')
