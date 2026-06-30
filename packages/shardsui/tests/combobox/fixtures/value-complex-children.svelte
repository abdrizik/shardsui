<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type Item = { id: number; name: string; nested: { data: string } }

  let { value = $bindable<Item | null>(null) } = $props()
</script>

<Combobox.Root {value}>
  <Combobox.Value>
    {#snippet children(val: unknown)}
      {@const item = val as Item | null}
      <div data-testid="value">{item ? `${item.name} (${item.id})` : 'No value'}</div>
    {/snippet}
  </Combobox.Value>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Item {value}>Test Item</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
