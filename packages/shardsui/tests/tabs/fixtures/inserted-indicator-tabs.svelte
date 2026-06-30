<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let { insertedTabWidth = null }: { insertedTabWidth?: number | null } = $props()
</script>

<Tabs.Root value={2}>
  <Tabs.List data-testid="tab-list" style="width: 320px; display: flex; overflow: hidden">
    {#if insertedTabWidth != null}
      <Tabs.Tab
        value={0}
        data-testid="inserted-tab"
        style="width: {insertedTabWidth}px; flex-shrink: 0"
      >
        Inserted
      </Tabs.Tab>
    {/if}
    <Tabs.Tab value={1} style="width: 100px; flex-shrink: 0">One</Tabs.Tab>
    <Tabs.Tab value={2} style="width: 100px; flex-shrink: 0">Two</Tabs.Tab>
    <Tabs.Indicator data-testid="bubble" />
  </Tabs.List>
</Tabs.Root>
