<script lang="ts">
  import { Tabs } from '$lib/components/tabs'
  let { value = $bindable(0), onValueChange = undefined, activateOnFocus = false } = $props()
</script>

<Tabs.Root bind:value {onValueChange} orientation="vertical" data-testid="root">
  <Tabs.List {activateOnFocus}>
    <Tabs.Tab value={0} style="display: block">Tab 1</Tabs.Tab>
    <Tabs.Tab value={1} style="display: block">Tab 2</Tabs.Tab>
    <Tabs.Tab value={2} style="display: block">Tab 3</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value={0} keepMounted>Panel 1</Tabs.Panel>
  <Tabs.Panel value={1} keepMounted>Panel 2</Tabs.Panel>
  <Tabs.Panel value={2} keepMounted>Panel 3</Tabs.Panel>
</Tabs.Root>
