<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  const values = [1, 2, 3, 4, 5]
</script>

<div style="transform: scale(1.5)">
  <Tabs.Root value={3}>
    <Tabs.List
      data-testid="tab-list"
      style="width: 240px; display: flex; gap: 8px; overflow-x: auto; border: 6px solid black; padding: 4px"
    >
      {#each values as value (value)}
        <Tabs.Tab {value} style="flex: 0 0 120px">Tab {value}</Tabs.Tab>
      {/each}
      <Tabs.Indicator data-testid="bubble" />
    </Tabs.List>
  </Tabs.Root>
</div>
