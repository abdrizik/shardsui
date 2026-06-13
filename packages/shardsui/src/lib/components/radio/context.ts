import type { FieldState } from '$lib/components/field/field.svelte'
import { Context } from '$lib/internal/context'

export type RadioState = FieldState & {
  checked: boolean
  disabled: boolean
  readOnly: boolean
  required: boolean
}

export type RadioContext = {
  state: RadioState
  stateAttrs: Record<string, string | undefined>
}

export const RadioContext = new Context<RadioContext>('Radio.Root')
