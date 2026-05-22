import { Context } from '$lib/internal/context'
import type { FieldsetRoot } from './fieldset.svelte'

export type FieldsetState = {
  disabled: boolean
}

export const FieldsetContext = new Context<FieldsetRoot>('Fieldset.Root')
