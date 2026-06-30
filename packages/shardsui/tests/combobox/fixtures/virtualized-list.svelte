<script lang="ts">
  import { Combobox } from '$lib/components/combobox'

  let {
    items,
    windowStart = 0,
    windowSize = 5
  }: {
    items: string[]
    windowStart?: number
    windowSize?: number
  } = $props()

  const visible = $derived.by(() => {
    const start = Math.min(windowStart, Math.max(0, items.length - windowSize))
    return items.slice(start, start + windowSize).map((item, i) => ({ item, index: start + i }))
  })
</script>

<Combobox.List data-testid="list">
  {#each visible as { item, index } (item)}
    <Combobox.Item {index} value={item} data-index={index}>{item}</Combobox.Item>
  {/each}
</Combobox.List>
