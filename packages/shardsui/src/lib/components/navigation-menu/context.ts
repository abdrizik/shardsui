import { Context } from '$lib/internal/context'
import type {
  Align,
  AnchorPositioning,
  Side
} from '$lib/internal/floating/anchor-positioning.svelte'
import type { Composite } from '$lib/internal/floating/composite.svelte'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'
import type { ActivationDirection, NavigationMenuRoot } from './navigation-menu.svelte'

export type NavigationMenuItemContext = {
  value: unknown
}

export type NavigationMenuRootState = {
  open: boolean
  nested: boolean
}

export type NavigationMenuListState = {
  open: boolean
}

export type NavigationMenuTriggerState = {
  open: boolean
}

export type NavigationMenuIconState = {
  open: boolean
}

export type NavigationMenuLinkState = {
  active: boolean
}

export type NavigationMenuContentState = {
  open: boolean
  transitionStatus: TransitionStatus
  activationDirection: ActivationDirection
}

export type NavigationMenuPositionerState = {
  open: boolean
  side: Side
  align: Align
  anchorHidden: boolean
  instant: boolean
}

export type NavigationMenuPopupState = {
  open: boolean
  transitionStatus: TransitionStatus
  side: Side
  align: Align
  anchorHidden: boolean
}

export const NavigationMenuContext = new Context<NavigationMenuRoot>('NavigationMenu.Root')

export const NavigationMenuItemContext = new Context<NavigationMenuItemContext>(
  'NavigationMenu.Item'
)

export const NavigationMenuCompositeContext = new Context<Composite>('NavigationMenu.List')

export const NavigationMenuPositionerContext = new Context<AnchorPositioning>(
  'NavigationMenu.Positioner'
)
