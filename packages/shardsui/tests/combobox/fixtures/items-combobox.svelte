<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  type RootProps = ComponentProps<typeof Combobox.Root>

  let {
    value = $bindable(),
    onValueChange,
    open = $bindable(),
    onOpenChange,
    items,
    filteredItems,
    filter,
    limit,
    openOnInputClick,
    autoComplete,
    name,
    multiple = false,
    label = (item) => String(item),
    withIndex = false,
    autoHighlight,
    onItemHighlighted
  }: {
    value?: RootProps['value']
    onValueChange?: RootProps['onValueChange']
    open?: boolean
    onOpenChange?: (open: boolean) => void
    items?: RootProps['items']
    filteredItems?: RootProps['filteredItems']
    filter?: RootProps['filter']
    limit?: number | undefined
    openOnInputClick?: boolean | undefined
    autoComplete?: string | undefined
    name?: string | undefined
    multiple?: boolean
    label?: (item: unknown) => string
    withIndex?: boolean
    autoHighlight?: boolean
    onItemHighlighted?: RootProps['onItemHighlighted']
  } = $props()

  const resolvedItems = $derived(
    items ?? (filteredItems === undefined ? ['apple', 'banana', 'cherry'] : undefined)
  )
</script>

<Combobox.Root
  items={resolvedItems}
  {filteredItems}
  {filter}
  {value}
  {onValueChange}
  {open}
  {onOpenChange}
  {limit}
  {openOnInputClick}
  {autoComplete}
  {name}
  {multiple}
  {autoHighlight}
  {onItemHighlighted}
>
  <Combobox.Input data-testid="input" placeholder="Search..." />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <ItemsList {label} {withIndex} />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
