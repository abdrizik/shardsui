import type {
  AnchoredPopupState,
  AnchoredPositionerState,
  AnchoredViewportState
} from '$lib/internal/anchored-state'
import { Context } from '$lib/internal/context'
import type { AnchorPositioning } from '$lib/internal/floating/anchor-positioning.svelte'
import type { FloatingTreeEvents } from '$lib/internal/floating/floating-tree.svelte'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'
import type { MenuRoot } from './menu.svelte'

export type MenuInstantType = 'group' | 'click' | 'dismiss' | 'trigger-change'

export type MenuPopupState = AnchoredPopupState<MenuInstantType> & { nested: boolean }

export type MenuPositionerState = AnchoredPositionerState<MenuInstantType> & { nested: boolean }

export type MenuViewportState = AnchoredViewportState<MenuInstantType>

export type MenuOpenChangeReason =
  | 'trigger-press'
  | 'trigger-hover'
  | 'trigger-focus'
  | 'focus-out'
  | 'item-press'
  | 'sibling-open'
  | 'list-navigation'
  | 'outside-press'
  | 'escape-key'
  | 'imperative-action'
  | 'cancel-open'

export type MenuOpenChangeEvent = {
  open: boolean
  nodeId: string
  parentNodeId: string | null
  reason: MenuOpenChangeReason | null
}

export type MenuItemHoverEvent = {
  nodeId: string
  target: Element
}

export type MenuTreeEvents = FloatingTreeEvents & {
  menuopenchange: MenuOpenChangeEvent
  itemhover: MenuItemHoverEvent
  close: { domEvent: Event; reason: MenuOpenChangeReason }
}

export type MenuGroupContext = {
  labelId: string | undefined
}

export type MenuRadioGroupContext = {
  value: unknown
  setValue: (value: unknown) => void
  disabled: boolean
}

export const MenuContext = new Context<MenuRoot>('Menu.Root')

export const MenuPositionerContext = new Context<AnchorPositioning>('Menu.Positioner')

export const MenuGroupContext = new Context<MenuGroupContext>('Menu.Group')

export const MenuRadioGroupContext = new Context<MenuRadioGroupContext>('Menu.RadioGroup')

export const MenuCheckboxItemContext = new Context<MenuCheckableItemState>('Menu.CheckboxItem')

export const MenuRadioItemContext = new Context<MenuCheckableItemState>('Menu.RadioItem')

export const MenuSubmenuContext = new Context<true>('Menu.SubmenuRoot')

export type MenuItemState = {
  highlighted: boolean
  disabled: boolean
}

export type MenuCheckableItemState = MenuItemState & {
  checked: boolean
}

export type MenuItemIndicatorState = MenuCheckableItemState & {
  transitionStatus: TransitionStatus
}

export type MenuLinkItemState = {
  highlighted: boolean
}

export type MenuRadioGroupState = {
  disabled: boolean
}

export type MenuSubmenuTriggerState = MenuItemState & {
  open: boolean
}

export type MenuTriggerState = {
  disabled: boolean
  open: boolean
}
