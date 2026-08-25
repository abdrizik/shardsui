<script lang="ts">
  import { Combobox } from '$lib/components/combobox'
  import { ComboboxContext } from '$lib/components/combobox/context'
  import { isGroupedItems } from '$lib/internal/resolve-value-label'

  let {
    label = (item) => String(item),
    withIndex = false
  }: { label?: (item: unknown) => string; withIndex?: boolean } = $props()

  const combobox = ComboboxContext.get()
  const items = $derived(combobox.computedFilteredItems)
  const groups = $derived(isGroupedItems(items) ? items : undefined)
</script>

<Combobox.List data-testid="list">
  {#if groups}
    {#each groups as group (group)}
      <Combobox.Group>
        {#each group.items as item (item)}
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
