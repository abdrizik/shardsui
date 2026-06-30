<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { ComboboxContext } from '$lib/components/combobox/context'
  import { isGroupedItems, type Group } from '$lib/internal/resolve-value-label'

  let {
    label = (item: unknown) => String(item),
    withIndex = false
  }: { label?: (item: unknown) => string; withIndex?: boolean } = $props()

  const combobox = ComboboxContext.get()
  const items = $derived(combobox.computedFilteredItems)
  const grouped = $derived(isGroupedItems(items as readonly unknown[]))
</script>

<Combobox.List data-testid="list">
  {#if grouped}
    {#each items as group (group)}
      <Combobox.Group>
        {#each (group as Group<unknown>).items as item (item)}
          <Combobox.Item value={item}>{label(item)}</Combobox.Item>
        {/each}
      </Combobox.Group>
    {/each}
  {:else}
    {#each items as item, index (item)}
      <Combobox.Item value={item} index={withIndex ? index : undefined}>{label(item)}</Combobox.Item
      >
    {/each}
  {/if}
</Combobox.List>
