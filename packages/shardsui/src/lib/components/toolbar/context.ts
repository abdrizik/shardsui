import { Context } from '$lib/internal/context'
import type { Composite } from '$lib/internal/floating/composite.svelte'
import type { Orientation } from '$lib/internal/types'

export type ToolbarContext = {
  composite: Composite
  disabled: boolean
  orientation: Orientation
}

export type ToolbarGroupContext = {
  disabled: boolean
}

export type ToolbarRootState = {
  disabled: boolean
  orientation: Orientation
}

export type ToolbarLinkState = {
  orientation: Orientation
}

export const ToolbarContext = new Context<ToolbarContext>('Toolbar.Root')

export const ToolbarGroupContext = new Context<ToolbarGroupContext>('Toolbar.Group')
