<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
</script>

<Tabs.Root value="tab-0">
  <Tabs.List>
    <Tabs.Tab value="tab-0">Tab 0</Tabs.Tab>
    <Tabs.Tab value="tab-1" id="explicit-tab-id-1">Tab 1</Tabs.Tab>
    <Tabs.Tab value="tab-2">Tab 2</Tabs.Tab>
    <Tabs.Tab value="tab-3" id="explicit-tab-id-3">Tab 3</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="tab-1" keepMounted>Panel 1</Tabs.Panel>
  <Tabs.Panel value="tab-0" keepMounted>Panel 0</Tabs.Panel>
  <Tabs.Panel value="tab-2" keepMounted>Panel 2</Tabs.Panel>
  <Tabs.Panel value="tab-3" keepMounted>Panel 3</Tabs.Panel>
</Tabs.Root>
