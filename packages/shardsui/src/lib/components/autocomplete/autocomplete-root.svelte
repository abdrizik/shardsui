<script lang="ts" generics="Value = unknown">
  import type { ComponentProps } from 'svelte'
  import ComboboxShell from '$lib/components/combobox/combobox-shell.svelte'
  import type { HighlightReason } from '$lib/components/combobox/item-registry.svelte'
  import { createCoreFilter } from '$lib/internal/create-filter'
  import { stringifyAsLabel } from '$lib/internal/resolve-value-label'
  import { watch } from '$lib/internal/watch.svelte'

  type ShellProps = ComponentProps<typeof ComboboxShell<Value>>
  type FilterFn = Exclude<ShellProps['filter'], undefined>

  type Props = Omit<
    ShellProps,
    | 'value'
    | 'onValueChange'
    | 'inputValue'
    | 'onInputValueChange'
    | 'selectionMode'
    | 'isItemEqualToValue'
    | 'itemToStringLabel'
    | 'autoComplete'
    | 'formAutoComplete'
  > & {
    value?: string
    onValueChange?: (value: string) => void
    mode?: 'list' | 'both' | 'inline' | 'none'
  }

  let {
    value = $bindable(''),
    onValueChange,
    open = $bindable(false),
    openOnInputClick = false,
    mode = 'list',
    filter,
    locale,
    onItemHighlighted,
    itemToStringValue,
    children,
    ...rest
  }: Props = $props()

  let inlineInputValue = $state('')

  const baseFilter: FilterFn = $derived(
    filter !== undefined ? filter : createCoreFilter({ locale }).contains
  )

  const resolvedFilter = $derived.by((): FilterFn => {
    if (mode === 'inline' || mode === 'none') return null
    if (mode !== 'both' || baseFilter === null) return baseFilter
    const matches = baseFilter
    return (item, _query, itemToString) => matches(item, value.trim(), itemToString)
  })

  const isInlineEnabled = $derived(mode === 'inline' || mode === 'both')

  const resolvedInputValue = $derived(
    isInlineEnabled && inlineInputValue !== '' ? inlineInputValue : value
  )

  watch(
    () => value,
    () => {
      inlineInputValue = ''
    }
  )

  function applyInputValue(nextValue: string) {
    inlineInputValue = ''
    value = nextValue
  }

  function syncInlineCompletion(
    highlightedValue: Value | undefined,
    reason: HighlightReason,
    index: number
  ) {
    onItemHighlighted?.(highlightedValue, reason, index)
    if (reason === 'pointer') return
    inlineInputValue =
      isInlineEnabled && highlightedValue != null
        ? stringifyAsLabel(highlightedValue, itemToStringValue)
        : ''
  }
</script>

<ComboboxShell
  bind:inputValue={() => resolvedInputValue, applyInputValue}
  onInputValueChange={onValueChange}
  bind:open
  {openOnInputClick}
  {locale}
  autoComplete={mode}
  filter={resolvedFilter}
  onItemHighlighted={syncInlineCompletion}
  itemToStringLabel={itemToStringValue}
  selectionMode="none"
  {...rest}
>
  {@render children?.()}
</ComboboxShell>
