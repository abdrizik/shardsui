import { dataAttrs } from '$lib/internal/data-attrs'
import type { Align, Side } from '$lib/internal/floating/anchor-positioning.svelte'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'

/** Snippet payload of every `Arrow` rendered through `internal/positioner-arrow.svelte`. */
export type AnchoredArrowState = {
  open: boolean
  side: Side
  align: Align
  uncentered: boolean
}

/** Snippet payload of every `Backdrop` rendered through `internal/anchored-backdrop.svelte`. */
export type AnchoredBackdropState = {
  open: boolean
  transitionStatus: TransitionStatus
}

export type AnchoredPopupState<Instant extends string = string> = {
  open: boolean
  side: Side
  align: Align
  instant?: Instant | undefined
  transitionStatus: TransitionStatus
}

export type AnchoredPositionerState<Instant extends string = string> = {
  open: boolean
  side: Side
  align: Align
  anchorHidden: boolean
  instant?: Instant | undefined
}

export type AnchoredViewportState<Instant extends string = string> = {
  activationDirection: string | undefined
  transitioning: boolean
  instant: Instant | undefined
}

export function anchoredPopupAttrs(state: AnchoredPopupState): Record<string, string | undefined> {
  return dataAttrs({
    open: state.open,
    closed: !state.open,
    side: state.side,
    align: state.align,
    'starting-style': state.transitionStatus === 'starting',
    'ending-style': state.transitionStatus === 'ending',
    instant: state.instant
  })
}

export function anchoredPositionerAttrs(
  state: AnchoredPositionerState
): Record<string, string | undefined> {
  return dataAttrs({
    open: state.open,
    closed: !state.open,
    side: state.side,
    align: state.align,
    'anchor-hidden': state.anchorHidden,
    instant: state.instant
  })
}
