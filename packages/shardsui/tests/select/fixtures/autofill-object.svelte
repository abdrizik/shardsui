<script lang="ts">
  import { Select } from '$lib/components/select'

  type Country = { country: string; code: string }

  let {
    name = 'country',
    multiple = false
  }: {
    name?: string
    multiple?: boolean
  } = $props()

  const items: Country[] = [
    { country: 'United States', code: 'US' },
    { country: 'Canada', code: 'CA' }
  ]
</script>

<Select.Root
  {name}
  {multiple}
  isItemEqualToValue={(a: Country, b: Country) => a.code === b.code}
  itemToStringLabel={(item: Country) => item.country}
  itemToStringValue={(item: Country) => item.code}
>
  <Select.Trigger data-testid="trigger">
    <Select.Value />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        {#each items as item (item.code)}
          <Select.Item value={item}>{item.country}</Select.Item>
        {/each}
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
