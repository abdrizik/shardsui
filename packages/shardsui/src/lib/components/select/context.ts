import type { FieldState } from '$lib/components/field/field.svelte'
import { Context } from '$lib/internal/context'
import type {
  Align,
  AnchorPositioning,
  Side
} from '$lib/internal/floating/anchor-positioning.svelte'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'
import type { SelectRoot } from './select.svelte'

export type SelectTriggerState = FieldState & {
  open: boolean
  disabled: boolean
  readOnly: boolean
  popupSide: Side | null
  value: unknown
  placeholder: boolean
}

export type SelectIconState = {
  open: boolean
}

export type SelectPopupState = {
  open: boolean
  transitionStatus: TransitionStatus
  side: Side
  align: Align
}

export type SelectItemState = {
  selected: boolean
  highlighted: boolean
  disabled: boolean
}

export type SelectItemIndicatorState = {
  selected: boolean
  transitionStatus: TransitionStatus
}

export type SelectScrollArrowState = {
  direction: 'up' | 'down'
  visible: boolean
  side: Side
  transitionStatus: TransitionStatus
}

export type SelectPositionerState = {
  open: boolean
  side: Side
  align: Align
  anchorHidden: boolean
}

export type SelectValueType<Value, Multiple extends boolean | undefined> = Multiple extends true
  ? Value[]
  : Value

export type SelectItem = {
  element: HTMLElement
  value: unknown
}

export type SelectItemContext = {
  selected: boolean
}

export type SelectGroupContext = {
  labelId: string | undefined
}

export const SelectContext = new Context<SelectRoot>('Select.Root')

export const SelectPositionerContext = new Context<AnchorPositioning>('Select.Positioner')

export const SelectItemContext = new Context<SelectItemContext>('Select.Item')

export const SelectGroupContext = new Context<SelectGroupContext>('Select.Group')
