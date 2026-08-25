<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable<unknown>(undefined),
    items
  }: {
    value?: unknown
    items?: Array<unknown> | undefined
  } = $props()

  const renderItems = $derived(items ?? [value].filter((v) => v !== undefined && v !== null))

  function labelFor(item: unknown): string {
    if (item instanceof Object && 'label' in item) {
      return String(item.label)
    }
    return String(item)
  }
</script>

<Combobox.Root {value} {items}>
  <Combobox.Trigger data-testid="value">
    <Combobox.Value />
  </Combobox.Trigger>
  <Combobox.Portal>
    <Combobox.Positioner>
      <Combobox.Popup>
        <Combobox.List>
          {#each renderItems as item, i (i)}
            <Combobox.Item value={item}>{labelFor(item)}</Combobox.Item>
          {/each}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Positioner>
  </Combobox.Portal>
</Combobox.Root>
