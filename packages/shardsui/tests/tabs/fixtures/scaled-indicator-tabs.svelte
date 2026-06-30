<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
</script>

<div style="transform: scale(0)">
  <Tabs.Root value={2}>
    <Tabs.List
      data-testid="tab-list"
      style="position: relative; width: 300px; display: flex; overflow: hidden"
    >
      <Tabs.Tab value={1} style="width: 100px; flex-shrink: 0">One</Tabs.Tab>
      <Tabs.Tab value={2} style="width: 100px; flex-shrink: 0">Two</Tabs.Tab>
      <Tabs.Indicator data-testid="bubble" />
    </Tabs.List>
  </Tabs.Root>
</div>
