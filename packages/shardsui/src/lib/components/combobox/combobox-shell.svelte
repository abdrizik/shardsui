<script lang="ts" generics="Value = unknown, Multiple extends boolean | undefined = false">
  import { untrack, type Snippet } from 'svelte'
  import { attachElement } from '$lib/internal/attach-element'
  import { ComboboxRoot } from './combobox.svelte'
  import type { HighlightReason } from './item-registry.svelte'
  import type { HTMLInputAttributes } from 'svelte/elements'
  import { ComboboxContext, type ComboboxValueType } from './context'
  import { defaultItemEquality, type ItemEqualityComparer } from '$lib/internal/item-equality'
  import { visuallyHidden, visuallyHiddenInput } from '$lib/internal/visually-hidden'
  import type { Group } from '$lib/internal/resolve-value-label'

  type Props = {
    id?: string
    value?: ComboboxValueType<Value, Multiple> | null
    onValueChange?: (value: ComboboxValueType<Value, Multiple> | null) => void
    inputValue?: string
    onInputValueChange?: (value: string) => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    name?: string
    form?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    modal?: boolean
    loopFocus?: boolean
    grid?: boolean
    isItemEqualToValue?: ItemEqualityComparer<Value>
    selectionMode?: 'single' | 'multiple' | 'none'
    openOnInputClick?: boolean
    autoHighlight?: boolean | 'always'
    highlightItemOnHover?: boolean
    keepHighlight?: boolean
    onItemHighlighted?: (
      highlightedValue: Value | undefined,
      reason: HighlightReason,
      index: number
    ) => void
    itemToStringValue?: (item: Value) => string
    itemToStringLabel?: (item: Value) => string
    items?: readonly NoInfer<Value>[] | readonly Group<NoInfer<Value>>[] | undefined
    filteredItems?: readonly NoInfer<Value>[] | readonly Group<NoInfer<Value>>[] | undefined
    filter?:
      | null
      | ((item: Value, query: string, itemToString?: (item: Value) => string) => boolean)
      | undefined
    limit?: number | undefined
    locale?: Intl.LocalesArgument | undefined
    inline?: boolean | undefined
    virtualized?: boolean | undefined
    submitOnItemClick?: boolean | undefined
    autoComplete?: 'list' | 'both' | 'inline' | 'none' | undefined
    formAutoComplete?: string | undefined
    children?: Snippet
  }

  let {
    id,
    value = $bindable(),
    onValueChange,
    inputValue = $bindable(),
    onInputValueChange,
    open = $bindable(false),
    onOpenChange,
    onOpenChangeComplete,
    name,
    form,
    disabled = false,
    readOnly = false,
    required = false,
    modal = false,
    loopFocus = true,
    grid = false,
    isItemEqualToValue = defaultItemEquality,
    selectionMode,
    openOnInputClick = true,
    autoHighlight = false,
    highlightItemOnHover = true,
    keepHighlight = false,
    onItemHighlighted,
    itemToStringValue,
    itemToStringLabel,
    items,
    filteredItems,
    filter,
    limit = -1,
    locale,
    inline = false,
    virtualized = false,
    autoComplete = 'list',
    formAutoComplete,
    submitOnItemClick = false,
    children
  }: Props = $props()

  untrack(() => {
    if (value === undefined) {
      value = (selectionMode === 'multiple' ? [] : null) as ComboboxValueType<
        Value,
        Multiple
      > | null
    }
  })

  const uid = $props.id()

  const combobox = new ComboboxRoot(() => ({
    id: id ?? uid,
    value,
    setValue: (v) => (value = v as ComboboxValueType<Value, Multiple> | null),
    onValueChange: (v) => onValueChange?.(v as ComboboxValueType<Value, Multiple> | null),
    inputValue,
    setInputValue: (s) => (inputValue = s),
    onInputValueChange,
    open,
    setOpen: (v) => (open = v),
    onOpenChange,
    onOpenChangeComplete,
    name,
    form,
    disabled,
    readOnly,
    required,
    modal,
    loopFocus,
    grid,
    isItemEqualToValue: isItemEqualToValue as ItemEqualityComparer,
    selectionMode,
    openOnInputClick,
    autoHighlight,
    highlightItemOnHover,
    keepHighlight,
    onItemHighlighted: (hv, reason, index) =>
      onItemHighlighted?.(hv as Value | undefined, reason, index),
    itemToStringValue: itemToStringValue as ((item: unknown) => string) | undefined,
    itemToStringLabel: itemToStringLabel as ((item: unknown) => string) | undefined,
    items,
    filteredItems,
    filter: filter as
      | null
      | ((item: unknown, query: string, itemToString?: (item: unknown) => string) => boolean)
      | undefined,
    limit,
    locale,
    inline,
    virtualized,
    autoComplete,
    submitOnItemClick
  }))

  ComboboxContext.set(combobox)

  const hiddenInputName = $derived(
    combobox.multiple || combobox.inputOwnsFormValue ? undefined : combobox.name
  )
  const hiddenInputRequired = $derived(
    required && !(combobox.multiple && combobox.hasSelectedValue)
  )

  const hiddenInputValues = $derived.by(() => {
    const occurrences: Record<string, number> = {}
    return combobox.selectedValues.map((selectedValue) => {
      const serialized = combobox.serialize(selectedValue)
      const occurrence = occurrences[serialized] ?? 0
      occurrences[serialized] = occurrence + 1
      return { value: serialized, key: `${occurrence} ${serialized}` }
    })
  })

  function onfocus() {
    if (combobox.inputInsidePopup) {
      combobox.triggerElement?.focus()
      return
    }
    ;(combobox.inputElement ?? combobox.triggerElement)?.focus()
  }
</script>

{@render children?.()}

{#if combobox.name && combobox.multiple}
  {#each hiddenInputValues as hiddenInputValue (hiddenInputValue.key)}
    <input
      type="hidden"
      name={combobox.name}
      {form}
      value={hiddenInputValue.value}
      disabled={combobox.disabled}
    />
  {/each}
{/if}
<input
  {@attach attachElement((el) => (combobox.hiddenInputElement = el))}
  id={hiddenInputName == null ? `${combobox.rootId}-hidden-input` : undefined}
  {form}
  name={hiddenInputName}
  value={combobox.serializedValue}
  disabled={combobox.disabled}
  required={hiddenInputRequired}
  readonly={readOnly}
  autocomplete={formAutoComplete as HTMLInputAttributes['autocomplete']}
  tabindex={-1}
  aria-hidden="true"
  style={hiddenInputName ? visuallyHiddenInput : visuallyHidden}
  {onfocus}
  oninput={combobox.commitAutofilledValue}
  onchange={combobox.commitAutofilledValue}
/>
