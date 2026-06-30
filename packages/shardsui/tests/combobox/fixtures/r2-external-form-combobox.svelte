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
    ] as Country[],
    onsubmit = undefined as ((event: SubmitEvent) => void) | undefined
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
  items={items as never}
  itemToStringLabel={((item: Country) => item.label) as never}
  itemToStringValue={((item: Country) => item.code) as never}
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
