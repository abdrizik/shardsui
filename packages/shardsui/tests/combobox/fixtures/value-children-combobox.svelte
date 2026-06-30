<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  type Item = { value: string; label: string }

  let {
    value = $bindable<unknown>(undefined),
    multiple = false,
    items = undefined as Item[] | undefined,
    placeholder = undefined as string | undefined
  } = $props()
</script>

<Combobox.Root
  {value}
  {multiple}
  items={items as never}
  itemToStringLabel={items ? (item: unknown) => (item as Item).label : undefined}
>
  <Combobox.Trigger data-testid="trigger">
    <Combobox.Value {placeholder}>
      {#snippet children(v)}
        <span data-testid="value-children">{v == null ? 'NONE' : JSON.stringify(v)}</span>
      {/snippet}
    </Combobox.Value>
  </Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          <Combobox.Item value="apple">Apple</Combobox.Item>
          <Combobox.Item value="banana">Banana</Combobox.Item>
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
