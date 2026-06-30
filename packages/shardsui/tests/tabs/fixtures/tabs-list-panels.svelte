<script lang="ts">
  import { Tabs } from '$lib/components/tabs'

  let { loopFocus = true }: { loopFocus?: boolean } = $props()
</script>

<Tabs.Root>
  <Tabs.List {loopFocus}>
    <Tabs.Tab value={0} data-testid="tab-0">Tab 1</Tabs.Tab>
    <Tabs.Tab value={1} data-testid="tab-1">Tab 2</Tabs.Tab>
    <Tabs.Tab value={2} data-testid="tab-2">Tab 3</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value={0} keepMounted data-testid="panel-0">Panel 1</Tabs.Panel>
  <Tabs.Panel value={1} keepMounted data-testid="panel-1">Panel 2</Tabs.Panel>
  <Tabs.Panel value={2} keepMounted id="custom-panel-id" data-testid="panel-2">Panel 3</Tabs.Panel>
</Tabs.Root>
