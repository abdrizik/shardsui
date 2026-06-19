import { Context } from '$lib/internal/context'
import type { VirtualAnchorElement } from '$lib/internal/floating/anchor-positioning.svelte'

export type ContextMenuRoot = {
  anchor: VirtualAnchorElement
  initialCursorPoint: { x: number; y: number } | null
  allowMouseUpTrigger: boolean
}

export const ContextMenuContext = new Context<ContextMenuRoot>('ContextMenu.Root')

export type ContextMenuTriggerState = {
  open: boolean
}
