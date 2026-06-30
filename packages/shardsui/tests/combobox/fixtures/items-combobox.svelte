<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import ItemsList from './items-list.svelte'

  let {
    value = $bindable(),
    onValueChange = undefined,
    open = $bindable(),
    onOpenChange = undefined,
    items = undefined as readonly unknown[] | undefined,
    filteredItems = undefined,
    filter = undefined,
    limit = undefined as number | undefined,
    openOnInputClick = undefined as boolean | undefined,
    autoComplete = undefined as string | undefined,
    name = undefined,
    multiple = false,
    label = (item: unknown) => String(item),
    withIndex = false,
    autoHighlight = undefined as boolean | undefined,
    onItemHighlighted = undefined
  }: {
    value?: unknown
    onValueChange?: (value: unknown) => void
    open?: boolean
    onOpenChange?: (open: boolean) => void
    items?: readonly unknown[]
    filteredItems?: readonly unknown[] | undefined
    filter?: ((item: unknown, query: string) => boolean) | null | undefined
    limit?: number | undefined
    openOnInputClick?: boolean | undefined
    autoComplete?: string | undefined
    name?: string | undefined
    multiple?: boolean
    label?: (item: unknown) => string
    withIndex?: boolean
    autoHighlight?: boolean
    onItemHighlighted?: (value: unknown) => void
  } = $props()

  const resolvedItems = $derived(
    items ?? (filteredItems === undefined ? ['apple', 'banana', 'cherry'] : undefined)
  )
</script>

<Combobox.Root
  items={resolvedItems as never}
  filteredItems={filteredItems as never}
  filter={filter as never}
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
