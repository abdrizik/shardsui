<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { createFilter } from '$lib/internal/create-filter'

  const allItems = ['Apple', 'Banana', 'Cherry']

  let { onValueChange = undefined, onOpenChange = undefined, open = $bindable() } = $props()

  const filter = createFilter({ sensitivity: 'base' })

  let inputVal = $state('')

  const filteredItems = $derived(
    inputVal === '' ? allItems : allItems.filter((item) => filter.contains(item, inputVal))
  )
</script>

<Combobox.Root
  {onValueChange}
  {onOpenChange}
  {open}
  onInputValueChange={(v) => {
    inputVal = v
  }}
>
  <Combobox.Input data-testid="input" placeholder="Search..." />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          {#each filteredItems as item (item)}
            <Combobox.Item value={item.toLowerCase()}>{item}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
