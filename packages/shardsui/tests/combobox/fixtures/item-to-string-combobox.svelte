<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  const items = [
    { country: 'United States', code: 'US' },
    { country: 'Canada', code: 'CA' },
    { country: 'Australia', code: 'AU' }
  ]

  let {
    value = $bindable(),
    onValueChange = undefined,
    open = $bindable(),
    name = undefined,
    multiple = false
  } = $props()
</script>

<Combobox.Root
  {value}
  {onValueChange}
  {open}
  {name}
  {multiple}
  {items}
  itemToStringValue={(item) => (item as (typeof items)[0]).code}
  itemToStringLabel={(item) => (item as (typeof items)[0]).country}
>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          {#each items as item (item.code)}
            <Combobox.Item value={item}>{item.country}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
