import type {
  ComboboxInputGroupState,
  ComboboxItemState,
  ComboboxTriggerState
} from '$lib/components/combobox/context'
import {
  InputGroup as ComboboxInputGroup,
  Item as ComboboxItem,
  Trigger as ComboboxTrigger
} from '$lib/components/combobox/index.parts'
import type { Component, ComponentProps, Snippet } from 'svelte'

type NarrowPayload<Props, State> = Component<
  Omit<Props, 'children'> & { children?: Snippet<[State]> }
>

export {
  Arrow,
  Backdrop,
  Clear,
  Collection,
  Empty,
  Group,
  GroupLabel,
  Icon,
  Input,
  List,
  Popup,
  Portal,
  Positioner,
  Row,
  Status
} from '$lib/components/combobox/index.parts'
export { createCoreFilter as createFilter } from '$lib/internal/create-filter'
export { default as Separator } from '$lib/internal/listbox-separator.svelte'
export { default as Root } from './autocomplete-root.svelte'
export { default as Value } from './autocomplete-value.svelte'

export const Item = ComboboxItem as NarrowPayload<
  ComponentProps<typeof ComboboxItem>,
  Omit<ComboboxItemState, 'selected'>
>

export const Trigger = ComboboxTrigger as NarrowPayload<
  ComponentProps<typeof ComboboxTrigger>,
  Omit<ComboboxTriggerState, 'placeholder'>
>

export const InputGroup = ComboboxInputGroup as NarrowPayload<
  ComponentProps<typeof ComboboxInputGroup>,
  Omit<ComboboxInputGroupState, 'placeholder'>
>
