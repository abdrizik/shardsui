<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    value = $bindable<unknown>(undefined),
    items = undefined
  }: {
    value?: unknown
    items?: Array<unknown> | undefined
  } = $props()

  const renderItems = $derived(
    items ?? ([value] as unknown[]).filter((v) => v !== undefined && v !== null)
  )

  function labelFor(item: unknown): string {
    if (item && typeof item === 'object' && 'label' in (item as Record<string, unknown>)) {
      return String((item as Record<string, unknown>).label)
    }
    return String(item)
  }
</script>

<Combobox.Root {value} items={items as never}>
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
