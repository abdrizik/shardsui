import { Context } from '$lib/internal/context'
import type { Composite } from '$lib/internal/floating/composite.svelte'
import type { Orientation } from '$lib/internal/types'

export type ToggleGroupState = {
  disabled: boolean
  multiple: boolean
  orientation: Orientation
}

export type ToggleGroupContext = {
  composite: Composite
  value: readonly string[]
  disabled: boolean
  isValueInitialized: boolean
  setValue: (toggleValue: string, nextPressed: boolean) => void
}

export const ToggleGroupContext = new Context<ToggleGroupContext>('ToggleGroup')
