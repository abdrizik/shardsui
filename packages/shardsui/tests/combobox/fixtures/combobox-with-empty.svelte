<script lang="ts">
  import { untrack } from 'svelte'
  import { Combobox } from '$lib/components/combobox'
  import { createFilter } from '$lib/internal/create-filter'

  type Props = {
    open?: boolean
    items?: string[]
    inputValue?: string
    onValueChange?: (value: unknown) => void
    as?: keyof HTMLElementTagNameMap
  }

  let {
    open = $bindable(),
    items = ['Apple', 'Banana', 'Cherry'],
    inputValue = '',
    onValueChange,
    as = 'div'
  }: Props = $props()

  const filter = createFilter({ sensitivity: 'base' })

  let inputVal = $state(untrack(() => inputValue))

  const filteredItems = $derived(
    inputVal === '' ? items : items.filter((item) => filter.contains(item, inputVal))
  )
</script>

<Combobox.Root
  {open}
  {onValueChange}
  onInputValueChange={(v) => {
    inputVal = v
  }}
>
  <Combobox.Input data-testid="input" placeholder="Search..." />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.Empty {as} data-testid="empty">No results</Combobox.Empty>
        <Combobox.List data-testid="list">
          {#each filteredItems as item (item)}
            <Combobox.Item value={item.toLowerCase()}>{item}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
