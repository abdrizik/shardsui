<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type Country = { country: string; code: string }

  let {
    open = $bindable(true),
    onValueChange = undefined
  }: {
    open?: boolean
    onValueChange?: (value: unknown) => void
  } = $props()

  const items: Country[] = [
    { country: 'United States', code: 'US' },
    { country: 'Canada', code: 'CA' }
  ]
</script>

<Combobox.Root
  name="country"
  bind:open
  {onValueChange}
  isItemEqualToValue={(a: Country, b: Country) => a.code === b.code}
  itemToStringLabel={(item: Country) => item.country}
  itemToStringValue={(item: Country) => item.code}
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
