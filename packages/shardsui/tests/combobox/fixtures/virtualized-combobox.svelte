<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { createFilter } from '$lib/internal/create-filter'
  import VirtualizedList from './virtualized-list.svelte'

  let {
    value = $bindable(),
    open = $bindable(),
    onValueChange,
    count = 100,
    windowSize = 5
  }: {
    value?: string | null
    open?: boolean
    onValueChange?: (value: unknown) => void
    count?: number
    windowSize?: number
  } = $props()

  const allItems = $derived(Array.from({ length: count }, (_, i) => `item-${i}`))
  const filter = createFilter()
  let inputValue = $state('')
  const filteredItems = $derived(
    inputValue.trim() === ''
      ? allItems
      : allItems.filter((item) => filter.contains(item, inputValue))
  )

  let windowStart = $state(0)

  function handleItemHighlighted(item: string | undefined) {
    if (item == null) return
    const index = filteredItems.indexOf(item)
    if (index < 0) return
    windowStart = Math.max(
      0,
      Math.min(index - (windowSize >> 1), Math.max(0, filteredItems.length - windowSize))
    )
  }
</script>

<Combobox.Root
  virtualized
  bind:inputValue
  {filteredItems}
  filter={null}
  {value}
  {open}
  {onValueChange}
  onItemHighlighted={handleItemHighlighted}
>
  <Combobox.Input data-testid="input" placeholder="Search..." />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <VirtualizedList items={filteredItems} {windowStart} {windowSize} />
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
