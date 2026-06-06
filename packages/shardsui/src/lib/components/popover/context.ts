import type {
  AnchoredPopupState,
  AnchoredPositionerState,
  AnchoredViewportState
} from '$lib/internal/anchored-state'
import { Context } from '$lib/internal/context'
import type { AnchorPositioning } from '$lib/internal/floating/anchor-positioning.svelte'
import type { REASONS } from '$lib/internal/reasons'
import type { PopoverInstantType, PopoverRoot } from './popover.svelte'

export type PopoverPopupState = AnchoredPopupState<PopoverInstantType>

export type PopoverPositionerState = AnchoredPositionerState<PopoverInstantType>

export type PopoverViewportState = AnchoredViewportState<PopoverInstantType>

export type PopoverTriggerState = {
  disabled: boolean
  open: boolean
}

export type PopoverOpenReason =
  | typeof REASONS.triggerHover
  | typeof REASONS.triggerPress
  | typeof REASONS.outsidePress
  | typeof REASONS.escapeKey
  | typeof REASONS.closePress
  | typeof REASONS.focusOut
  | typeof REASONS.imperativeAction

export const PopoverContext = new Context<PopoverRoot>('Popover.Root')

export const PopoverClosePartContext = new Context<{
  register: () => () => void
}>('Popover.Popup')

export const PopoverPositionerContext = new Context<AnchorPositioning>('Popover.Positioner')
