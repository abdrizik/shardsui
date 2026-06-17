import type { FieldState } from '$lib/components/field/field.svelte'
import { Context } from '$lib/internal/context'
import type {
  Align,
  AnchorPositioning,
  Side
} from '$lib/internal/floating/anchor-positioning.svelte'
import type { TransitionStatus } from '$lib/internal/transition-status.svelte'
import type { ComboboxRoot } from './combobox.svelte'

export type ComboboxValueType<Value, Multiple extends boolean | undefined> = Multiple extends true
  ? Value[]
  : Value

export type ComboboxItemContext = { selected: boolean }

export type ComboboxItemState = {
  disabled: boolean
  selected: boolean
  highlighted: boolean
}

export type ComboboxTriggerState = FieldState & {
  open: boolean
  disabled: boolean
  popupSide: Side | null
  listEmpty: boolean
  placeholder: boolean
}

export type ComboboxInputGroupState = FieldState & {
  open: boolean
  disabled: boolean
  readOnly: boolean
  popupSide: Side | null
  listEmpty: boolean
  placeholder: boolean
}

export type ComboboxClearState = {
  disabled: boolean
  visible: boolean
  open: boolean
  transitionStatus: TransitionStatus
}

export type ComboboxItemIndicatorState = {
  selected: boolean
  transitionStatus: TransitionStatus
}

export type ComboboxChipState = { disabled: boolean }

export type ComboboxChipRemoveState = { disabled: boolean }

export type ComboboxListState = { empty: boolean }

export type ComboboxPopupState = {
  open: boolean
  side: Side
  align: Align
  anchorHidden: boolean
  transitionStatus: TransitionStatus
  empty: boolean
}

export type ComboboxPositionerState = {
  open: boolean
  side: Side
  align: Align
  anchorHidden: boolean
  empty: boolean
}

export type ComboboxGroupContext = { labelId: string | undefined }

export type ComboboxGroupItemsContext = { items: readonly unknown[] }

export type ComboboxChipContext = { index: number }

export type ComboboxChipsContext = {
  highlightedIndex: number | undefined
  elements: HTMLElement[]
}

export const ComboboxContext = new Context<ComboboxRoot>('Combobox.Root')

export const ComboboxPositionerContext = new Context<AnchorPositioning>('Combobox.Positioner')

export const ComboboxItemContext = new Context<ComboboxItemContext>('Combobox.Item')

export const ComboboxGroupContext = new Context<ComboboxGroupContext>('Combobox.Group')

export const ComboboxGroupItemsContext = new Context<ComboboxGroupItemsContext>('Combobox.Group')

export const ComboboxChipContext = new Context<ComboboxChipContext>('Combobox.Chip')

export const ComboboxChipsContext = new Context<ComboboxChipsContext>('Combobox.Chips')

export const ComboboxRowContext = new Context<boolean>('Combobox.Row', false)
