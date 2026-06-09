import { Context } from '$lib/internal/context'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'
import type { FieldRoot, FieldState, FieldValidityData } from './field.svelte'

export type FieldItemContext = { disabled: boolean }

export type FieldRootState = FieldState & { disabled: boolean }

export type FieldErrorState = FieldRootState & { transitionStatus: TransitionStatus }

export type FieldValidityState = Omit<FieldValidityData, 'state'> & {
  validity: FieldValidityData['state']
  transitionStatus: TransitionStatus
}

export const FieldContext = new Context<FieldRoot>('Field.Root')

export const FieldItemContext = new Context<FieldItemContext>('Field.Item')
