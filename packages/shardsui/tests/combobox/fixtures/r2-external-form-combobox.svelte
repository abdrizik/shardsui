<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type Country = { code: string; label: string }

  let {
    multiple = false,
    name = 'country',
    value = $bindable(),
    items = [
      { code: 'US', label: 'United States' },
      { code: 'CA', label: 'Canada' },
      { code: 'AU', label: 'Australia' }
    ],
    onsubmit
  }: {
    multiple?: boolean
    name?: string
    value?: Country | Country[] | null
    items?: Country[]
    onsubmit?: (event: SubmitEvent) => void
  } = $props()
</script>

<form id="external-form" {onsubmit}>
  <button type="submit">Submit</button>
</form>

<Combobox.Root
  {multiple}
  {name}
  {value}
  form="external-form"
  {items}
  itemToStringLabel={(item: Country) => item.label}
  itemToStringValue={(item: Country) => item.code}
>
  <Combobox.Input data-testid="input" />
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup data-testid="popup">
        <Combobox.List data-testid="list">
          {#each items as item (item.code)}
            <Combobox.Item value={item}>{item.label}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
