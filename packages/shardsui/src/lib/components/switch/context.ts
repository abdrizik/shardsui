import type { FieldState } from '$lib/components/field/field.svelte'
import { Context } from '$lib/internal/context'

export type SwitchState = FieldState & {
  checked: boolean
  disabled: boolean
  readOnly: boolean
  required: boolean
}

export type SwitchContext = {
  state: SwitchState
  stateAttrs: Record<string, string | undefined>
}

export const SwitchContext = new Context<SwitchContext>('Switch.Root')
