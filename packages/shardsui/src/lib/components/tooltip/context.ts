import type {
  AnchoredArrowState,
  AnchoredPopupState,
  AnchoredPositionerState,
  AnchoredViewportState
} from '$lib/internal/anchored-state'
import { Context } from '$lib/internal/context'
import type { AnchorPositioning } from '$lib/internal/floating/anchor-positioning.svelte'
import type { REASONS } from '$lib/internal/reasons'
import type { DelayGroup } from './delay-group.svelte'
import type { TooltipInstantType, TooltipRoot } from './tooltip.svelte'

export type TooltipPopupState = AnchoredPopupState<TooltipInstantType>

export type TooltipArrowState = AnchoredArrowState & {
  instant: TooltipInstantType | undefined
}

export type TooltipViewportState = AnchoredViewportState<TooltipInstantType>

export type TooltipTriggerState = {
  open: boolean
}

export type TooltipPositionerState = AnchoredPositionerState<TooltipInstantType | 'tracking-cursor'>

export type TooltipOpenReason =
  | typeof REASONS.triggerHover
  | typeof REASONS.triggerFocus
  | typeof REASONS.outsidePress
  | typeof REASONS.escapeKey
  | typeof REASONS.triggerPress
  | typeof REASONS.disabled
  | typeof REASONS.imperativeAction
  | typeof REASONS.none

export type TooltipProviderContext = {
  delay: number | undefined
  delayGroup: DelayGroup
}

export const TooltipContext = new Context<TooltipRoot>('Tooltip.Root')

export const TooltipProviderContext = new Context<TooltipProviderContext>('Tooltip.Provider')

export const TooltipPositionerContext = new Context<AnchorPositioning>('Tooltip.Positioner')
