<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { createFilter } from '$lib/internal/create-filter'
  import VirtualizedNoIndexList from './virtualized-no-index-list.svelte'

  let {
    value = $bindable(),
    open = $bindable(),
    onValueChange,
    items = ['one', 'two', 'three', 'four', 'five']
  }: {
    value?: unknown
    open?: boolean
    onValueChange?: (value: unknown) => void
    items?: string[]
  } = $props()

  const filter = createFilter()
  let inputValue = $state('')
  const filteredItems = $derived(
    inputValue.trim() === '' ? items : items.filter((item) => filter.contains(item, inputValue))
  )
</script>

<Combobox.Root
  virtualized
  bind:inputValue
  {filteredItems}
  filter={null}
  {value}
  {open}
  {onValueChange}
>
  <Combobox.Input data-testid="input" placeholder="Search..." />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <VirtualizedNoIndexList items={filteredItems} />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
