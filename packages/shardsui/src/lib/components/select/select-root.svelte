<script lang="ts" generics="Value = unknown, Multiple extends boolean | undefined = false">
  import type { Snippet } from 'svelte'
  import { SelectRoot } from './select.svelte'
  import { SelectContext, type SelectValueType } from './context'
  import type { Group } from '$lib/internal/resolve-value-label'
  import { defaultItemEquality, type ItemEqualityComparer } from '$lib/internal/item-equality'
  import { visuallyHidden, visuallyHiddenInput } from '$lib/internal/visually-hidden'

  type Props = {
    id?: string
    value?: SelectValueType<Value, Multiple> | null
    onValueChange?: (
      value: SelectValueType<Value, Multiple> | (Multiple extends true ? never : null)
    ) => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
    onOpenChangeComplete?: (open: boolean) => void
    name?: string
    form?: string
    autoComplete?: string
    disabled?: boolean
    readOnly?: boolean
    required?: boolean
    modal?: boolean
    isItemEqualToValue?: ItemEqualityComparer<Value>
    items?:
      | ReadonlyArray<{ label: unknown; value: unknown }>
      | readonly Group<unknown>[]
      | Record<string, unknown>
    itemToStringLabel?: (item: Value) => string
    itemToStringValue?: (item: Value) => string
    multiple?: Multiple
    highlightItemOnHover?: boolean
    children?: Snippet
  }

  const uid = $props.id()

  let {
    id = uid,
    value = $bindable(),
    onValueChange,
    open = $bindable(false),
    onOpenChange,
    onOpenChangeComplete,
    name,
    form,
    autoComplete,
    disabled = false,
    readOnly = false,
    required = false,
    modal = true,
    isItemEqualToValue = defaultItemEquality,
    items,
    itemToStringLabel,
    itemToStringValue,
    multiple = false as Multiple,
    highlightItemOnHover = true,
    children
  }: Props = $props()

  const select = new SelectRoot(() => ({
    id,
    value,
    setValue: (next) => (value = next as SelectValueType<Value, Multiple> | null),
    onValueChange: (next) =>
      onValueChange?.(
        next as SelectValueType<Value, Multiple> | (Multiple extends true ? never : null)
      ),
    open,
    setOpen: (next) => (open = next),
    onOpenChange,
    onOpenChangeComplete,
    name,
    disabled,
    readOnly,
    required,
    modal,
    multiple: multiple as boolean,
    highlightItemOnHover,
    items,
    isItemEqualToValue: isItemEqualToValue as ItemEqualityComparer,
    itemToStringLabel: itemToStringLabel as ((item: unknown) => string) | undefined,
    itemToStringValue: itemToStringValue as ((item: unknown) => string) | undefined
  }))

  SelectContext.set(select)

  const hiddenInputValues = $derived.by(() => {
    const occurrences: Record<string, number> = {}
    return select.selectedValues.map((selectedValue) => {
      const serialized = select.serialize(selectedValue)
      const occurrence = occurrences[serialized] ?? 0
      occurrences[serialized] = occurrence + 1
      return { value: serialized, key: `${occurrence} ${serialized}` }
    })
  })
</script>

{@render children?.()}

<input
  bind:this={select.hiddenInputElement}
  id={select.hiddenInputName == null ? `${select.rootId}-hidden-input` : undefined}
  name={select.hiddenInputName}
  {form}
  autocomplete={autoComplete as HTMLInputElement['autocomplete']}
  value={select.serializedValue}
  disabled={select.disabled}
  required={required && !(multiple && select.selectedValues.length > 0)}
  readonly={readOnly}
  tabindex={-1}
  aria-hidden="true"
  style={select.resolvedName ? visuallyHiddenInput : visuallyHidden}
  onfocus={select.onfocus}
  onchange={select.onchange}
/>
{#if multiple && select.resolvedName}
  {#each hiddenInputValues as hiddenInputValue (hiddenInputValue.key)}
    <input
      type="hidden"
      name={select.resolvedName}
      {form}
      value={hiddenInputValue.value}
      disabled={select.disabled}
    />
  {/each}
{/if}
