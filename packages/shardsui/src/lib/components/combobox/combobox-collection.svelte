<script lang="ts" generics="Item">
  import type { Snippet } from 'svelte'
  import { isGroupedItems } from '$lib/internal/resolve-value-label'
  import { ComboboxContext, ComboboxGroupItemsContext } from './context'

  type Props = {
    children?: Snippet<[Item, number]>
  }

  let { children }: Props = $props()

  const combobox = ComboboxContext.get()
  const group = ComboboxGroupItemsContext.getOr()

  const itemsToRender = $derived((group ? group.items : combobox.computedFilteredItems) as Item[])

  const isOuterGroupPass = $derived(!group && isGroupedItems(itemsToRender))

  const rows = $derived.by(() => {
    const occurrences: Record<string, number> = {}
    return itemsToRender.map((item, index) => {
      if (isOuterGroupPass) return { item, index, key: index }
      const serialized = combobox.serialize(item)
      const occurrence = occurrences[serialized] ?? 0
      occurrences[serialized] = occurrence + 1
      return { item, index, key: `${occurrence} ${serialized}` }
    })
  })
</script>

{#each rows as row (row.key)}
  {@render children?.(row.item, row.index)}
{/each}
