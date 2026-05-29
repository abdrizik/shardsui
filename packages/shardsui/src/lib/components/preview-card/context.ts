import type {
  AnchoredPopupState,
  AnchoredPositionerState,
  AnchoredViewportState
} from '$lib/internal/anchored-state'
import { Context } from '$lib/internal/context'
import type { AnchorPositioning } from '$lib/internal/floating/anchor-positioning.svelte'
import type { REASONS } from '$lib/internal/reasons'
import type { PreviewCardInstantType, PreviewCardRoot } from './preview-card.svelte'

export type PreviewCardPopupState = AnchoredPopupState<PreviewCardInstantType>

export type PreviewCardViewportState = AnchoredViewportState<PreviewCardInstantType>

export type PreviewCardTriggerState = {
  open: boolean
}

export type PreviewCardPositionerState = AnchoredPositionerState<PreviewCardInstantType>

export type PreviewCardOpenReason =
  | typeof REASONS.triggerHover
  | typeof REASONS.triggerFocus
  | typeof REASONS.triggerPress
  | typeof REASONS.outsidePress
  | typeof REASONS.escapeKey
  | typeof REASONS.imperativeAction
  | typeof REASONS.none

export const PreviewCardContext = new Context<PreviewCardRoot>('PreviewCard.Root')
export const PreviewCardPositionerContext = new Context<AnchorPositioning>('PreviewCard.Positioner')
