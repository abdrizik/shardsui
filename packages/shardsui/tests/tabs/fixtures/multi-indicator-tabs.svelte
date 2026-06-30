<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
</script>

<Tabs.Root value={2}>
  <Tabs.List data-testid="tab-list" style="width: 300px; display: flex; overflow: hidden">
    <Tabs.Tab value={1} data-testid="first-tab" style="width: 100px; flex-shrink: 0">One</Tabs.Tab>
    <Tabs.Tab value={2} style="width: 100px; flex-shrink: 0">Two</Tabs.Tab>
    <Tabs.Tab value={3} style="width: 100px; flex-shrink: 0">Three</Tabs.Tab>
    <Tabs.Indicator data-testid="bubble" />
    <Tabs.Indicator data-testid="second-bubble" />
  </Tabs.List>
</Tabs.Root>
